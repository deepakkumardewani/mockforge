"use client";

import { useEffect } from "react";
import { CodeEditor } from "@/components/playground/shared/CodeEditor";
import { isJsonValid } from "../shared/json";

export interface VariablesEditorProps {
  value: string;
  onChange: (value: string) => void;
  onValidityChange: (valid: boolean) => void;
  onSubmit?: () => void;
}

export function VariablesEditor({
  value,
  onChange,
  onValidityChange,
  onSubmit,
}: VariablesEditorProps) {
  const valid = isJsonValid(value);

  useEffect(() => {
    onValidityChange(valid);
  }, [valid, value, onValidityChange]);

  return (
    <section className="flex min-h-0 flex-1 flex-col gap-2" aria-label="GraphQL variables">
      <CodeEditor
        value={value}
        onChange={onChange}
        language="json"
        ariaLabel="GraphQL variables JSON"
        placeholder="{ }"
        onSubmit={onSubmit}
      />
      {!valid ? (
        <p className="text-xs font-medium text-[var(--color-accent)]" role="alert">
          Invalid JSON — fix syntax or clear variables before sending.
        </p>
      ) : null}
    </section>
  );
}
