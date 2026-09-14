import {
  GraphQLError,
  Kind,
  valueFromASTUntyped,
  type ASTNode,
  type FieldNode,
  type FragmentDefinitionNode,
  type GraphQLField,
  type GraphQLInterfaceType,
  type GraphQLObjectType,
  type GraphQLSchema,
  type OperationDefinitionNode,
  type SelectionNode,
  type ValidationContext,
  type ValidationRule,
} from "graphql";
import type { Plugin } from "graphql-yoga";
import {
  GRAPHQL_DEFAULT_LIST_CARDINALITY,
  GRAPHQL_MAX_LIST_CARDINALITY,
  MAX_GRAPHQL_ALIASES,
  MAX_GRAPHQL_BODY_BYTES,
  MAX_GRAPHQL_COMPLEXITY,
  MAX_GRAPHQL_DEPTH,
} from "../../lib/limits";

type BudgetStats = { depth: number; aliases: number; complexity: number };
type FieldParent = GraphQLObjectType | GraphQLInterfaceType;

function typeCtorName(type: unknown): string {
  if (!type || typeof type !== "object") return "";
  return (type as { constructor?: { name?: string } }).constructor?.name ?? "";
}

function unwrapNonNull(type: unknown): unknown {
  if (
    typeCtorName(type) === "GraphQLNonNull" &&
    type &&
    typeof type === "object" &&
    "ofType" in type
  ) {
    return (type as { ofType: unknown }).ofType;
  }
  return type;
}

function namedType(type: unknown): unknown {
  let current = unwrapNonNull(type);
  while (
    typeCtorName(current) === "GraphQLList" &&
    current &&
    typeof current === "object" &&
    "ofType" in current
  ) {
    current = unwrapNonNull((current as { ofType: unknown }).ofType);
  }
  return current;
}

function isListOutput(type: unknown): boolean {
  return typeCtorName(unwrapNonNull(type)) === "GraphQLList";
}

function asFieldParent(type: unknown): FieldParent | null {
  if (!type || typeof type !== "object") return null;
  if (typeof (type as FieldParent).getFields !== "function") return null;
  return type as FieldParent;
}

function isIntrospectionField(name: string): boolean {
  return name === "__schema" || name === "__type" || name === "__typename";
}

function isIntrospectionOperation(selections: ReadonlyArray<SelectionNode>): boolean {
  return (
    selections.length > 0 &&
    selections.every(
      (selection) => selection.kind === Kind.FIELD && isIntrospectionField(selection.name.value),
    )
  );
}

function fragmentMap(context: ValidationContext): Map<string, FragmentDefinitionNode> {
  const map = new Map<string, FragmentDefinitionNode>();
  for (const definition of context.getDocument().definitions) {
    if (definition.kind === Kind.FRAGMENT_DEFINITION) {
      map.set(definition.name.value, definition);
    }
  }
  return map;
}

function isOverBudget(stats: BudgetStats): boolean {
  return (
    stats.depth > MAX_GRAPHQL_DEPTH ||
    stats.aliases > MAX_GRAPHQL_ALIASES ||
    stats.complexity > MAX_GRAPHQL_COMPLEXITY
  );
}

function clampCardinality(value: number): number {
  if (!Number.isFinite(value) || value < 1) return 1;
  return Math.min(Math.floor(value), GRAPHQL_MAX_LIST_CARDINALITY);
}

function listCardinality(
  field: FieldNode,
  fieldDef: GraphQLField<unknown, unknown> | undefined,
): number {
  const limitArg = field.arguments?.find((argument) => argument.name.value === "limit");
  const defaultLimit = fieldDef?.args.find((argument) => argument.name === "limit")?.defaultValue;
  let cardinality = GRAPHQL_DEFAULT_LIST_CARDINALITY;

  if (typeof defaultLimit === "number") {
    cardinality = defaultLimit;
  }

  if (!limitArg) return clampCardinality(cardinality);
  if (limitArg.value.kind === Kind.VARIABLE) return GRAPHQL_MAX_LIST_CARDINALITY;

  const parsed = valueFromASTUntyped(limitArg.value);
  if (typeof parsed === "number") cardinality = parsed;
  return clampCardinality(cardinality);
}

function fieldCost(
  field: FieldNode,
  parentType: FieldParent | null,
): { cost: number; nextParent: FieldParent | null } {
  const fieldDef = parentType?.getFields()[field.name.value];
  const outputType = fieldDef?.type;
  const list = outputType ? isListOutput(outputType) : false;
  const cost = list ? listCardinality(field, fieldDef) : 1;
  const nextParent = outputType ? asFieldParent(namedType(outputType)) : null;
  return { cost, nextParent };
}

function rootType(schema: GraphQLSchema, operation: OperationDefinitionNode): FieldParent | null {
  if (operation.operation === "mutation") return asFieldParent(schema.getMutationType());
  if (operation.operation === "subscription") return asFieldParent(schema.getSubscriptionType());
  return asFieldParent(schema.getQueryType());
}

function walkSelections(
  selections: ReadonlyArray<SelectionNode>,
  parentType: FieldParent | null,
  depth: number,
  multiplier: number,
  fragments: Map<string, FragmentDefinitionNode>,
  fragmentStack: Set<string>,
  schema: GraphQLSchema,
  stats: BudgetStats,
): boolean {
  for (const selection of selections) {
    if (isOverBudget(stats)) return true;

    if (selection.kind === Kind.FIELD) {
      if (selection.alias) stats.aliases += 1;
      if (!isIntrospectionField(selection.name.value)) {
        const { cost, nextParent } = fieldCost(selection, parentType);
        stats.complexity += multiplier * cost;
        stats.depth = Math.max(stats.depth, depth);
        if (isOverBudget(stats)) return true;
        const next = selection.selectionSet?.selections;
        if (next) {
          const breached = walkSelections(
            next,
            nextParent,
            depth + 1,
            multiplier * cost,
            fragments,
            fragmentStack,
            schema,
            stats,
          );
          if (breached) return true;
        }
      }
      continue;
    }

    if (selection.kind === Kind.INLINE_FRAGMENT) {
      const typeName = selection.typeCondition?.name.value;
      const nextParent = typeName ? asFieldParent(schema.getType(typeName)) : parentType;
      const next = selection.selectionSet.selections;
      const breached = walkSelections(
        next,
        nextParent,
        depth,
        multiplier,
        fragments,
        fragmentStack,
        schema,
        stats,
      );
      if (breached) return true;
      continue;
    }

    const fragment = fragments.get(selection.name.value);
    if (!fragment || fragmentStack.has(fragment.name.value)) continue;
    fragmentStack.add(fragment.name.value);
    const nextParent =
      asFieldParent(schema.getType(fragment.typeCondition.name.value)) ?? parentType;
    const breached = walkSelections(
      fragment.selectionSet.selections,
      nextParent,
      depth,
      multiplier,
      fragments,
      fragmentStack,
      schema,
      stats,
    );
    fragmentStack.delete(fragment.name.value);
    if (breached) return true;
  }

  return isOverBudget(stats);
}

function budgetMessage(stats: BudgetStats): string {
  if (stats.depth > MAX_GRAPHQL_DEPTH) {
    return `Query exceeds maximum depth of ${MAX_GRAPHQL_DEPTH}`;
  }
  if (stats.aliases > MAX_GRAPHQL_ALIASES) {
    return `Query exceeds maximum alias count of ${MAX_GRAPHQL_ALIASES}`;
  }
  return `Query exceeds maximum complexity of ${MAX_GRAPHQL_COMPLEXITY}`;
}

export const queryBudgetRule: ValidationRule = (context: ValidationContext) => {
  const fragments = fragmentMap(context);
  const schema = context.getSchema();
  const stats: BudgetStats = { depth: 0, aliases: 0, complexity: 0 };

  function reportIfOverBudget(node: ASTNode) {
    if (!isOverBudget(stats)) return;
    context.reportError(new GraphQLError(budgetMessage(stats), { nodes: [node] }));
  }

  return {
    Document: {
      enter(node) {
        for (const definition of node.definitions) {
          if (definition.kind !== Kind.OPERATION_DEFINITION) continue;
          if (isIntrospectionOperation(definition.selectionSet.selections)) continue;
          const breached = walkSelections(
            definition.selectionSet.selections,
            rootType(schema, definition),
            1,
            1,
            fragments,
            new Set(),
            schema,
            stats,
          );
          if (breached) {
            reportIfOverBudget(node);
            return;
          }
        }
        return undefined;
      },
    },
  };
};

function graphqlParamsBytes(params: unknown): number {
  const encoded = JSON.stringify(params ?? {});
  if (typeof encoded !== "string") return 0;
  return new TextEncoder().encode(encoded).byteLength;
}

export function queryBudgetPlugin(): Plugin {
  return {
    onParams({ params, setResult }) {
      if (graphqlParamsBytes(params) > MAX_GRAPHQL_BODY_BYTES) {
        setResult({
          errors: [new GraphQLError("GraphQL body exceeds the maximum allowed size")],
        });
      }
    },
    onValidate({ addValidationRule }) {
      addValidationRule(queryBudgetRule);
    },
  };
}
