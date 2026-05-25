# Tasks: Playground IDE Redesign

Spec: `agent_docs/playground-ide-redesign-spec.md`  
Branch: `feature/enhancements`

---

## Phase 1 — Shell & Protocol Rail

### Task 1.1 — Remove page header from Playground.tsx
- **Acceptance:** The `<header>` block (h1 "Playground" + description `<p>`) is deleted. The `<main>` becomes a full-height flex-row container that holds the icon rail + content area.
- **Verify:** `bun run typecheck` passes. `playground-foundation.test.tsx` updated to not assert on h1/description text.
- **Files:** `apps/web/src/components/playground/Playground.tsx`, `apps/web/src/tests/playground-foundation.test.tsx`

### Task 1.2 — Create ProtocolRail component
- **Acceptance:** New `ProtocolRail.tsx` renders a narrow vertical column (~52px wide, full height) with 4 icon buttons: REST, GraphQL, WS, SIO. Active protocol gets accent color highlight. Tooltips on hover show full protocol name. Accepts `active: Protocol` and `onChange: (p: Protocol) => void` props.
- **Verify:** Component renders without errors. No new runtime dependencies added.
- **Files:** `apps/web/src/components/playground/ProtocolRail.tsx` (new)

### Task 1.3 — Wire ProtocolRail into Playground shell
- **Acceptance:** `Playground.tsx` renders `ProtocolRail` on the left + the active panel's content on the right in a `flex-row` layout. `PlaygroundTabs.tsx` is removed or gutted (Radix Tabs root stays for accessibility if needed). Protocol state lives in `Playground.tsx` (or Zustand if already used for similar state).
- **Verify:** Clicking each icon shows the correct panel. `bun run test` passes (update `playground-layout.test.tsx` selectors as needed).
- **Files:** `apps/web/src/components/playground/Playground.tsx`, `apps/web/src/components/playground/PlaygroundTabs.tsx`, `apps/web/src/tests/playground-layout.test.tsx`

---

## Phase 2 — GraphQL Schema Sidebar (Click-to-Insert-All)

### Task 2.1 — Rewrite SchemaPanel: remove checkboxes + Apply button
- **Acceptance:** `SchemaPanel` shows a flat scrollable list of root fields (Query and Mutation sections). Each field is a single clickable row showing `fieldName` and `returnType`. No checkboxes. No "Apply to query" button. Clicking a field immediately calls `onSelect(fieldName, allScalars)` with every scalar in `field.selectableScalars`. The `onConfirm` prop is renamed `onSelect` with the same signature `(rootField: string, selectedFields: readonly string[]) => void`.
- **Verify:** `bun run test` — `playground-graphql-schema.test.tsx` updated to assert click-fires-onSelect behavior. No "Apply to query" button in DOM.
- **Files:** `apps/web/src/components/playground/graphql/SchemaPanel.tsx`, `apps/web/src/tests/playground-graphql-schema.test.tsx`

### Task 2.2 — Make schema sidebar collapsible with localStorage persistence
- **Acceptance:** Schema sidebar defaults to collapsed. A toggle icon button (e.g. `«`/`»` chevron) in the GraphQL editor toolbar expands/collapses the sidebar. State is read from and written to `localStorage` key `"mf_schema_sidebar_open"` on mount and on toggle.
- **Verify:** Toggle works. Hard refresh preserves state. `bun run typecheck` clean.
- **Files:** `apps/web/src/components/playground/graphql/GraphqlPanel.tsx`

### Task 2.3 — Update GraphqlPanel to 3-pane layout
- **Acceptance:** `GraphqlPanel` renders: `[schema sidebar (collapsible)] | [editor column: URL bar + preset chips + query editor + variables] | [response]`. `schemaOpen` state and `onToggleSchema` are removed from `GraphqlRequestBar` (no longer needed there). `applySchemaSelection` callback is wired to new `SchemaPanel.onSelect`.
- **Verify:** Send a query, get a response. Click schema field, query populates. Schema toggle works. `playground-graphql.test.tsx` stays green.
- **Files:** `apps/web/src/components/playground/graphql/GraphqlPanel.tsx`, `apps/web/src/components/playground/graphql/GraphqlRequestBar.tsx`

### Task 2.4 — Update panel-layout.ts for 3-pane GraphQL
- **Acceptance:** Add a `GRAPHQL_PANEL_GRID` constant for the 3-column layout (`schema | editor | response`). Existing `PLAYGROUND_PANEL_GRID` (2-column) stays for REST/WS/SIO. Schema column only renders when sidebar is open.
- **Verify:** `bun run typecheck` clean.
- **Files:** `apps/web/src/components/playground/shared/panel-layout.ts`

---

## Phase 3 — REST, WebSocket, Socket.IO Tidy-Up

### Task 3.1 — Move REST preset chips inside the left column
- **Acceptance:** `RestPanel` no longer renders `<PresetPicker>` in a dedicated `shrink-0` row above the grid. The preset chips move into the top of `PLAYGROUND_PANEL_LEFT`, above `MethodUrlBar`. Visual result: 2-pane grid fills the full content area from top, no separate chip row above it.
- **Verify:** `playground-rest-panel.test.tsx` stays green (update selectors if needed).
- **Files:** `apps/web/src/components/playground/rest/RestPanel.tsx`, `apps/web/src/tests/playground-rest-panel.test.tsx`

### Task 3.2 — Move WsPanel preset chips inside the left column
- **Acceptance:** `WsPanel` moves `<PresetPicker>` inside `PLAYGROUND_PANEL_LEFT`, below `ConnectionBar` and `EndpointInfo`. Grid fills full height from top.
- **Verify:** `playground-ws-panel.test.tsx` stays green.
- **Files:** `apps/web/src/components/playground/ws/WsPanel.tsx`, `apps/web/src/tests/playground-ws-panel.test.tsx`

### Task 3.3 — Move SocketIoPanel preset chips inside the left column
- **Acceptance:** Both `SOCKETIO_PRESETS` and `SOCKETIO_EMIT_PRESETS` pickers render inside `PLAYGROUND_PANEL_LEFT` (namespace presets above `NamespaceBar`, emit presets above `EmitComposer`). The outer `shrink-0` row is removed.
- **Verify:** `playground-socketio-panel.test.tsx` stays green.
- **Files:** `apps/web/src/components/playground/socketio/SocketIoPanel.tsx`, `apps/web/src/tests/playground-socketio-panel.test.tsx`

---

## Phase 4 — Verification & Polish

### Task 4.1 — Full test suite green
- **Acceptance:** `bun run test` exits 0. All existing playground test files pass. No skipped or deleted tests without replacement.
- **Verify:** `bun run test`

### Task 4.2 — TypeScript clean
- **Acceptance:** `bun run typecheck` exits 0. No `any` introduced. `Protocol` union type used consistently.
- **Verify:** `bun run typecheck`

### Task 4.3 — Responsive fallback for icon rail
- **Acceptance:** On viewports < 1024px, the icon rail collapses to a horizontal top bar (same 4 icons, horizontal layout) using a Tailwind responsive variant. Layout does not overflow or break.
- **Verify:** Browser resize to 768px — no horizontal scroll, all 4 icons accessible.
- **Files:** `apps/web/src/components/playground/ProtocolRail.tsx`, `apps/web/src/components/playground/Playground.tsx`

---

## Dependency Order

```
1.1 → 1.2 → 1.3          (shell must exist before wiring)
2.1 → 2.3 → 2.2          (schema API changes before layout, then sidebar state)
2.4 can run parallel to 2.2
3.1, 3.2, 3.3 independent of each other, depend on 1.3 being done
4.1, 4.2 after all above
4.3 after 1.2
```

## Estimated Scope

| Phase | Tasks | Files touched |
|-------|-------|---------------|
| 1 — Shell | 3 | 4 |
| 2 — GraphQL | 4 | 5 |
| 3 — REST/WS/SIO | 3 | 6 |
| 4 — Verification | 3 | 2 |
| **Total** | **13** | **~17** |
