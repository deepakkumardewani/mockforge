"use client";

import { useEffect } from "react";
import { CodeEditor } from "@/components/playground/shared/CodeEditor";
import { isJsonValid } from "../shared/json";

export interface BodyEditorProps {
  value: string;
  onChange: (value: string) => void;
  onValidityChange: (valid: boolean) => void;
  onSubmit?: () => void;
}

export function BodyEditor({ value, onChange, onValidityChange, onSubmit }: BodyEditorProps) {
  const valid = isJsonValid(value);

  useEffect(() => {
    onValidityChange(valid);
  }, [valid, value, onValidityChange]);

  const handleFormat = () => {
    if (!value.trim()) {
      return;
    }

    try {
      const parsed = JSON.parse(value);
      const formatted = JSON.stringify(parsed, null, 2);
      onChange(formatted);
    } catch {
      // Silently ignore parse errors — user will see validation message
    }
  };

  return (
    <section className="flex min-h-0 flex-1 flex-col gap-2" aria-label="Request body">
      <div className="flex justify-end">
        <button
          onClick={handleFormat}
          className="rounded-lg bg-[var(--color-accent)] px-3 py-1 text-xs font-medium text-[var(--color-text-primary)] hover:opacity-80 active:opacity-70"
          aria-label="Format JSON"
          type="button"
        >
          Format
        </button>
      </div>
      <CodeEditor
        value={value}
        onChange={onChange}
        language="json"
        ariaLabel="JSON request body"
        placeholder="{ }"
        onSubmit={onSubmit}
      />
      {!valid ? (
        <p className="text-xs font-medium text-[var(--color-accent)]" role="alert">
          Invalid JSON — fix syntax or clear the body before sending.
        </p>
      ) : null}
    </section>
  );
}
