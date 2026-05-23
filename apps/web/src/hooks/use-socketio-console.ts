"use client";

import { nanoid } from "nanoid";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type Dispatch,
  type SetStateAction,
} from "react";
import { io } from "@/lib/socket-io-client";
import type { Socket } from "@/lib/socket-io-client";

import {
  WS_CONSOLE_MAX_EVENTS,
  type WsConnectionStatus,
  type WsConsoleEvent,
} from "@/hooks/use-ws-console";

function pushBounded(prev: WsConsoleEvent[], next: WsConsoleEvent, cap: number): WsConsoleEvent[] {
  const merged = [...prev, next];
  if (merged.length <= cap) return merged;
  return merged.slice(merged.length - cap);
}

function appendEvent(
  setEvents: Dispatch<SetStateAction<WsConsoleEvent[]>>,
  direction: "in" | "out",
  message: string,
) {
  setEvents((prev) =>
    pushBounded(prev, { id: nanoid(), direction, message, at: Date.now() }, WS_CONSOLE_MAX_EVENTS),
  );
}

export type UseSocketIoConsoleOptions = {
  readonly url: string;
  readonly namespace: string;
  readonly listenEvent: string;
};

function buildSocketUrl(baseUrl: string, namespace: string): string {
  const trimmedBase = baseUrl.trim().replace(/\/+$/, "");
  const ns = namespace.trim();
  const path = ns.startsWith("/") ? ns : `/${ns}`;
  return `${trimmedBase}${path}`;
}

export function useSocketIoConsole({ url, namespace, listenEvent }: UseSocketIoConsoleOptions) {
  const [status, setStatus] = useState<WsConnectionStatus>("idle");
  const [events, setEvents] = useState<WsConsoleEvent[]>([]);
  const socketRef = useRef<Socket | null>(null);

  const disconnect = useCallback(() => {
    const socket = socketRef.current;
    socketRef.current = null;
    if (socket) {
      appendEvent(setEvents, "in", "[disconnected] client");
      socket.disconnect();
    }
    setStatus("idle");
  }, []);

  const connect = useCallback(() => {
    const target = buildSocketUrl(url, namespace);
    if (!url.trim() || !namespace.trim() || !listenEvent.trim() || !target) {
      setStatus("error");
      return;
    }

    disconnect();
    setEvents([]);

    setStatus("connecting");
    let socket: Socket;
    try {
      socket = io(target, { reconnection: false, path: "/socket.io" });
    } catch {
      setStatus("error");
      return;
    }

    socketRef.current = socket;

    const listen = listenEvent.trim();

    socket.on("connect", () => {
      if (socketRef.current !== socket) return;
      setStatus("connected");
      appendEvent(setEvents, "in", "[connected]");
    });

    socket.on("disconnect", (reason) => {
      if (socketRef.current !== socket) return;
      socketRef.current = null;
      appendEvent(setEvents, "in", `[disconnected] ${reason}`);
      setStatus((prev) => (prev === "error" ? "error" : "idle"));
    });

    socket.on("connect_error", () => {
      if (socketRef.current !== socket) return;
      appendEvent(setEvents, "in", "[connect_error]");
      setStatus("error");
      socket.disconnect();
    });

    socket.on(listen, (payload: unknown) => {
      if (socketRef.current !== socket) return;
      const formatted =
        payload === undefined
          ? `${listen}()`
          : `${listen}(${typeof payload === "string" ? payload : JSON.stringify(payload)})`;
      appendEvent(setEvents, "in", formatted);
    });
  }, [url, namespace, listenEvent, disconnect]);

  const emit = useCallback((eventName: string, payloadJson: string) => {
    const name = eventName.trim();
    if (!name) return false;

    const socket = socketRef.current;
    if (!socket?.connected) return false;

    const raw = payloadJson.trim();
    let parsed: unknown;
    if (raw.length > 0) {
      try {
        parsed = JSON.parse(raw) as unknown;
      } catch {
        return false;
      }
    }

    if (raw.length === 0) {
      socket.emit(name);
      appendEvent(setEvents, "out", `${name}()`);
    } else {
      socket.emit(name, parsed);
      appendEvent(setEvents, "out", `${name}(${JSON.stringify(parsed)})`);
    }
    return true;
  }, []);

  useEffect(() => {
    return () => {
      const s = socketRef.current;
      socketRef.current = null;
      s?.disconnect();
    };
  }, []);

  return { status, events, connect, disconnect, emit };
}
