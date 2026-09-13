/** Shared two-column playground panel layout — keeps columns equal width/height. */
export const PLAYGROUND_PANEL_GRID =
  "grid min-h-0 w-full min-w-0 flex-1 grid-cols-1 gap-4 overflow-hidden lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:grid-rows-[minmax(0,1fr)] lg:items-stretch";

/** Three-column layout for GraphQL: schema sidebar | editor | response. */
export const GRAPHQL_PANEL_GRID =
  "grid min-h-0 w-full min-w-0 flex-1 grid-cols-1 gap-4 overflow-hidden lg:grid-cols-[220px_minmax(0,1fr)_minmax(0,1fr)] lg:grid-rows-[minmax(0,1fr)] lg:items-stretch";

export const PLAYGROUND_PANEL_LEFT =
  "flex h-full min-h-0 min-w-0 flex-col gap-3 overflow-hidden [scrollbar-gutter:stable] lg:pr-1";

export const PLAYGROUND_PANEL_RIGHT = "flex h-full min-h-0 min-w-0 flex-col overflow-hidden";

/**
 * Realtime (WS / Socket.IO) stack: compact controls/composer on top, full-width
 * event log below. Content-sized top so listen-only presets do not leave empty
 * composer space; the log takes remaining height. No column split at any breakpoint.
 */
export const PLAYGROUND_PANEL_STACK =
  "flex min-h-0 w-full min-w-0 flex-1 flex-col gap-3 overflow-hidden";

export const PLAYGROUND_PANEL_STACK_CONTROLS =
  "min-h-0 min-w-0 max-h-[58%] shrink-0 overflow-y-auto [scrollbar-gutter:stable]";

export const PLAYGROUND_PANEL_STACK_LOG =
  "flex min-h-[10rem] min-w-0 flex-1 flex-col overflow-hidden";
