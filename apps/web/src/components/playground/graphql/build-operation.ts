import { ENTITIES, GRAPHQL_FIELDS, type Entity } from "@/components/playground/shared/playground-catalogue";

export interface GraphqlRootField {
  name: string;
  type: string;
  selectableScalars: readonly string[];
}

const LIST_QUERY_FIELDS = new Set<string>(ENTITIES);

function isMutationField(name: string): boolean {
  return name.startsWith("create") || name.startsWith("update") || name.startsWith("delete");
}

function lookupRootField(rootField: string): GraphqlRootField | null {
  for (const entity of ENTITIES) {
    const field = GRAPHQL_FIELDS[entity][rootField];
    if (field) {
      return {
        name: rootField,
        type: field.type,
        selectableScalars: field.selectableScalars ?? [],
      };
    }
  }
  return null;
}

function buildFieldArgs(rootField: string): string | null {
  if (rootField.startsWith("delete") || rootField.startsWith("update")) {
    return 'id: "1"';
  }
  if (!isMutationField(rootField) && !LIST_QUERY_FIELDS.has(rootField)) {
    return 'id: "1"';
  }
  return null;
}

/**
 * Build a syntactically valid GraphQL operation from a root field and selected scalars.
 * Returns null when the field requires a selection set but none were chosen.
 */
export function buildOperation(rootField: string, selectedFields: readonly string[]): string | null {
  const field = lookupRootField(rootField);
  if (!field) return null;

  const requiresSelection = field.selectableScalars.length > 0;
  if (requiresSelection && selectedFields.length === 0) {
    return null;
  }

  const operationKind = isMutationField(rootField) ? "mutation" : "query";
  const args = buildFieldArgs(rootField);
  const selection =
    selectedFields.length > 0 ? ` {\n    ${selectedFields.join("\n    ")}\n  }` : "";
  const fieldCall = args ? `${rootField}(${args})${selection}` : `${rootField}${selection}`;

  return `${operationKind} {\n  ${fieldCall}\n}`;
}

export function getGraphqlRootFieldsByKind(): {
  query: GraphqlRootField[];
  mutation: GraphqlRootField[];
} {
  const query: GraphqlRootField[] = [];
  const mutation: GraphqlRootField[] = [];

  for (const entity of ENTITIES) {
    for (const [name, field] of Object.entries(GRAPHQL_FIELDS[entity as Entity])) {
      const entry: GraphqlRootField = {
        name,
        type: field.type,
        selectableScalars: field.selectableScalars ?? [],
      };
      if (isMutationField(name)) {
        mutation.push(entry);
      } else {
        query.push(entry);
      }
    }
  }

  return { query, mutation };
}
