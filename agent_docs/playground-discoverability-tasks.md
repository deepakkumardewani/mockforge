# Implementation Plan: Playground Discoverability & UX Polish

> Source spec: [`playground-discoverability-spec.md`](./playground-discoverability-spec.md)

## Overview

Make every playground tab self-teaching: REST URL autocomplete + JSON body
formatting + "Response" heading; WS/Socket.IO message presets + endpoint info +
clear-log-on-connect; GraphQL field-checklist schema panel. A single static
catalogue (`playground-catalogue.ts`) feeds the REST suggestions and GraphQL
schema panel so nothing can reference a route or field that doesn't exist in
`apps/api`.

## Architecture Decisions

- **Single catalogue module.** `shared/playground-catalogue.ts` is the one source
  of truth for entities, REST endpoint patterns, and GraphQL root fields/selectable
  fields. Rationale: kills the existing duplication (`EntityBrowser`, `presets.ts`)
  and guarantees suggestions are real. Guarded by a unit test that cross-checks
  each generated route against the known router/verb matrix.
- **Static GraphQL schema, no introspection.** Schema is fixed by product design;
  the panel reads the catalogue, never the network.
- **Pure helpers, thin components.** Filtering/append logic lives in tested pure
  functions; components stay presentational and small.
- **Reuse, don't fork.** `ResponseViewer` is shared by REST + GraphQL — one edit
  fixes both. `EventLog` is shared by WS + Socket.IO — clear-on-connect handled at
  the hook/panel level, not by duplicating the log.

## Dependency Graph

```
Task 1 (catalogue + tests)
   ├── Task 3 (REST autocomplete)
   └── Task 7 (GraphQL SchemaPanel)  ──► Task 8 (wire into GraphqlPanel)
Task 2 (REST response heading + body format)        [independent]
Task 4 (clear-log-on-connect WS + SIO)              [independent]
   ├── Task 5 (WS message presets + info)
   └── Task 6 (SIO message presets + info)
```

---

## Task List

### Phase 1: Foundation + quick wins

## Task 1: Playground catalogue (single source of truth)

**Description:** Create `apps/web/src/components/playground/shared/playground-catalogue.ts`
exporting (a) the entity list with field names sourced from `packages/types/entities`,
(b) a generated REST endpoint matrix per entity — `GET /{e}`, `GET /{e}/search`,
`GET /{e}/:id`, `POST /{e}`, `PUT /{e}/:id`, `DELETE /{e}/:id` — plus `GET /stats`,
and (c) GraphQL root fields (list + single per entity) with their selectable
scalar/sub fields and CRUD mutation signatures. Export a pure `filterEndpoints(query)`
helper used by autocomplete.

**Acceptance criteria:**
- [x] Catalogue covers all 14 entities (users, products, posts, comments, todos,
      carts, messages, notifications, quotes, recipes, countries, companies,
      stocks, events) and excludes `custom` (dynamic) from autocomplete.
- [x] `filterEndpoints("user")` returns `users`, `users/:id`, `users/search`
      variants; empty query returns the full list; no result references a route
      absent from `apps/api/src/routes/rest`.
- [x] GraphQL root-field entries expose field names matching the entity interface.

**Verification:**
- [x] `cd apps/web && bun run test playground-catalogue` green
- [x] Cross-check test asserts every REST suggestion ∈ {list, search, by-id, create,
      update, delete} × known entities, and every GraphQL root field has a real type.
- [x] `bun run typecheck` clean.

**Dependencies:** None
**Files likely touched:** `shared/playground-catalogue.ts`, `tests/playground-catalogue.test.ts`
**Estimated scope:** M

---

## Task 2: REST response heading + JSON body formatting

**Description:** In `ResponseViewer.tsx` make the card's primary heading read
**"Response"** (keep the inner JSON block labelled "Body" beneath it). In
`BodyEditor.tsx` add a **Format** action that pretty-prints valid JSON (2-space
indent) and is a safe no-op on empty/invalid input.

**Acceptance criteria:**
- [x] Response card shows a visible "Response" heading; REST and GraphQL both inherit it.
- [x] Format button pretty-prints valid JSON; invalid/empty body is left unchanged
      with no thrown error and existing validity messaging intact.

**Verification:**
- [x] `bun run test playground-rest-panel playground-graphql` green (update assertions).
- [x] New test: format on valid JSON → indented; on invalid → unchanged.
- [x] Manual: REST tab shows "Response"; Format tidies a minified body.

**Dependencies:** None
**Files likely touched:** `shared/ResponseViewer.tsx`, `rest/BodyEditor.tsx`, `tests/playground-rest-panel.test.tsx`
**Estimated scope:** S

### Checkpoint: Phase 1
- [x] `bun run verify` + `bun run test` green. Catalogue is the sole route source.

---

### Phase 2: REST autocomplete

## Task 3: REST URL autocomplete with fixed `/api/` prefix

**Description:** Add `EndpointAutocomplete.tsx` and wire it into `MethodUrlBar.tsx`/
`RestPanel.tsx`. Display a fixed, non-editable `/api/` adornment; as the user types
the suffix, show a filtered listbox from `filterEndpoints`. Selecting a suggestion
fills the URL and sets the method when the route's verb is unambiguous. Keyboard:
↑/↓ to move, Enter to select, Esc to close.

**Acceptance criteria:**
- [x] `/api/` prefix is always visible and not part of the typed text.
- [x] Typing filters suggestions live; selecting fills URL + method.
- [x] Full keyboard nav + `role="listbox"/"option"` + `aria-selected`; closes on
      blur/Esc/select.

**Verification:**
- [x] `bun run test playground-rest-controls` (or new `playground-rest-autocomplete`) green.
- [x] Tests: filter-on-type, keyboard select, Esc close, method set on select.
- [x] Manual: type `prod` → `products`, `products/:id`, `products/search` appear.

**Dependencies:** Task 1
**Files likely touched:** `rest/EndpointAutocomplete.tsx`, `rest/MethodUrlBar.tsx`, `rest/RestPanel.tsx`, `tests/playground-rest-autocomplete.test.tsx`
**Estimated scope:** M

### Checkpoint: Phase 2
- [x] A cold user can construct any REST request from suggestions without docs.

---

### Phase 3: WS / Socket.IO discoverability

## Task 4: Clear logs on Connect (WS + Socket.IO)

**Description:** Ensure clicking **Connect** clears the prior session's event log
before the new stream begins, in both `use-ws-console` and `use-socketio-console`
(reset events state on connect). No persisted carry-over across reconnects.

**Acceptance criteria:**
- [x] After connect → events accrue → disconnect → reconnect, the log starts empty.
- [x] Applies to both WS and Socket.IO tabs.

**Verification:**
- [x] `bun run test playground-ws-eventlog use-socketio-console` green (add regression).
- [x] Manual: stream a few messages, reconnect, log resets.

**Dependencies:** None
**Files likely touched:** `hooks/use-ws-console.ts`, `hooks/use-socketio-console.ts`, `tests/*`
**Estimated scope:** S

---

## Task 5: WS message presets + endpoint info

**Description:** On the WS tab add clickable **message presets** that pre-fill the
`MessageComposer`, plus a one-line description of what the fixed endpoint streams
(via a small `EndpointInfo` element). Presets are message payloads (e.g. a `ping`,
a sample chat message). (Connection-endpoint switching is deferred — see spec Q1.)

**Acceptance criteria:**
- [x] At least 3 message presets render; clicking one fills the composer textarea.
- [x] A short endpoint description is visible above/near the composer.

**Verification:**
- [x] `bun run test playground-ws-panel` green (add preset-click assertion).
- [x] Manual: click a preset → composer populated → Send works when connected.

**Dependencies:** Task 4
**Files likely touched:** `ws/WsPanel.tsx`, `ws/MessageComposer.tsx` (or new `ws/MessagePresets.tsx`), `shared/presets.ts`, `tests/playground-ws-panel.test.tsx`
**Estimated scope:** S

---

## Task 6: Socket.IO message presets + endpoint info

**Description:** Mirror Task 5 on the Socket.IO tab — clickable emit presets that
pre-fill `EmitComposer` (event name + payload) and a one-line description per
namespace. Connection presets already exist; this adds the "what to emit" layer.

**Acceptance criteria:**
- [x] At least 3 emit presets render; clicking one fills event name + payload.
- [x] A short namespace/endpoint description is visible.

**Verification:**
- [x] `bun run test playground-socketio-panel` green (add preset-click assertion).
- [x] Manual: click preset → EmitComposer populated → Emit works when connected.

**Dependencies:** Task 4
**Files likely touched:** `socketio/SocketIoPanel.tsx`, `socketio/EmitComposer.tsx`, `shared/presets.ts`, `tests/playground-socketio-panel.test.tsx`
**Estimated scope:** S

### Checkpoint: Phase 3
- [x] WS + Socket.IO tabs answer "what do I test?" inline; logs reset on connect.

---

### Phase 4: GraphQL schema panel

## Task 7: GraphQL field-checklist SchemaPanel (presentational)

**Description:** Build `graphql/SchemaPanel.tsx` driven by the catalogue: list
Query and Mutation root fields grouped; expanding a root field reveals tickable
sub-fields; a confirm action emits a syntactically valid operation string. Pure
`buildOperation(rootField, selectedFields)` helper, unit-tested.

**Acceptance criteria:**
- [x] Renders Query + Mutation groups from the catalogue; root fields expand/collapse.
- [x] Ticking fields + confirm produces a valid op (e.g. `query { users { id email } }`).
- [x] `buildOperation` is pure and covered by tests (incl. zero-field guard).

**Verification:**
- [x] `bun run test playground-graphql-schema` green.
- [x] Tests: expand, tick, build op string, empty selection handled.

**Dependencies:** Task 1
**Files likely touched:** `graphql/SchemaPanel.tsx`, `tests/playground-graphql-schema.test.tsx`
**Estimated scope:** M

---

## Task 8: Wire SchemaPanel into GraphqlPanel (toggle + append)

**Description:** Add a toggleable drawer in `GraphqlPanel.tsx` (toggle from
`GraphqlRequestBar`, Hoppscotch-style "Schema" button) that mounts `SchemaPanel`.
Confirming a selection **appends** the built operation to `QueryEditor` without
clobbering existing content; preserve the 2-column request/response layout when
the drawer is closed.

**Acceptance criteria:**
- [x] Schema toggle opens/closes the panel; closed state keeps current layout.
- [x] Confirming a field selection appends a valid operation into the query editor.
- [x] Existing GraphQL preset flow still works.

**Verification:**
- [x] `bun run test playground-graphql` green (add toggle + append assertions).
- [x] Manual: open schema → pick `users` + `id,email` → query editor updated → Send returns 200.

**Dependencies:** Task 7
**Files likely touched:** `graphql/GraphqlPanel.tsx`, `graphql/GraphqlRequestBar.tsx`, `graphql/QueryEditor.tsx`, `tests/playground-graphql.test.tsx`
**Estimated scope:** M

### Checkpoint: Complete
- [ ] All success criteria in the spec met.
- [ ] `bun run verify` + `bun run test` green across the workspace.
- [ ] Manual pass on all four tabs by a "cold" user (no docs).
- [ ] Ready for review.

---

## Risks and Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| Catalogue drifts from real API routes/schema | High | Cross-check unit test (Task 1) asserting every suggestion maps to a real router/verb and field |
| `ResponseViewer`/`EventLog` shared edits regress the other tab | Med | Both tabs covered by existing tests; update assertions, run full suite at each checkpoint |
| Autocomplete keyboard/focus traps | Med | Explicit a11y tests (listbox/option, ↑/↓/Enter/Esc) in Task 3 |
| Scope creep: WS multi-endpoint switching | Med | Deferred per spec Q1; this pass adds message presets only |
| `buildOperation` produces invalid GraphQL | Med | Pure helper with unit tests incl. nested/empty cases (Task 7) |

## Open Questions (carried from spec — confirm before Phase 2/4)

1. WS: message presets only, or also endpoint switching? (assume message-only)
2. Autocomplete: fixed `/api/` adornment vs. pre-seeded editable input? (assume adornment)
3. Schema panel: toggleable drawer vs. always-visible third column? (assume drawer)

## Parallelization

- After Task 1: Task 3 and Task 7 can proceed in parallel.
- Task 2 and Task 4 are independent and can run anytime.
- Tasks 5 & 6 depend on Task 4 but are parallel to each other.
- Task 8 must follow Task 7.
