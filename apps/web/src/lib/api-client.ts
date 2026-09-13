import { DEFAULT_API_BASE_URL, MF_ID_HEADER } from "@/lib/playground-constants";

export const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? DEFAULT_API_BASE_URL;

class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

export async function apiClient<T>(
  path: string,
  options: RequestInit = {},
  mfId?: string | null,
): Promise<T> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string> | undefined),
  };

  if (mfId) {
    headers[MF_ID_HEADER] = mfId;
  }

  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers,
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new ApiError(res.status, body?.error?.message ?? res.statusText);
  }

  return res.json() as Promise<T>;
}

export { ApiError };
