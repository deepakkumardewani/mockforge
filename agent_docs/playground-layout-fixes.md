# Implementation Plan: Playground Layout Stability

## Overview

Fix three layout stability issues in the Playground page:
1. Response column width shifts when JSON content is wide
2. Switching between REST / GraphQL / WebSocket / Socket.IO tabs causes visible layout jumps (different heights, gaps, and overflow handling per tab)
3. Confirm shared components are in the right place (`ResponseViewer` and `EventLog` are already shared but live in protocol-specific folders)

## Root Cause Analysis

### Issue 1 — Response column width driven by content
- `ResponseViewer` section uses `h-full` but no `overflow-hidden`, so wide JSON strings expand the column
- `JsonView` renders raw content without horizontal overflow containment
- The grid column has `min-w-0` but the content inside can still push past it

### Issue 2 — Tab layout shifts
| Tab | Root div | gap | Tab content classes |
|-----|----------|-----|---------------------|
| REST | `flex h-full min-h-0 flex-col gap-4` | grid `lg:gap-8` | `flex min-h-0 flex-1 flex-col overflow-hidden` |
| GraphQL | `flex h-full min-h-0 flex-col gap-6` | grid `lg:gap-10` | `flex min-h-0 flex-1 flex-col overflow-hidden` |
| WebSocket | `flex min-h-0 flex-col gap-8` — **no `h-full`** | grid `lg:gap-10` | `min-h-0 flex-1 overflow-y-auto` — **no `flex flex-col`** |
| Socket.IO | `flex min-h-0 flex-col gap-8` — **no `h-full`** | grid `lg:gap-10` | `min-h-0 flex-1 overflow-y-auto` — **no `flex flex-col`** |

### Issue 3 — Shared component location
- `ResponseViewer` already used by both REST and GraphQL (GraphqlPanel imports it from `rest/`)
- `EventLog` already shared between WS and SocketIO (SocketIoPanel imports it from `ws/`)
- Both should live in `shared/` to reflect their cross-protocol nature

---

## Architecture Decisions

- Do **not** add fixed pixel widths to columns — use flexbox/grid containment so layouts stay fluid
- Standardise on one set of gap and layout tokens across all four tabs so switching feels seamless
- Move shared display components to `playground/shared/` as a housekeeping step

---

## Task List

### Phase 1: Fix response column width instability

- [x] **Task 1: Contain horizontal overflow in ResponseViewer**

  **Description:** Wide JSON values (URLs, long strings) expand the response column and shift the two-column grid. Adding `overflow-hidden` to the section wrapper and `break-all` (or `overflow-wrap: anywhere`) to `JsonView` text will clip content within the column.

  **Acceptance criteria:**
  - [x] Pasting a response with a very long string value does not widen the right column
  - [x] The two-column grid stays 50/50 regardless of response body size
  - [x] Scrolling still works vertically inside the response body

  **Verification:**
  - [x] Load "List users" preset, send — verify columns don't shift
  - [x] Load "Product by id" in GraphQL, send — verify columns don't shift

  **Dependencies:** None

  **Files likely touched:**
  - `apps/web/src/components/playground/shared/ResponseViewer.tsx`
  - `apps/web/src/components/playground/shared/JsonView.tsx`

  **Estimated scope:** S

---

### Phase 2: Normalise tab content and panel layouts

- [x] **Task 2: Unify Tabs.Content classes in PlaygroundTabs**

  **Description:** WebSocket and Socket.IO `Tabs.Content` nodes are missing `flex flex-col`, which means the panel inside cannot fill the allocated height. REST and GraphQL already use `flex min-h-0 flex-1 flex-col overflow-hidden`. Apply the same class string to all four tabs.

  **Acceptance criteria:**
  - [x] All four `Tabs.Content` nodes have identical class strings
  - [x] Switching tabs does not change the overall height of the content area

  **Verification:**
  - [x] Click through all four tabs — header and tab-bar stay in the same vertical position
  - [x] No scrollbar appears/disappears on the page itself when switching tabs

  **Dependencies:** None

  **Files likely touched:**
  - `apps/web/src/components/playground/PlaygroundTabs.tsx`

  **Estimated scope:** XS

- [x] **Task 3: Normalise WsPanel and SocketIoPanel root layout**

  **Description:** Both panels are missing `h-full` on their root `div`, which prevents them from stretching to fill the tab content area. Add `h-full` and align their root gap to match the REST/GraphQL panels (`gap-4`).

  **Acceptance criteria:**
  - [x] `WsPanel` and `SocketIoPanel` roots use `flex h-full min-h-0 flex-col`
  - [x] The two-column grid inside each panel fills the available height

  **Verification:**
  - [x] WebSocket and Socket.IO tabs show the EventLog filling the right column like the response panel does in REST/GraphQL
  - [x] No blank whitespace below the panels when viewport is tall

  **Dependencies:** Task 2

  **Files likely touched:**
  - `apps/web/src/components/playground/ws/WsPanel.tsx`
  - `apps/web/src/components/playground/socketio/SocketIoPanel.tsx`

  **Estimated scope:** XS

- [x] **Task 4: Standardise grid gaps across all four panels**

  **Description:** REST uses `gap-4 lg:gap-8`; GraphQL uses `gap-6 lg:gap-10`; WS/SocketIO use `gap-8 lg:gap-10`. Pick one consistent set (`gap-4 lg:gap-8`) and apply it everywhere so column spacing is identical across tabs.

  **Acceptance criteria:**
  - [x] All four panels use the same gap values in their two-column grid and left-column stack
  - [x] No visible spacing jump when switching tabs

  **Verification:**
  - [x] Side-by-side visual comparison of all four tabs — spacing looks identical

  **Dependencies:** None (can run in parallel with Task 2)

  **Files likely touched:**
  - `apps/web/src/components/playground/rest/RestPanel.tsx`
  - `apps/web/src/components/playground/graphql/GraphqlPanel.tsx`
  - `apps/web/src/components/playground/ws/WsPanel.tsx`
  - `apps/web/src/components/playground/socketio/SocketIoPanel.tsx`

  **Estimated scope:** S

---

### Checkpoint: After Tasks 1–4
- [x] All four tabs render at the same height
- [x] Response/event-log column width is stable regardless of content
- [x] No horizontal scrollbar appears on any tab
- [x] `bun run build` passes with no errors

---

### Phase 3: Move shared display components to `shared/`

- [x] **Task 5: Move ResponseViewer to `shared/`**

  **Description:** `ResponseViewer` is consumed by both `RestPanel` and `GraphqlPanel` but lives under `rest/`. Move it to `playground/shared/ResponseViewer.tsx` and update the two import paths.

  **Acceptance criteria:**
  - [x] File exists at `apps/web/src/components/playground/shared/ResponseViewer.tsx`
  - [x] No file remains at `apps/web/src/components/playground/rest/ResponseViewer.tsx`
  - [x] Both panels compile and render correctly

  **Verification:**
  - [x] `bun run build` passes
  - [x] REST and GraphQL response panels still display correctly

  **Dependencies:** Tasks 1–4 complete (so we move the already-fixed file)

  **Files likely touched:**
  - `apps/web/src/components/playground/shared/ResponseViewer.tsx` (new)
  - `apps/web/src/components/playground/rest/ResponseViewer.tsx` (deleted)
  - `apps/web/src/components/playground/rest/RestPanel.tsx`
  - `apps/web/src/components/playground/graphql/GraphqlPanel.tsx`

  **Estimated scope:** S

- [x] **Task 6: Move EventLog to `shared/`**

  **Description:** `EventLog` is consumed by both `WsPanel` and `SocketIoPanel` but lives under `ws/`. Move it to `playground/shared/EventLog.tsx` and update both import paths.

  **Acceptance criteria:**
  - [x] File exists at `apps/web/src/components/playground/shared/EventLog.tsx`
  - [x] No file remains at `apps/web/src/components/playground/ws/EventLog.tsx`
  - [x] Both panels compile and render correctly

  **Verification:**
  - [x] `bun run build` passes
  - [x] WebSocket and Socket.IO event logs still display correctly

  **Dependencies:** Tasks 1–4 complete

  **Files likely touched:**
  - `apps/web/src/components/playground/shared/EventLog.tsx` (new)
  - `apps/web/src/components/playground/ws/EventLog.tsx` (deleted)
  - `apps/web/src/components/playground/ws/WsPanel.tsx`
  - `apps/web/src/components/playground/socketio/SocketIoPanel.tsx`

  **Estimated scope:** S

---

### Checkpoint: Final
- [x] All six tasks complete
- [x] `bun run build` passes clean
- [x] Click through all four tabs — no layout shift, no width jump, no height change
- [x] Response body with long strings stays within its column
- [x] `shared/` folder contains `ResponseViewer` and `EventLog`

---

## Risks and Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| `overflow-hidden` on ResponseViewer clips sticky headers or tooltips | Medium | Verify `details`/`summary` response-headers accordion still expands; use `overflow-hidden` only on the outer scroll boundary, not the section itself |
| Changing gaps breaks existing Playwright / component tests | Low | Run `bun test` after Task 4; spacing is visual-only so unit tests are unlikely to break |
| Moving files breaks barrel imports or lazy chunks | Low | Grep for all usages before deleting old paths |

## Open Questions

- Should `EventLog` accept a `className` prop so WS and SocketIO can tweak its height independently (e.g. SocketIO has a PresetPicker row that reduces available height)? **Resolved:** unified `h-full` layout matches ResponseViewer; no per-panel className needed.
