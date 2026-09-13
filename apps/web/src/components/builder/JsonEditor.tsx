"use client";

import { useState, useEffect, useCallback } from "react";
import { coerceToFormValues, formValuesToJsonPayload } from "./schema-convert";
import { builderFormValuesSchema } from "./types";
import type { BuilderFormValues } from "./types";

interface Props {
  formValues: BuilderFormValues;
  onApply: (values: BuilderFormValues) => void;
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
    setText(JSON.stringify(formValuesToJsonPayload(formValues), null, 2));
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
      <label htmlFor="builder-json-editor" className="sr-only">
        Schema JSON
      </label>
      <textarea
        id="builder-json-editor"
        value={text}
        onChange={(e) => {
          setText(e.target.value);
          setError(null);
        }}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? "builder-json-editor-error" : undefined}
        className="h-80 w-full resize-y rounded-lg border border-[var(--color-border)] bg-[var(--color-code-bg)] px-4 py-3 font-mono text-sm leading-relaxed text-[var(--color-code-text)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
        spellCheck={false}
      />
      {error && (
        <p id="builder-json-editor-error" role="alert" className="text-sm text-red-500">
          {error}
        </p>
      )}
      <button
        type="button"
        onClick={handleApply}
        className="rounded-lg bg-[var(--color-accent)] px-4 py-2 text-sm font-medium text-[var(--color-on-accent)] transition-opacity hover:opacity-90"
      >
        Apply and return to form
      </button>
    </div>
  );
}
