"use client";

import { useState, useEffect, useCallback } from "react";
import { builderFormValuesSchema } from "./types";
import type { BuilderFormValues, SchemaFieldForApi } from "./types";

interface Props {
  formValues: BuilderFormValues;
  onApply: (values: BuilderFormValues) => void;
}

function formValuesToApiJson(values: BuilderFormValues): object {
  return {
    name: values.name,
    fields: values.fields.map((f) => {
      const field: SchemaFieldForApi = { name: f.name, type: f.type };
      if (f.type === "enum" && f.values) {
        field.values = f.values
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean);
      }
      if (f.type === "array" && f.items) {
        field.items = f.items;
      }
      if (f.type === "number") {
        if (f.min !== undefined && !isNaN(f.min)) field.min = f.min;
        if (f.max !== undefined && !isNaN(f.max)) field.max = f.max;
      }
      return field;
    }),
  };
}

function coerceToFormValues(raw: unknown): BuilderFormValues | null {
  if (typeof raw !== "object" || raw === null) return null;

  const obj = raw as Record<string, unknown>;
  if (typeof obj.name !== "string" || !Array.isArray(obj.fields)) return null;

  const fields = obj.fields.map((f: unknown) => {
    if (typeof f !== "object" || f === null) return null;
    const field = f as Record<string, unknown>;
    return {
      name: typeof field.name === "string" ? field.name : "",
      type: (typeof field.type === "string"
        ? field.type
        : "string") as BuilderFormValues["fields"][0]["type"],
      values: Array.isArray(field.values)
        ? field.values.join(", ")
        : typeof field.values === "string"
          ? field.values
          : undefined,
      items: (typeof field.items === "string"
        ? field.items
        : undefined) as BuilderFormValues["fields"][0]["items"],
      min: typeof field.min === "number" ? field.min : undefined,
      max: typeof field.max === "number" ? field.max : undefined,
    };
  });

  if (fields.some((f) => f === null)) return null;

  return { name: obj.name, fields: fields as BuilderFormValues["fields"] };
}

function jsonToFormValues(json: string): BuilderFormValues | null {
  let parsed: unknown;
  try {
    parsed = JSON.parse(json);
  } catch {
    return null;
  }

  const coerced = coerceToFormValues(parsed);
  if (!coerced) return null;

  const result = builderFormValuesSchema.safeParse(coerced);
  if (!result.success) return null;

  return result.data;
}

export function JsonEditor({ formValues, onApply }: Props) {
  const [text, setText] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setText(JSON.stringify(formValuesToApiJson(formValues), null, 2));
    setError(null);
  }, [formValues]);

  const handleApply = useCallback(() => {
    const parsed = jsonToFormValues(text);
    if (!parsed) {
      let parsedJson: unknown;
      try {
        parsedJson = JSON.parse(text);
      } catch {
        parsedJson = null;
      }
      const coerced = parsedJson ? coerceToFormValues(parsedJson) : null;
      if (coerced) {
        const result = builderFormValuesSchema.safeParse(coerced);
        if (!result.success) {
          setError(result.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`).join("; "));
        } else {
          setError("Invalid JSON input");
        }
      } else {
        setError(
          "Invalid JSON: must have 'name' (string) and 'fields' (array with at least one field)",
        );
      }
      return;
    }
    setError(null);
    onApply(parsed);
  }, [text, onApply]);

  return (
    <div className="space-y-3">
      <textarea
        value={text}
        onChange={(e) => {
          setText(e.target.value);
          setError(null);
        }}
        className="w-full h-64 rounded-lg border border-[var(--color-border)] bg-[var(--color-code-bg)] px-4 py-3 font-mono text-sm text-[var(--color-code-text)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] resize-y"
        spellCheck={false}
      />
      {error && <p className="text-sm text-red-500">{error}</p>}
      <button
        type="button"
        onClick={handleApply}
        className="rounded-lg bg-[var(--color-accent)] px-4 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90"
      >
        Apply JSON
      </button>
    </div>
  );
}
