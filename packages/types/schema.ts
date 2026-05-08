export type SchemaFieldType =
  | "string"
  | "number"
  | "boolean"
  | "date"
  | "enum"
  | "uuid"
  | "email"
  | "url"
  | "image"
  | "array";

export interface SchemaField {
  name: string;
  type: SchemaFieldType;
  /** Required when type is "enum" */
  values?: string[];
  /** Required when type is "array" — the inner item type */
  items?: SchemaFieldType;
  /** For number fields */
  min?: number;
  max?: number;
  required?: boolean;
}

export interface SchemaDefinition {
  name: string;
  fields: SchemaField[];
}

export interface SavedSchema {
  slug: string;
  mfId: string;
  definition: SchemaDefinition;
  persistent: boolean;
  endpoint: string;
  createdAt: string;
}
