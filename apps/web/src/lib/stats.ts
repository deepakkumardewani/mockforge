import { API_BASE } from "./api-client";

const STATS_FETCH_TIMEOUT_MS = 2_500;

export async function fetchStatsTotal(): Promise<number | null> {
  try {
    const res = await fetch(`${API_BASE}/api/stats`, {
      next: { revalidate: 60 },
      signal: AbortSignal.timeout(STATS_FETCH_TIMEOUT_MS),
    });
    if (!res.ok) return null;

    const data = (await res.json()) as { total?: number };
    return typeof data.total === "number" ? data.total : null;
  } catch {
    return null;
  }
}
