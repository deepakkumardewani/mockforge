import { API_BASE } from "./api-client";

export async function fetchStatsTotal(): Promise<number | null> {
  try {
    const res = await fetch(`${API_BASE}/api/stats`, {
      next: { revalidate: 60 },
    });
    if (!res.ok) return null;

    const data = (await res.json()) as { total?: number };
    return typeof data.total === "number" ? data.total : null;
  } catch {
    return null;
  }
}
