"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useRef, useState, type ComponentType } from "react";
import { ProtocolRail } from "@/components/playground/ProtocolRail";
import { RestPanel } from "@/components/playground/rest/RestPanel";
import type { Protocol } from "@/components/playground/shared/protocol";

const PANEL_CONTENT_CLASS = "flex min-h-0 flex-1 flex-col overflow-hidden pb-4 outline-none";
const PROTOCOL_QUERY_PARAM = "protocol";
const DEFAULT_PROTOCOL: Protocol = "rest";
const KNOWN_PROTOCOLS: readonly Protocol[] = ["rest", "graphql", "websocket", "socketio"];

type LazyProtocol = Exclude<Protocol, "rest">;

const PANEL_IMPORTERS = {
  graphql: () =>
    import("@/components/playground/graphql/GraphqlPanel").then((mod) => ({
      default: mod.GraphqlPanel,
    })),
  websocket: () =>
    import("@/components/playground/ws/WsPanel").then((mod) => ({ default: mod.WsPanel })),
  socketio: () =>
    import("@/components/playground/socketio/SocketIoPanel").then((mod) => ({
      default: mod.SocketIoPanel,
    })),
} satisfies Record<LazyProtocol, () => Promise<{ default: ComponentType }>>;

const panelResolved = new Map<LazyProtocol, ComponentType>();
const panelPending = new Map<LazyProtocol, Promise<ComponentType>>();

function loadPanel(protocol: LazyProtocol): Promise<ComponentType> {
  const resolved = panelResolved.get(protocol);
  if (resolved) return Promise.resolve(resolved);

  const pending = panelPending.get(protocol);
  if (pending) return pending;

  const next = PANEL_IMPORTERS[protocol]().then((mod) => {
    panelResolved.set(protocol, mod.default);
    panelPending.delete(protocol);
    return mod.default;
  });
  panelPending.set(protocol, next);
  return next;
}

function isProtocol(value: string | null): value is Protocol {
  return KNOWN_PROTOCOLS.includes(value as Protocol);
}

function isLazyProtocol(value: Protocol): value is LazyProtocol {
  return value !== "rest";
}

export function Playground() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const requestedProtocol = searchParams.get(PROTOCOL_QUERY_PARAM);
  const protocol = isProtocol(requestedProtocol) ? requestedProtocol : DEFAULT_PROTOCOL;
  const protocolRef = useRef(protocol);
  protocolRef.current = protocol;

  const [, setLoadTick] = useState(0);

  useEffect(() => {
    if (!isLazyProtocol(protocol)) return;

    const requested = protocol;
    let cancelled = false;
    void loadPanel(requested).then((Panel) => {
      if (cancelled || protocolRef.current !== requested) return;
      panelResolved.set(requested, Panel);
      setLoadTick((tick) => tick + 1);
    });

    return () => {
      cancelled = true;
    };
  }, [protocol]);

  const setProtocol = useCallback(
    (next: Protocol) => {
      protocolRef.current = next;
      const params = new URLSearchParams(searchParams.toString());
      params.set(PROTOCOL_QUERY_PARAM, next);
      router.replace(`${pathname}?${params.toString()}`, { scroll: false });

      if (isLazyProtocol(next)) void loadPanel(next);
    },
    [pathname, router, searchParams],
  );

  const preloadProtocol = useCallback((next: Protocol) => {
    if (isLazyProtocol(next)) void loadPanel(next);
  }, []);

  const ActivePanel = protocol === "rest" ? RestPanel : (panelResolved.get(protocol) ?? null);
  const isPanelPending = isLazyProtocol(protocol) && ActivePanel === null;

  return (
    <main className="playground-scope flex h-full min-h-0 max-w-[100vw] flex-col overflow-hidden lg:flex-row">
      <ProtocolRail active={protocol} onChange={setProtocol} onIntent={preloadProtocol} />
      <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden px-4 pt-4 lg:px-5">
        <div className="flex w-full min-w-0 flex-1 flex-col overflow-hidden">
          <div className={PANEL_CONTENT_CLASS} aria-busy={isPanelPending || undefined}>
            {ActivePanel ? <ActivePanel /> : null}
          </div>
        </div>
      </div>
    </main>
  );
}
