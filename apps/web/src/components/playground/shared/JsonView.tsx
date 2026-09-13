import { Fragment, type CSSProperties } from "react";

export interface JsonViewProps {
  value: unknown;
  /** Optional max-height for scrolling (Tailwind-compatible class fragment). */
  maxHeightClassName?: string;
}

type JsonTokenKind = "key" | "string" | "number" | "boolean" | "null" | "punctuation" | "plain";

interface JsonToken {
  readonly kind: JsonTokenKind;
  readonly text: string;
}

/* Matches, in priority order: a quoted string (as a key, if followed by ':') or
 * value, a number, or a bare word (true/false/null/other punctuation passthrough). */
const JSON_TOKEN_PATTERN =
  /"(?:\\.|[^"\\])*"(?=\s*:)|"(?:\\.|[^"\\])*"|-?\d+(?:\.\d+)?(?:[eE][+-]?\d+)?|\btrue\b|\bfalse\b|\bnull\b/g;

/* The JSON surface (--color-code-bg) is dark in BOTH themes, so syntax colors are
 * fixed rather than theme-swapped: page foreground tokens go dark in light mode
 * and become unreadable against this surface. */
const SYNTAX_COLOR = {
  key: "oklch(0.92 0.006 65)",
  string: "oklch(0.78 0.13 150)",
  number: "oklch(0.76 0.16 42)",
  boolean: "oklch(0.78 0.13 280)",
  muted: "oklch(0.62 0.01 65)",
} as const;

const TOKEN_STYLE: Record<JsonTokenKind, CSSProperties> = {
  key: { color: SYNTAX_COLOR.key, fontWeight: 600 },
  string: { color: SYNTAX_COLOR.string },
  number: { color: SYNTAX_COLOR.number },
  boolean: { color: SYNTAX_COLOR.boolean },
  null: { color: SYNTAX_COLOR.muted, fontStyle: "italic" },
  punctuation: { color: SYNTAX_COLOR.muted },
  plain: { color: "var(--color-code-text)" },
};

function classifyMatch(text: string): JsonTokenKind {
  if (text.endsWith('"') && text.startsWith('"')) return "string";
  if (text === "true" || text === "false") return "boolean";
  if (text === "null") return "null";
  return "number";
}

/** Tokenize pretty-printed JSON text into highlightable spans (keys detected via trailing ':'). */
function tokenizeJson(text: string): JsonToken[] {
  const tokens: JsonToken[] = [];
  let lastIndex = 0;

  for (const match of text.matchAll(JSON_TOKEN_PATTERN)) {
    const start = match.index ?? 0;
    if (start > lastIndex) {
      tokens.push({ kind: "plain", text: text.slice(lastIndex, start) });
    }
    const matched = match[0];
    const isKey =
      matched.startsWith('"') &&
      text
        .slice(start + matched.length)
        .trimStart()
        .startsWith(":");
    tokens.push({ kind: isKey ? "key" : classifyMatch(matched), text: matched });
    lastIndex = start + matched.length;
  }

  if (lastIndex < text.length) {
    tokens.push({ kind: "plain", text: text.slice(lastIndex) });
  }

  return tokens;
}

function HighlightedJson({ text }: { text: string }) {
  return (
    <>
      {tokenizeJson(text).map((token, i) => (
        <Fragment key={i}>
          {token.kind === "plain" ? (
            token.text
          ) : (
            <span style={TOKEN_STYLE[token.kind]}>{token.text}</span>
          )}
        </Fragment>
      ))}
    </>
  );
}

export function JsonView({ value, maxHeightClassName = "max-h-64" }: JsonViewProps) {
  let text: string;
  let isJsonLike = typeof value !== "string";
  try {
    text = typeof value === "string" ? value : JSON.stringify(value, null, 2);
  } catch {
    text = '"[Unable to stringify]"';
    isJsonLike = false;
  }

  const embedded = maxHeightClassName === "";

  return (
    <pre
      className={`min-w-0 w-full break-all rounded-lg bg-[var(--color-code-bg)] text-[var(--color-code-text)] p-4 font-mono text-xs leading-relaxed whitespace-pre-wrap ${embedded ? "" : "max-w-full overflow-auto"} ${maxHeightClassName}`}
    >
      {isJsonLike ? (
        <HighlightedJson text={text} />
      ) : (
        <span className="text-[var(--color-code-text)]">{text}</span>
      )}
    </pre>
  );
}
