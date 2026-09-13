"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";
import { API_BASE } from "@/lib/api-client";
import { toWebSocketOrigin } from "@/lib/playground-constants";

const COPY_MS = 1600;

export interface DocsCurlListProps {
  paths?: readonly string[];
  templates?: readonly string[];
}

function expandTemplate(template: string): string {
  const base = API_BASE.replace(/\/$/, "");
  return template.replaceAll("{base}", base).replaceAll("{ws}", toWebSocketOrigin(base));
}

function toCommands(props: DocsCurlListProps): string[] {
  const fromPaths = (props.paths ?? []).map((path) => `curl "${API_BASE}${path}"`);
  const fromTemplates = (props.templates ?? []).map(expandTemplate);
  return [...fromPaths, ...fromTemplates];
}

export function DocsCurlList({ paths, templates }: DocsCurlListProps) {
  const commands = toCommands({ paths, templates });
  if (commands.length === 0) return null;

  return (
    <div className="docs-curl-list not-prose my-3 flex flex-col gap-1.5">
      {commands.map((command) => (
        <CurlRow key={command} command={command} />
      ))}
    </div>
  );
}

function CurlRow({ command }: { command: string }) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    await navigator.clipboard.writeText(command);
    setCopied(true);
    window.setTimeout(() => setCopied(false), COPY_MS);
  }

  return (
    <div className="flex items-center gap-2 rounded-lg border border-[var(--color-fd-border)] bg-[var(--color-fd-card)] px-3 py-2">
      <code className="min-w-0 flex-1 overflow-x-auto font-mono text-[13px] text-[var(--color-fd-foreground)]">
        {command}
      </code>
      <button
        type="button"
        className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-[var(--color-fd-muted-foreground)] hover:bg-[var(--color-fd-accent)] hover:text-[var(--color-fd-foreground)]"
        aria-label={copied ? "Copied" : "Copy command"}
        onClick={() => void handleCopy()}
      >
        {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
      </button>
    </div>
  );
}

export function DocsBaseUrl({ path = "" }: { path?: string }) {
  return <DocsCurlList templates={[`${"{base}"}${path}`]} />;
}
