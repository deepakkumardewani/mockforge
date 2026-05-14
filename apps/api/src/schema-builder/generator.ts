import { faker } from "@faker-js/faker";
import type { SchemaDefinition, SchemaField, SchemaFieldType } from "@mockforge/types";

type GeneratedRecord = Record<string, unknown>;

function generateFieldValue(field: SchemaField): unknown {
  switch (field.type) {
    case "string":
      return faker.lorem.word();
    case "number": {
      const min = field.min ?? 0;
      const max = field.max ?? 1000;
      return faker.number.int({ min, max });
    }
    case "boolean":
      return faker.datatype.boolean();
    case "date":
      return faker.date.recent().toISOString();
    case "enum": {
      const values = field.values ?? [];
      return values[Math.floor(Math.random() * values.length)];
    }
    case "uuid":
      return faker.string.uuid();
    case "email":
      return faker.internet.email();
    case "url":
      return faker.internet.url();
    case "image":
      return faker.image.url();
    case "array": {
      const itemCount = faker.number.int({ min: 2, max: 5 });
      const itemType = field.items as SchemaFieldType;
      return Array.from({ length: itemCount }, () =>
        generateFieldValue({ name: field.name, type: itemType })
      );
    }
  }
}

export function generateFromSchema(
  schema: SchemaDefinition,
  count: number
): GeneratedRecord[] {
  const records: GeneratedRecord[] = [];
  for (let i = 0; i < count; i++) {
    const record: GeneratedRecord = { id: faker.string.uuid() };
    for (const field of schema.fields) {
      record[field.name] = generateFieldValue(field);
    }
    records.push(record);
  }
  return records;
}
