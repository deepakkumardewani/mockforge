/** Shared two-column playground panel layout — keeps columns equal width/height. */
export const PLAYGROUND_PANEL_GRID =
  "grid min-h-0 w-full min-w-0 flex-1 grid-cols-1 gap-4 overflow-hidden lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:grid-rows-[minmax(0,1fr)] lg:items-stretch lg:gap-8";

/** Three-column layout for GraphQL: schema sidebar | editor | response. */
export const GRAPHQL_PANEL_GRID =
  "grid min-h-0 w-full min-w-0 flex-1 grid-cols-1 gap-4 overflow-hidden lg:grid-cols-[220px_minmax(0,1fr)_minmax(0,1fr)] lg:grid-rows-[minmax(0,1fr)] lg:items-stretch lg:gap-8";

export const PLAYGROUND_PANEL_LEFT =
  "flex h-full min-h-0 min-w-0 flex-col gap-3 overflow-hidden [scrollbar-gutter:stable] lg:pr-1";

export const PLAYGROUND_PANEL_RIGHT = "flex h-full min-h-0 min-w-0 flex-col overflow-hidden";
