/** Pure helper: turn a REST request definition into a copy-pasteable curl command. */

const CURL_DATA_FLAG = "--data";
const CURL_HEADER_FLAG = "-H";
const CURL_METHOD_FLAG = "-X";

export interface BuildCurlOptions {
  readonly method: string;
  readonly url: string;
  readonly headers: Record<string, string>;
  readonly body?: string;
}

/**
 * Single-quote a shell argument, escaping embedded single quotes with the
 * classic `'\''` sequence (close quote, escaped quote, reopen quote).
 */
function shellQuote(value: string): string {
  return `'${value.replace(/'/g, "'\\''")}'`;
}

export function buildCurl({ method, url, headers, body }: BuildCurlOptions): string {
  const parts: string[] = ["curl", CURL_METHOD_FLAG, shellQuote(method.toUpperCase())];

  for (const [name, value] of Object.entries(headers)) {
    if (!name.trim()) continue;
    parts.push(CURL_HEADER_FLAG, shellQuote(`${name}: ${value}`));
  }

  if (body && body.trim().length > 0) {
    parts.push(CURL_DATA_FLAG, shellQuote(body));
  }

  parts.push(shellQuote(url));

  return parts.join(" ");
}
