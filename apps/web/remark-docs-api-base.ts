import { DEFAULT_API_BASE_URL, toWebSocketOrigin } from "./src/lib/playground-constants";

const DOCS_HTTP_HOST = "https://api.mockforge.dev";
const DOCS_WSS_HOST = "wss://api.mockforge.dev";

function resolveHttpBase(): string {
  return (process.env.NEXT_PUBLIC_API_URL ?? DEFAULT_API_BASE_URL).replace(/\/$/, "");
}

function rewrite(value: string, httpBase: string, wsBase: string): string {
  const socketIoOnRest = `${DOCS_HTTP_HOST}:4001`;
  const hold = "\u0000SIO\u0000";
  return value
    .replaceAll(socketIoOnRest, hold)
    .replaceAll(DOCS_HTTP_HOST, httpBase)
    .replaceAll(DOCS_WSS_HOST, wsBase)
    .replaceAll(hold, socketIoOnRest);
}

function walk(node: unknown, httpBase: string, wsBase: string): void {
  if (!node || typeof node !== "object") return;
  const record = node as { value?: unknown; children?: unknown[] };
  if (typeof record.value === "string") {
    record.value = rewrite(record.value, httpBase, wsBase);
  }
  if (Array.isArray(record.children)) {
    for (const child of record.children) walk(child, httpBase, wsBase);
  }
}

export function remarkDocsApiBase() {
  const httpBase = resolveHttpBase();
  const wsBase = toWebSocketOrigin(httpBase);
  return (tree: unknown) => {
    walk(tree, httpBase, wsBase);
  };
}
