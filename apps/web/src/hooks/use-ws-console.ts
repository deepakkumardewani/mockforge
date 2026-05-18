"use client";

import { nanoid } from "nanoid";
import { useCallback, useEffect, useRef, useState } from "react";

export const WS_CONSOLE_MAX_EVENTS = 500;

export type WsConnectionStatus = "idle" | "connecting" | "connected" | "error";

export type WsConsoleEvent = {
  readonly id: string;
  readonly direction: "in" | "out";
  readonly message: string;
  readonly at: number;
};

function pushBounded(prev: WsConsoleEvent[], next: WsConsoleEvent, cap: number): WsConsoleEvent[] {
  const merged = [...prev, next];
  if (merged.length <= cap) return merged;
  return merged.slice(merged.length - cap);
}

export function useWsConsole(url: string) {
  const [status, setStatus] = useState<WsConnectionStatus>("idle");
  const [events, setEvents] = useState<WsConsoleEvent[]>([]);
  const wsRef = useRef<WebSocket | null>(null);

  const disconnect = useCallback(() => {
    const ws = wsRef.current;
    wsRef.current = null;
    if (ws && (ws.readyState === WebSocket.OPEN || ws.readyState === WebSocket.CONNECTING)) {
      ws.close();
    }
    setStatus("idle");
  }, []);

  const connect = useCallback(() => {
    const target = url.trim();
    if (!target) {
      setStatus("error");
      return;
    }

    disconnect();

    setStatus("connecting");
    try {
      const ws = new WebSocket(target);
      wsRef.current = ws;

      ws.onopen = () => {
        if (wsRef.current !== ws) return;
        setStatus("connected");
      };

      ws.onmessage = (event) => {
        if (wsRef.current !== ws) return;
        const text = typeof event.data === "string" ? event.data : "[binary]";
        setEvents((prev) =>
          pushBounded(
            prev,
            {
              id: nanoid(),
              direction: "in",
              message: text,
              at: Date.now(),
            },
            WS_CONSOLE_MAX_EVENTS,
          ),
        );
      };

      ws.onerror = () => {
        if (wsRef.current !== ws) return;
        setStatus("error");
        ws.close();
      };

      ws.onclose = () => {
        if (wsRef.current !== ws) return;
        wsRef.current = null;
        setStatus((prev) => (prev === "error" ? "error" : "idle"));
      };
    } catch {
      wsRef.current = null;
      setStatus("error");
    }
  }, [url, disconnect]);

  const send = useCallback((message: string) => {
    const ws = wsRef.current;
    if (!ws || ws.readyState !== WebSocket.OPEN) return;

    ws.send(message);
    setEvents((prev) =>
      pushBounded(
        prev,
        {
          id: nanoid(),
          direction: "out",
          message,
          at: Date.now(),
        },
        WS_CONSOLE_MAX_EVENTS,
      ),
    );
  }, []);

  useEffect(() => {
    return () => {
      const ws = wsRef.current;
      wsRef.current = null;
      ws?.close();
    };
  }, []);

  return { status, events, connect, disconnect, send };
}
