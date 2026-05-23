import {
  ENTITIES,
  GRAPHQL_FIELDS,
  type Entity,
} from "@/components/playground/shared/playground-catalogue";

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

export function getEntityForRootField(rootField: string): Entity | null {
  for (const entity of ENTITIES) {
    if (GRAPHQL_FIELDS[entity][rootField]) return entity;
  }
  return null;
}

export function getDefaultScalarsForField(rootField: string): readonly string[] {
  return lookupRootField(rootField)?.selectableScalars ?? [];
}

/** Extract the operation kind and first root field from a playground query string. */
export function parsePrimaryOperation(
  query: string,
): { kind: "query" | "mutation"; rootField: string } | null {
  const trimmed = query.trim();
  const kindMatch = trimmed.match(/^(query|mutation)\b/i);
  if (!kindMatch) return null;

  const kind = kindMatch[1]!.toLowerCase() as "query" | "mutation";
  const bodyStart = trimmed.indexOf("{");
  if (bodyStart === -1) return null;

  const rootMatch = trimmed
    .slice(bodyStart + 1)
    .match(/^\s*(\w+)\s*(?:\([^)]*\))?\s*(?:\{|(?=\s*\}))/);
  if (!rootMatch) return null;

  return { kind, rootField: rootMatch[1]! };
}

/**
 * Apply a schema selection to the query editor.
 * - Empty editor → insert the built operation.
 * - Same root field → replace with updated field selection.
 * - Same entity + operation kind, different root field → replace entirely.
 * - Different entity or operation kind → replace entirely.
 * - Unrecognized existing text → replace entirely.
 */
export function mergeOperation(
  existingQuery: string,
  rootField: string,
  selectedFields: readonly string[],
): string | null {
  const next = buildOperation(rootField, selectedFields);
  if (!next) return null;

  const trimmed = existingQuery.trim();
  if (!trimmed) return next;

  const existing = parsePrimaryOperation(trimmed);
  if (!existing) return next;

  const nextKind = isMutationField(rootField) ? "mutation" : "query";
  const nextEntity = getEntityForRootField(rootField);
  const existingEntity = getEntityForRootField(existing.rootField);

  const sameRootField = existing.rootField === rootField;
  const sameKind = existing.kind === nextKind;
  const sameEntity =
    nextEntity !== null && existingEntity !== null && nextEntity === existingEntity;

  if (sameRootField || (sameEntity && sameKind)) {
    return next;
  }

  return next;
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
export function buildOperation(
  rootField: string,
  selectedFields: readonly string[],
): string | null {
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
