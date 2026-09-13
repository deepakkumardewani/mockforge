export interface HttpResponseData {
  status: number;
  statusText: string;
  timeMs: number;
  body: unknown;
  headers: Record<string, string>;
}

function flattenHeaders(headers: Headers): Record<string, string> {
  const flat: Record<string, string> = {};
  headers.forEach((value, key) => {
    flat[key] = value;
  });
  return flat;
}

function parseResponseBody(text: string): unknown {
  if (text.trim().length === 0) return text.length ? text : null;
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

export async function timedFetch(
  input: RequestInfo | URL,
  init: RequestInit,
): Promise<HttpResponseData> {
  const start = performance.now();
  const res = await fetch(input, init);
  const timeMs = Math.round(performance.now() - start);
  const text = await res.text();
  return {
    status: res.status,
    statusText: res.statusText,
    timeMs,
    body: parseResponseBody(text),
    headers: flattenHeaders(res.headers),
  };
}
