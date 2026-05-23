export interface JsonViewProps {
  value: unknown;
  /** Optional max-height for scrolling (Tailwind-compatible class fragment). */
  maxHeightClassName?: string;
}

export function JsonView({ value, maxHeightClassName = "max-h-64" }: JsonViewProps) {
  let text: string;
  try {
    text = typeof value === "string" ? value : JSON.stringify(value, null, 2);
  } catch {
    text = '"[Unable to stringify]"';
  }

  const embedded = maxHeightClassName === "";

  return (
    <pre
      className={`min-w-0 w-full break-all rounded-lg bg-[var(--color-code-bg)] p-4 font-mono text-xs leading-relaxed text-[var(--color-code-text)] whitespace-pre-wrap ${embedded ? "" : "max-w-full overflow-auto"} ${maxHeightClassName}`}
    >
      {text}
    </pre>
  );
}
