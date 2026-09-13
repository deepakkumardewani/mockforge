"use client";

import { CodeEditor } from "@/components/playground/shared/CodeEditor";

export interface QueryEditorProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit?: () => void;
}

export function QueryEditor({ value, onChange, onSubmit }: QueryEditorProps) {
  return (
    <section className="flex min-h-0 min-w-0 flex-1 flex-col" aria-label="GraphQL query">
      <CodeEditor
        value={value}
        onChange={onChange}
        language="graphql"
        ariaLabel="GraphQL query"
        placeholder="query { ... }"
        onSubmit={onSubmit}
      />
    </section>
  );
}
