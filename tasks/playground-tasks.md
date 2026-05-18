# Implementation Plan: MockForge Playground

Spec: [`agent_docs/playground-spec.md`](../agent_docs/playground-spec.md)

## Overview

Build a `/playground` page in `apps/web` with four tabs (REST, GraphQL, WebSocket, Socket.IO) that exercise the existing pre-seeded MockForge API. Stateless, design-system-compliant, no persistence. Vertical-sliced delivery: each tab is independently shippable after the shared shell exists.

## Architecture Decisions

- **Single page, Radix Tabs**, not separate routes — matches the "single page, 4 tabs" intent and keeps tab teardown side-effects local.
- **Stateless by design** — no `localStorage`, no Zustand store. Component-local `useState` only. Switching tabs unmounts panels so sockets clean up.
- **Reuse `apiClient`** for REST, since it already handles `X-MF-ID`. GraphQL goes through the same `apiClient` to `/graphql`.
- **Native `WebSocket`** for the WS tab — no extra dep, matches the pattern in `hooks/use-ws-stats.ts`.
- **`socket.io-client`** for the Socket.IO tab — one new dependency, only added in `apps/web`.
- **Shared `EventLog`** component reused between WS and Socket.IO tabs.
- **Presets are static** (a typed array in `presets.ts`), not fetched.

## Task List

### Phase 1: Foundation

#### Task 1: Add `socket.io-client` dependency and env defaults

**Description:** Install `socket.io-client` in `apps/web`. Add `NEXT_PUBLIC_SOCKETIO_URL` default to the playground module (no change to `.env.example` unless asked).

**Acceptance criteria:**
- [x] `socket.io-client` appears in `apps/web/package.json` dependencies.
- [x] `bun install` completes cleanly at repo root.

**Verification:**
- [x] `bun run typecheck` passes.
- [x] `import { io } from "socket.io-client"` resolves in a scratch file (no compile error).

**Dependencies:** None

**Files likely touched:**
- `apps/web/package.json`
- `bun.lock`

**Estimated scope:** XS

---

#### Task 2: Scaffold `/playground` route + shell + tabs

**Description:** Create the route entry, top-level `Playground` shell (header + intro + tab nav), and a `PlaygroundTabs` component using Radix Tabs with four empty panel placeholders. Match builder/Hero visual patterns (rounded-xl panels, CSS-variable tokens, Bricolage Grotesque).

**Acceptance criteria:**
- [x] Visiting `/playground` renders without errors.
- [x] Four tabs visible: REST, GraphQL, WebSocket, Socket.IO.
- [x] Switching tabs swaps the panel content (placeholders ok).
- [x] Active tab uses `var(--color-accent)`; inactive uses `var(--color-text-muted)`.
- [x] Keyboard navigation works (Tab moves focus; Arrow keys switch tabs per Radix default).

**Verification:**
- [x] `bun run typecheck` and `bun run lint` pass.
- [x] Manual: open `/playground` in browser, click each tab, tab with keyboard.

**Dependencies:** Task 1

**Files likely touched:**
- `apps/web/src/app/playground/page.tsx`
- `apps/web/src/components/playground/Playground.tsx`
- `apps/web/src/components/playground/PlaygroundTabs.tsx`

**Estimated scope:** S

---

#### Task 3: Shared primitives — `StatusPill`, `JsonView`, `PresetPicker`, `presets.ts`

**Description:** Build the small shared UI primitives used by multiple tabs and the static preset catalogue defined in the spec.

**Acceptance criteria:**
- [x] `StatusPill` renders a colored pill for states: `idle`, `connecting`, `connected`, `error`, plus HTTP status codes (2xx green, 4xx amber, 5xx red — using existing tokens, no new colors).
- [x] `JsonView` pretty-prints arbitrary JSON read-only with monospace, scrollable.
- [x] `PresetPicker` renders a horizontal chip row from a typed `Preset[]` and calls `onSelect(preset)`.
- [x] `presets.ts` exports typed arrays: `REST_PRESETS`, `GRAPHQL_PRESETS`, `WS_PRESETS`, `SOCKETIO_PRESETS` — contents match spec § Pre-seeded Demo Presets exactly.

**Verification:**
- [x] `bun run typecheck` passes.
- [x] Component-mount smoke test for `StatusPill` and `PresetPicker`.

**Dependencies:** Task 2

**Files likely touched:**
- `apps/web/src/components/playground/shared/StatusPill.tsx`
- `apps/web/src/components/playground/shared/JsonView.tsx`
- `apps/web/src/components/playground/shared/PresetPicker.tsx`
- `apps/web/src/components/playground/shared/presets.ts`

**Estimated scope:** S

---

### Checkpoint: Foundation
- [x] `/playground` loads, four tabs switchable, no console errors.
- [x] Typecheck + lint clean.
- [x] Visual review confirms tokens/typography match builder + Hero.

---

### Phase 2: REST slice (vertical)

#### Task 4: `MethodUrlBar` + `HeadersEditor` + `BodyEditor`

**Description:** Build the three input controls for the REST tab.

**Acceptance criteria:**
- [x] `MethodUrlBar` renders a method `<select>` (GET/POST/PUT/DELETE), URL `<input>`, Send button. Disables Send while loading.
- [x] `HeadersEditor` renders key/value rows with add/remove. Starts with one empty row.
- [x] `BodyEditor` is a JSON `<textarea>` with inline validation: if non-empty and not valid JSON, show an error line and block Send (parent reads `isValid`).
- [x] All three use design-system tokens; inputs are `rounded-lg`, panels `rounded-xl`.

**Verification:**
- [x] Typecheck + lint pass.
- [x] Component tests: invalid JSON in body produces `isValid=false`; adding header rows updates state.

**Dependencies:** Task 3

**Files likely touched:**
- `apps/web/src/components/playground/rest/MethodUrlBar.tsx`
- `apps/web/src/components/playground/rest/HeadersEditor.tsx`
- `apps/web/src/components/playground/rest/BodyEditor.tsx`

**Estimated scope:** S

---

#### Task 5: `use-rest-request` hook + `ResponseViewer`

**Description:** TanStack Query mutation that sends the request via `apiClient` (or `fetch` directly to measure timing/status/headers — `apiClient` throws on non-2xx which we need to render, so a thin local `fetch` wrapper is acceptable). `ResponseViewer` shows status pill, response time (ms), pretty-printed body, and headers panel.

**Acceptance criteria:**
- [x] Hook returns `{ send, isLoading, response, error }` where `response` contains `{ status, statusText, timeMs, body, headers }`.
- [x] Timing measured with `performance.now()` around the fetch.
- [x] Non-2xx responses still populate `response` (do not throw) so the viewer can render error bodies.
- [x] `ResponseViewer` renders empty state ("Send a request to see the response") when no response yet.

**Verification:**
- [x] Component test mocks `fetch` and asserts the viewer renders status 200 + body.
- [x] Component test asserts 404 renders the error body, not a blank state.

**Dependencies:** Task 4

**Files likely touched:**
- `apps/web/src/hooks/use-rest-request.ts`
- `apps/web/src/components/playground/rest/ResponseViewer.tsx`

**Estimated scope:** S

---

#### Task 6: `RestPanel` — wire it together

**Description:** Compose `PresetPicker` + `MethodUrlBar` + `HeadersEditor` + `BodyEditor` + `ResponseViewer` into the REST tab. Picking a preset populates method, URL, and body (clears existing headers to one empty row).

**Acceptance criteria:**
- [x] Selecting a REST preset populates the inputs but does not auto-send.
- [x] Clicking Send fires the request and the viewer updates.
- [x] Responsive: at < 768px the request / response panels stack vertically; at ≥ 1024px they sit side-by-side.

**Verification:**
- [x] Component test: select preset → click Send → mocked response renders.
- [x] Manual: in browser, run `GET /api/users` against local API and confirm a populated response.

**Dependencies:** Task 5

**Files likely touched:**
- `apps/web/src/components/playground/rest/RestPanel.tsx`
- `apps/web/src/components/playground/PlaygroundTabs.tsx` (mount `RestPanel`)

**Estimated scope:** S

---

### Checkpoint: REST slice
- [x] User can fire a real REST request against the dev API and see the response.
- [x] Component tests for the REST slice pass.

---

### Phase 3: GraphQL slice

#### Task 7: `QueryEditor` + `VariablesEditor` + `use-graphql-request` + `GraphqlPanel`

**Description:** GraphQL tab. Query editor is a tall monospaced textarea; variables editor is a JSON textarea with the same validation pattern as `BodyEditor`. Hook POSTs to `/graphql` with `{ query, variables }`. Reuses `ResponseViewer` (or a thin wrapper) and `PresetPicker`.

**Acceptance criteria:**
- [x] Selecting a GraphQL preset populates query + variables.
- [x] Invalid variables JSON blocks Send.
- [x] Submitting renders the GraphQL response (data or errors) in the response viewer.

**Verification:**
- [x] Component test mocks `fetch` to `/graphql`, asserts request body shape and rendered response.
- [x] Manual: run a list-users query against the dev API.

**Dependencies:** Task 6

**Files likely touched:**
- `apps/web/src/components/playground/graphql/QueryEditor.tsx`
- `apps/web/src/components/playground/graphql/VariablesEditor.tsx`
- `apps/web/src/components/playground/graphql/GraphqlPanel.tsx`
- `apps/web/src/hooks/use-graphql-request.ts`
- `apps/web/src/components/playground/PlaygroundTabs.tsx`

**Estimated scope:** M

---

### Phase 4: WebSocket slice

#### Task 8: `use-ws-console` hook + `EventLog`

**Description:** Hook that owns the `WebSocket` lifecycle: connect, disconnect, send, and a bounded event buffer (cap at e.g. 500 events). `EventLog` renders the buffer with timestamps, message direction (in/out), and auto-scroll to bottom unless the user has scrolled up.

**Acceptance criteria:**
- [x] `useWsConsole(url)` returns `{ status, events, connect, disconnect, send }`.
- [x] `status` cycles `idle → connecting → connected → idle` (or `error`).
- [x] Unmount or `disconnect()` closes the socket; no leaks.
- [x] Event buffer is bounded — overflow drops oldest.
- [x] `EventLog` shows monospace `[HH:MM:SS.mmm] ← message` / `→ message` rows.

**Verification:**
- [x] Unit test with a mocked `WebSocket` global: connect → onmessage → events array updates; disconnect → status `idle`.
- [x] Component test asserts auto-scroll behavior at minimum (`scrollTop` updates on new event).

**Dependencies:** Task 3

**Files likely touched:**
- `apps/web/src/hooks/use-ws-console.ts`
- `apps/web/src/components/playground/ws/EventLog.tsx`

**Estimated scope:** M

---

#### Task 9: `ConnectionBar` + `MessageComposer` + `WsPanel`

**Description:** Compose the WS tab UI. `ConnectionBar` has URL input + Connect/Disconnect button + `StatusPill`. `MessageComposer` is a textarea + Send button, disabled when not connected. Selecting a WS preset populates the URL.

**Acceptance criteria:**
- [x] Connect button starts a real WS connection, status pill flips to "Connected".
- [x] Sending a message appends an outgoing `→` entry; incoming messages appear as `←` entries.
- [x] Switching away from the WS tab disconnects the socket (unmount cleanup).
- [x] Disconnect button cleanly closes the socket.

**Verification:**
- [x] Component test (mocked `WebSocket`): click Connect → status `connected`; type + Send → outgoing event appears; unmount → mock `close()` called.
- [x] Manual: connect to `ws://localhost:4000/ws/ticker`, see streaming ticks in the log.

**Dependencies:** Task 8, Task 6

**Files likely touched:**
- `apps/web/src/components/playground/ws/ConnectionBar.tsx`
- `apps/web/src/components/playground/ws/MessageComposer.tsx`
- `apps/web/src/components/playground/ws/WsPanel.tsx`
- `apps/web/src/components/playground/PlaygroundTabs.tsx`

**Estimated scope:** S

---

### Phase 5: Socket.IO slice

#### Task 10: `use-socketio-console` hook

**Description:** Hook that owns the Socket.IO lifecycle: connect to `{baseUrl}{namespace}`, subscribe to one event name, emit events, and feed the same `EventLog`-compatible event buffer. Mirrors `use-ws-console` shape.

**Acceptance criteria:**
- [ ] `useSocketIoConsole({ url, namespace, listenEvent })` returns `{ status, events, connect, disconnect, emit }`.
- [ ] Connects via `io(\`${url}${namespace}\`)`, listens to `listenEvent`, captures both connect/disconnect lifecycle events into the log.
- [ ] `emit(eventName, payload)` validates payload is parseable JSON (or empty), then emits.
- [ ] Cleans up on unmount / disconnect.

**Verification:**
- [ ] Unit test with a mocked `socket.io-client` `io()` factory.
- [ ] Manual: connect to `http://localhost:4001/ticker`, listen to `tick`, see events.

**Dependencies:** Task 8

**Files likely touched:**
- `apps/web/src/hooks/use-socketio-console.ts`

**Estimated scope:** S

---

#### Task 11: `NamespaceBar` + `EmitComposer` + `SocketIoPanel`

**Description:** Compose the Socket.IO tab. `NamespaceBar` has base URL + namespace + listen-event inputs + Connect/Disconnect + `StatusPill`. `EmitComposer` has event-name input + JSON payload textarea + Emit button. Reuses `EventLog`. Selecting a preset populates URL + namespace + event.

**Acceptance criteria:**
- [ ] Preset selection populates the three inputs.
- [ ] Connect → status `connected`; emit appends `→ event(payload)` to the log; incoming events appear as `← event(payload)`.
- [ ] Tab unmount disconnects.

**Verification:**
- [ ] Component test (mocked `io`): Connect → status connected; Emit → mocked `socket.emit` called with `(eventName, parsedPayload)`.
- [ ] Manual: connect to `/ticker`, see incoming events.

**Dependencies:** Task 10, Task 9

**Files likely touched:**
- `apps/web/src/components/playground/socketio/NamespaceBar.tsx`
- `apps/web/src/components/playground/socketio/EmitComposer.tsx`
- `apps/web/src/components/playground/socketio/SocketIoPanel.tsx`
- `apps/web/src/components/playground/PlaygroundTabs.tsx`

**Estimated scope:** M

---

### Checkpoint: All four tabs functional
- [ ] Each tab can complete its primary flow against the dev API.
- [ ] Tab switch tears down any open socket.
- [ ] All component tests pass.

---

### Phase 6: Polish, accessibility, discoverability

#### Task 12: Responsive + accessibility pass

**Description:** Verify and adjust layouts at 320 / 768 / 1024 / 1440 px. Audit focus rings, ARIA labels on icon-only buttons (Connect/Disconnect, Send, Emit, header row remove), and that Radix Tabs announces correctly.

**Acceptance criteria:**
- [ ] No horizontal scroll at 320 px on any tab.
- [ ] Request / response stack vertically below 768 px on REST and GraphQL.
- [ ] All interactive elements reachable via Tab; visible focus rings.
- [ ] Icon-only buttons have `aria-label`.
- [ ] No axe-core violations on `/playground` (dev tools manual check).

**Verification:**
- [ ] Manual at four breakpoints.
- [ ] Manual axe scan.

**Dependencies:** Task 11

**Files likely touched:**
- Any panel/component needing tweaks (≤ 5 files).

**Estimated scope:** S

---

#### Task 13: Entry-point link

**Description:** Add a link to `/playground` from the Footer (always) and a secondary CTA in the Hero ("Try the playground →"). Open question in spec defaulted to Footer + Hero secondary CTA.

**Acceptance criteria:**
- [ ] Footer contains a `Playground` link.
- [ ] Hero has a secondary CTA that links to `/playground`, styled per existing secondary-button pattern.

**Verification:**
- [ ] Existing landing test still passes; add an assertion that the Footer renders a Playground link.
- [ ] Manual: click from landing → arrives at `/playground`.

**Dependencies:** Task 12

**Files likely touched:**
- `apps/web/src/components/landing/Footer.tsx`
- `apps/web/src/components/landing/Hero.tsx`
- `apps/web/src/tests/landing.test.tsx`

**Estimated scope:** XS

---

#### Task 14: E2E happy-path spec (optional but recommended)

**Description:** One Playwright spec that loads `/playground`, switches each tab, fires a `GET /api/users`, and asserts the response panel populates. Skip gracefully if the dev API isn't reachable.

**Acceptance criteria:**
- [ ] Spec passes locally with both `apps/web` and `apps/api` dev servers running.
- [ ] Spec is tagged so CI can skip it if the API isn't available.

**Verification:**
- [ ] `bun run test:e2e` passes locally.

**Dependencies:** Task 13

**Files likely touched:**
- `e2e/playground.spec.ts`

**Estimated scope:** S

---

### Checkpoint: Complete
- [ ] All 11 acceptance criteria in spec § Success Criteria are demonstrably true.
- [ ] `bun run verify` (lint + format + typecheck) is clean.
- [ ] `bun run test` is clean.
- [ ] Visual + a11y review with the user.

## Risks and Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| `apiClient` throws on non-2xx, hiding error bodies the playground must show | Medium | Use a thin local `fetch` wrapper in `use-rest-request` instead of `apiClient`; still forward `X-MF-ID` from `use-mf-id`. |
| WS / Socket.IO connections leak on tab switch | High | Ownership in hooks with `useEffect` cleanup; component tests assert `close()` called on unmount. |
| `socket.io-client` bundle bloat | Low | Only loaded on `/playground` (Next.js code-splits by route); acceptable for a dedicated playground page. |
| CORS / mixed-content for Socket.IO port 4001 in production | Medium | Env-var driven base URL; document that the playground assumes the API stack is reachable from the browser. Out of scope for first cut. |
| Auto-scrolling log fights the user when they scroll up | Low | Track `isPinnedToBottom` and only auto-scroll when true (covered in Task 8 acceptance). |

## Open Questions (carried from spec)

- Hero CTA placement (defaulted: secondary CTA + Footer link). confirmed
- Reset button per tab (defaulted: none). confirmed
- Expose `X-MF-ID` in REST UI (defaulted: no). confirmed
- Multi-event subscription for Socket.IO (defaulted: single subscription). confirmed

Confirm or override before starting Phase 6 Task 13.
