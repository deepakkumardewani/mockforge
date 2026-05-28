"use client";

import { useEffect, useRef, useState } from "react";
import { API_BASE } from "@/lib/api-client";

const WS_URL = process.env.NEXT_PUBLIC_WS_URL ?? "ws://localhost:4000/ws/stats";

export function useWsStats() {
  const [total, setTotal] = useState<number | null>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    let mounted = true;

    async function bootstrap() {
      try {
        const res = await fetch(`${API_BASE}/api/stats`);
        if (!res.ok) return;
        const data = (await res.json()) as { total?: number };
        if (mounted && typeof data.total === "number") {
          setTotal(data.total);
        }
      } catch {
        // WebSocket will attempt live updates
      }
    }

    function connect() {
      if (wsRef.current?.readyState === WebSocket.OPEN) return;

      try {
        const ws = new WebSocket(WS_URL);
        wsRef.current = ws;

        ws.onmessage = (event) => {
          if (!mounted) return;
          try {
            const data = JSON.parse(event.data);
            if (typeof data.total === "number") {
              setTotal(data.total);
            }
          } catch {
            // Ignore malformed messages
          }
        };

        ws.onclose = () => {
          if (!mounted) return;
          reconnectTimer.current = setTimeout(connect, 3000);
        };

        ws.onerror = () => {
          ws.close();
        };
      } catch {
        if (mounted) {
          reconnectTimer.current = setTimeout(connect, 3000);
        }
      }
    }

    void bootstrap();
    connect();

    return () => {
      mounted = false;
      if (reconnectTimer.current !== null) clearTimeout(reconnectTimer.current);
      wsRef.current?.close();
    };
  }, []);

  return total;
}
