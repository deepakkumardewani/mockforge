"use client";

import { Component, useEffect, useMemo, useState, type ReactNode } from "react";
import CodeMirror, { EditorView, keymap, Prec, type Extension } from "@uiw/react-codemirror";
import { json } from "@codemirror/lang-json";

export type CodeEditorLanguage = "json" | "graphql";

export interface CodeEditorProps {
  value: string;
  onChange: (value: string) => void;
  language: CodeEditorLanguage;
  placeholder?: string;
  minHeight?: number;
  maxHeight?: number;
  ariaLabel?: string;
  onSubmit?: () => void;
}

const DEFAULT_MIN_HEIGHT_PX = 160;
const DEFAULT_MAX_HEIGHT_PX = 420;
const SUBMIT_SHORTCUT_KEY = "Mod-Enter";

// CodeMirror renders into a real DOM node via layout effects it owns, which
// jsdom cannot faithfully emulate. Vitest sets this env var for every run,
// so we render the plain-textarea fallback there instead of the real editor —
// keeping unit tests fast, deterministic, and free of jsdom/CodeMirror friction.
const IS_TEST_ENV = typeof process !== "undefined" && process.env.VITEST === "true";

function useLanguageExtension(language: CodeEditorLanguage): Extension {
  const [graphqlExtension, setGraphqlExtension] = useState<Extension | null>(null);

  useEffect(() => {
    if (language !== "graphql") return;
    let cancelled = false;
    void import("cm6-graphql").then((mod) => {
      if (!cancelled) setGraphqlExtension(mod.graphql());
    });
    return () => {
      cancelled = true;
    };
  }, [language]);

  if (language === "json") return json();
  return graphqlExtension ?? [];
}

// Theme is expressed entirely through the app's CSS custom properties so it
// tracks the active light/dark theme without any JS-side theme detection.
function buildEditorTheme(minHeight: number, maxHeight: number): Extension {
  return EditorView.theme({
    "&": {
      backgroundColor: "var(--color-surface)",
      color: "var(--color-text-primary)",
      fontSize: "0.875rem",
      borderRadius: "0.5rem",
    },
    "&.cm-focused": {
      outline: "none",
    },
    ".cm-content": {
      fontFamily: "var(--font-mono, ui-monospace, monospace)",
      caretColor: "var(--color-accent)",
      padding: "0.75rem",
    },
    ".cm-cursor, .cm-cursor-primary": {
      borderLeftColor: "var(--color-accent)",
      borderLeftWidth: "2px",
    },
    ".cm-scroller": {
      minHeight: `${minHeight}px`,
      maxHeight: `${maxHeight}px`,
      overflow: "auto",
      fontFamily: "inherit",
    },
    ".cm-gutters": {
      display: "none",
    },
    ".cm-activeLine": {
      backgroundColor: "transparent",
    },
    ".cm-activeLineGutter": {
      backgroundColor: "transparent",
    },
    ".cm-selectionBackground, &.cm-focused .cm-selectionBackground": {
      backgroundColor: "var(--color-accent-tint)",
    },
    ".cm-placeholder": {
      color: "var(--color-text-muted)",
    },
  });
}

function useSubmitKeymap(onSubmit?: () => void): Extension {
  return useMemo(() => {
    if (!onSubmit) return [];
    // High precedence so the shortcut fires before any language-specific
    // keymap (e.g. json/graphql indentation bindings) can swallow Mod-Enter.
    return Prec.highest(
      keymap.of([
        {
          key: SUBMIT_SHORTCUT_KEY,
          run: () => {
            onSubmit();
            return true;
          },
        },
      ]),
    );
  }, [onSubmit]);
}

function TextareaFallback({
  value,
  onChange,
  language,
  placeholder,
  minHeight,
  maxHeight,
  ariaLabel,
  onSubmit,
}: Required<Pick<CodeEditorProps, "minHeight" | "maxHeight">> & CodeEditorProps) {
  const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    const isSubmitShortcut = (event.metaKey || event.ctrlKey) && event.key === "Enter";
    if (isSubmitShortcut && onSubmit) {
      event.preventDefault();
      onSubmit();
    }
  };

  return (
    <textarea
      value={value}
      onChange={(event) => onChange(event.target.value)}
      onKeyDown={handleKeyDown}
      spellCheck={false}
      aria-label={ariaLabel}
      placeholder={placeholder}
      data-language={language}
      style={{ minHeight, maxHeight }}
      className="w-full resize-y rounded-lg bg-[var(--color-surface)] p-3 font-mono text-sm
        caret-[var(--color-accent)] text-[var(--color-text-primary)] outline-none
        ring-[var(--color-accent)] placeholder:text-[var(--color-text-muted)] focus-visible:ring-2"
    />
  );
}

interface EditorErrorBoundaryProps {
  onError: () => void;
  children: ReactNode;
}

// Class component required: React only supports catching render/lifecycle
// errors in a child tree via a class-based error boundary (no hook equivalent).
class EditorErrorBoundary extends Component<EditorErrorBoundaryProps> {
  static getDerivedStateFromError(): Record<string, never> {
    return {};
  }

  componentDidCatch(): void {
    this.props.onError();
  }

  render(): ReactNode {
    return this.props.children;
  }
}

/**
 * Themed code editor for JSON/GraphQL playground inputs. Falls back to a
 * plain, fully accessible textarea under Vitest/jsdom so existing tests can
 * keep querying by role/label without knowing about CodeMirror internals.
 */
export function CodeEditor(props: CodeEditorProps) {
  const {
    value,
    onChange,
    language,
    placeholder,
    ariaLabel,
    onSubmit,
    minHeight = DEFAULT_MIN_HEIGHT_PX,
    maxHeight = DEFAULT_MAX_HEIGHT_PX,
  } = props;

  const [failedToMount, setFailedToMount] = useState(false);
  const submitKeymap = useSubmitKeymap(onSubmit);
  const languageExt = useLanguageExtension(language);

  const extensions = useMemo(
    () => [languageExt, buildEditorTheme(minHeight, maxHeight), submitKeymap],
    [languageExt, minHeight, maxHeight, submitKeymap],
  );

  if (IS_TEST_ENV || failedToMount) {
    return (
      <TextareaFallback
        value={value}
        onChange={onChange}
        language={language}
        placeholder={placeholder}
        minHeight={minHeight}
        maxHeight={maxHeight}
        ariaLabel={ariaLabel}
        onSubmit={onSubmit}
      />
    );
  }

  return (
    <EditorErrorBoundary onError={() => setFailedToMount(true)}>
      <div
        className="overflow-hidden rounded-lg border border-[var(--color-border)]"
        data-testid="code-editor"
      >
        <CodeMirror
          value={value}
          onChange={onChange}
          extensions={extensions}
          placeholder={placeholder}
          basicSetup={{ lineNumbers: false, foldGutter: false, highlightActiveLine: false }}
          theme="none"
          aria-label={ariaLabel}
        />
      </div>
    </EditorErrorBoundary>
  );
}
