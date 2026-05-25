# Spec: Playground IDE Redesign

## Objective

Redesign the Playground page from a header-led, horizontal-tab card-stack layout into a clean, IDE-style shell — targeting power users who run real queries repeatedly while remaining approachable for first-time visitors.

**User stories:**
- As a power user, I can switch protocols instantly via a persistent icon rail without scrolling past a page header
- As a GraphQL user, I can click any schema field and get a working query with all scalar fields inserted immediately — no checkbox flow
- As a REST/WS/Socket.IO user, I get a focused 2-pane layout with request controls on the left and response on the right, with no extra chrome
- As a first-timer, I see curated preset chips that load a real working example in one click

**Success looks like:**  
Land on `/playground`, click a protocol icon, click a schema field (GraphQL) or preset chip, hit Send — see a real response — without touching the keyboard.

## Tech Stack

- Next.js 15 (App Router), React 19, TypeScript 5.7
- Tailwind CSS v4, Radix UI Tabs (keep for accessibility primitives)
- Zustand (available for schema sidebar open state + localStorage persistence)
- Vitest + Testing Library (existing test suite must stay green)
- `bun` for all package/script operations

## Commands

```
Dev:       bun run dev          (server always running, never start it)
Test:      bun run test         (vitest run)
Typecheck: bun run typecheck    (tsc --noEmit)
Lint:      bun run lint
```

## Project Structure (affected paths)

```
apps/web/src/
  app/playground/page.tsx                        → no change (delegates to Playground)
  components/playground/
    Playground.tsx                               → remove <header>, switch to row layout
    PlaygroundTabs.tsx                           → refactor into ProtocolRail + content area
    ProtocolRail.tsx                             → NEW: vertical icon sidebar
    graphql/
      GraphqlPanel.tsx                           → 3-pane layout (schema + editor + response)
      SchemaPanel.tsx                            → rewrite: click-to-insert-all, no checkboxes
      GraphqlRequestBar.tsx                      → remove Schema toggle button
    shared/
      panel-layout.ts                            → update layout constants
  tests/
    playground-layout.test.tsx                   → update for new shell layout
    playground-graphql-schema.test.tsx            → update for new schema interaction
    playground-foundation.test.tsx               → update for removed header
```

## Layout Architecture

### Shell (`Playground.tsx`)
```
┌─────────────────────────────────────────────────┐
│ [Icon Rail] │        Protocol Content            │
│  REST        │                                   │
│  GraphQL     │  (each protocol owns its layout)  │
│  WS          │                                   │
│  Socket.IO   │                                   │
└─────────────────────────────────────────────────┘
```
- Remove `<header>` (h1 + description paragraph) entirely
- Icon rail: narrow fixed-width left column (~48–56px), full height
- Each icon shows protocol abbreviation or icon; active state highlighted with accent color
- No labels needed (tooltips on hover are sufficient)

### GraphQL Pane (3-pane)
```
┌────────────┬──────────────────┬──────────────┐
│  Schema    │  Query Editor    │   Response   │
│  Sidebar   │  (+ Variables)   │              │
│            │  [preset chips]  │              │
│  (collaps) │  [URL bar+Send]  │              │
└────────────┴──────────────────┴──────────────┘
```
- Schema sidebar: ~220px, collapsible (toggle button in editor toolbar), state in localStorage
- Click a root field → `onSelect(rootField)` fires immediately, inserts query with ALL scalar fields. No "Apply to query" button, no checkboxes.
- URL bar + Send button spans top of editor column
- Preset chips in editor column below URL bar
- Variables editor below query editor (collapsible)

### REST Pane (2-pane)
```
┌──────────────────────┬──────────────────┐
│  Request             │   Response       │
│  [preset chips]      │                  │
│  [method + URL + ▶]  │                  │
│  [headers]           │                  │
│  [body]              │                  │
└──────────────────────┴──────────────────┘
```
- Same functional behavior, tighter visual — presets move inside the left column

### WebSocket / Socket.IO Pane (2-pane)
```
┌──────────────────────┬──────────────────┐
│  Controls            │   Event Log      │
│  [connect bar]       │                  │
│  [preset chips]      │                  │
│  [composer]          │                  │
└──────────────────────┴──────────────────┘
```
- Presets move into the left column (no separate row above the grid)
- EndpointInfo stays as a subtle description below the connect bar

## Code Style

```tsx
// Protocol rail icon — simple, no prop explosion
type Protocol = "rest" | "graphql" | "websocket" | "socketio";

const PROTOCOL_LABELS: Record<Protocol, string> = {
  rest: "REST",
  graphql: "GQL",
  websocket: "WS",
  socketio: "SIO",
};

// Schema click handler — direct, no intermediate state
function handleFieldClick(rootField: GraphqlRootField) {
  const allScalars = rootField.selectableScalars;
  onSelect(rootField.name, allScalars);
}
```

- No magic strings for protocol IDs — use the `Protocol` union type
- localStorage key for schema sidebar: `"mf_schema_sidebar_open"` (consistent `mf_` prefix)
- Prefer `data-*` attributes over className logic for state-driven styles where Tailwind v4 data variants apply

## Testing Strategy

- Framework: Vitest + Testing Library (existing setup)
- Tests live in `apps/web/src/tests/`
- **Existing tests must stay green** — update selectors/assertions as layout changes, do not delete tests
- New behaviour to cover:
  - Schema field click inserts query with all scalar fields (no button click)
  - Schema sidebar toggle persists state in localStorage
  - Protocol rail switches active panel
  - Header/description no longer in DOM

## Boundaries

- **Always:** Run `bun run typecheck` after each task. Keep existing tests passing or update them. Use CSS variables (`var(--color-*)`) for all colors — no hardcoded hex.
- **Ask first:** Adding new npm/bun dependencies. Changing the GraphQL URL or mock data structure. Altering `build-operation.ts` query-building logic beyond what schema changes require.
- **Never:** Commit. Remove existing tests without replacing them. Break the `onConfirm` / `applySchemaSelection` contract without updating all callers. Hardcode localhost URLs (use existing env helpers).

## Success Criteria

1. `/playground` renders with no visible page header (h1 or description paragraph gone)
2. Vertical icon rail shows 4 protocol icons; clicking each switches the main content area
3. GraphQL: clicking a schema root field immediately populates the query editor with a complete operation (all scalar fields) — no "Apply to query" button click required
4. Schema sidebar is collapsible; collapsed/expanded state survives a page refresh (localStorage)
5. REST, WebSocket, Socket.IO: preset chips render inside their respective left-column, not above the 2-column grid
6. All existing Vitest tests pass (`bun run test`)
7. TypeScript reports zero errors (`bun run typecheck`)
8. UI functions on viewport widths ≥ 1024px (primary target); degrades gracefully on smaller screens (icon rail collapses to top bar or hidden)

## Open Questions

- None — all confirmed via interview and codebase review.
