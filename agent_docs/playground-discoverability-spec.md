# Spec: Playground Discoverability & UX Polish

## Objective

Make the MockForge playground **self-teaching**. Today a developer who lands on
any playground tab (REST / WebSocket / Socket.IO / GraphQL) faces empty inputs
with no signal about what entities, endpoints, events, or schema fields exist —
forcing a trip to `/docs` before they can send a single request. This work
exposes "what's available" inline on every tab so a cold visitor can explore and
send a valid request without leaving the playground.

All three problem areas the user reported are **equally broken** and in scope:

1. **REST** — no URL guidance, raw response label, unformatted body.
2. **WS / Socket.IO** — no idea what to test; logs persist across reconnects.
3. **GraphQL** — fixed schema is hidden; user must hand-write valid queries.

### User Stories

- *As a first-time visitor on the REST tab*, when I focus the URL field and start
  typing after `/api/`, I see a dropdown of real endpoints (`users`, `users/:id`,
  `users/search`) so I never guess a route that doesn't exist.
- *As a visitor on the REST tab*, I can prettify my JSON request body with one
  action, and the response card is clearly headed **"Response"**.
- *As a visitor on the WS/Socket.IO tab*, I see clickable **message presets** that
  pre-fill the composer plus a short note on what the endpoint streams, so I know
  what to send. When I click **Connect**, the previous session's log is cleared.
- *As a visitor on the GraphQL tab*, I can open a **field-checklist schema panel**,
  expand a root field (e.g. `users`), tick the fields I want, and have a valid
  query appended to the editor — without knowing the schema in advance.

### Success Criteria (specific, testable)

- [ ] Typing in the REST URL input shows a filtered suggestion list of real
      endpoint patterns; selecting one fills the input (and sets method for
      mutating routes where unambiguous). `/api` prefix is fixed/visible and not
      part of the typed/editable suggestion noise.
- [ ] Suggestions are derived from a single catalogue covering all 14 entities ×
      {list, by-id, search} + `stats`. No suggestion points to a non-existent route.
- [ ] REST request body has a **Format** action that pretty-prints valid JSON
      (2-space indent) and is a no-op (no throw) on invalid/empty JSON.
- [ ] The REST/GraphQL response card's primary heading reads **"Response"**
      (the JSON section may remain labelled "Body" beneath it).
- [ ] WS and Socket.IO tabs each render message presets that pre-fill the
      composer, plus a one-line endpoint description.
- [ ] Clicking **Connect** on WS or Socket.IO clears all prior log entries before
      the new session streams.
- [ ] GraphQL tab has a toggleable schema panel listing Query + Mutation root
      fields grouped; expanding a field reveals tickable sub-fields; confirming a
      selection appends a syntactically valid operation to the query editor.
- [ ] The GraphQL schema panel is driven by a static catalogue (no network fetch).
- [ ] `bun run verify` (lint + format + typecheck) passes; `bun run test` green.

## Tech Stack

- Next.js 15 (App Router, `--turbopack`), React 19, TypeScript.
- Tailwind via CSS variables (`var(--color-*)`); Radix primitives already in use
  (`@radix-ui/react-dropdown-menu`, `react-tabs`, etc.).
- Vitest + Testing Library for unit/component tests; Playwright for e2e.
- Linter: `oxlint --type-aware`; formatter: `oxfmt`.

## Commands

```
Install:   bun install
Dev:       bun run dev                 # turbo → next dev --turbopack (already running; do NOT start)
Build:     bun run build
Test:      bun run test                # turbo → vitest run
Test (web):cd apps/web && bun run test
Lint:      bun run lint                # oxlint --type-aware
Format:    bun run format              # oxfmt
Typecheck: bun run typecheck           # tsc --noEmit
Verify:    bun run verify             # lint + format + typecheck
```

## Project Structure

```
apps/web/src/components/playground/
  Playground.tsx, PlaygroundTabs.tsx        → shell + tab routing
  shared/   presets.ts, PresetPicker.tsx, JsonView.tsx, StatusPill.tsx
  rest/     RestPanel, MethodUrlBar, BodyEditor, HeadersEditor, ResponseViewer
  ws/       WsPanel, ConnectionBar, MessageComposer, EventLog, playground-ws-url.ts
  socketio/ SocketIoPanel, NamespaceBar, EmitComposer
  graphql/  GraphqlPanel, GraphqlRequestBar, QueryEditor, VariablesEditor
apps/web/src/hooks/   use-rest-request, use-ws-console, use-socketio-console, use-graphql-request
apps/web/src/lib/     playground-env.ts
apps/web/src/tests/   playground-*.test.tsx          → all new tests live here
packages/types/entities/index.ts                     → canonical entity field shapes
apps/api/src/routes/rest/*.ts                         → source of truth for REST routes
apps/api/src/routes/graphql/                          → source of truth for GraphQL schema
```

### New files (proposed)

```
apps/web/src/components/playground/shared/
  playground-catalogue.ts        → SINGLE source of truth: entities, REST endpoint
                                    patterns, GraphQL root fields + selectable fields.
  EndpointAutocomplete.tsx       → REST URL suggestion dropdown.
apps/web/src/components/playground/graphql/
  SchemaPanel.tsx                → toggleable field-checklist panel.
apps/web/src/components/playground/shared/
  EndpointInfo.tsx (optional)    → one-line endpoint description banner for WS/SIO.
```

> **DRY note:** `EntityBrowser.tsx` (landing) and `presets.ts` both hard-code
> entity/field lists. The new `playground-catalogue.ts` becomes the single source;
> presets may reference it, and EntityBrowser *may* be refactored to consume it
> (out of scope unless trivial — see Boundaries).

## Code Style

Follow existing playground conventions exactly. Representative snippet:

```tsx
"use client";

import type { HttpMethod } from "@/components/playground/shared/presets";

export interface EndpointSuggestion {
  readonly method: HttpMethod;
  readonly path: string;        // e.g. "/api/users/:id"
  readonly label: string;       // e.g. "Get user by id"
}

export function EndpointAutocomplete({
  query,
  onSelect,
}: {
  readonly query: string;
  readonly onSelect: (s: EndpointSuggestion) => void;
}) {
  const matches = filterEndpoints(query); // pure, from playground-catalogue
  if (matches.length === 0) return null;
  return (
    <ul role="listbox" className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-raised)]">
      {matches.map((m) => (
        <li key={`${m.method}-${m.path}`} role="option" aria-selected={false}>
          {/* … */}
        </li>
      ))}
    </ul>
  );
}
```

Conventions: `"use client"` on interactive components; `readonly` props; CSS-var
colors only (no raw hex); pure helpers extracted and unit-tested; `aria-*` on all
interactive widgets (listbox/option, keyboard nav); components under ~95 lines,
functions under ~30; named constants, no magic strings.

## Testing Strategy

- **Framework:** Vitest + `@testing-library/react`, colocated in
  `apps/web/src/tests/playground-*.test.tsx` (matches existing pattern).
- **Catalogue:** pure-function unit tests — every generated REST suggestion maps
  to a real router/verb; every GraphQL root field maps to a real query/mutation.
  This is the guardrail against suggesting non-existent routes.
- **Autocomplete:** typing filters, keyboard up/down/enter selects, Escape closes,
  selecting fills URL + method.
- **Body Format:** valid JSON → pretty-printed; invalid/empty → unchanged, no throw.
- **Response heading:** asserts visible "Response" heading.
- **WS / Socket.IO:** message preset click pre-fills composer; **Connect clears
  prior log** (regression test — connect, accrue events, reconnect, assert empty).
- **GraphQL SchemaPanel:** expand root → tick fields → confirm appends valid op;
  toggle open/close.
- Coverage expectation: new catalogue + helpers ≥ 90% lines; each new component
  has at least happy-path + one edge case.

## Boundaries

- **Always:** run `bun run verify` + `bun run test` before declaring a task done;
  derive every suggestion/field from `playground-catalogue.ts`; keep colors as CSS
  vars; add `aria-*` + keyboard support to new interactive UI; one responsibility
  per component.
- **Ask first:** changing the WS panel to support multiple endpoints (currently a
  single fixed `PLAYGROUND_WS_URL`) — message presets are in scope, connection
  switching may expand scope; refactoring `EntityBrowser.tsx` to consume the new
  catalogue; adding any new dependency; changing API routes or GraphQL schema.
- **Never:** invent REST routes or GraphQL fields not present in `apps/api`;
  fetch the GraphQL schema over the network (it is fixed/static by design);
  commit without explicit user request; remove or weaken existing tests; introduce
  raw hex colors or inline styles beyond the existing `style={{ background: var }}`.

## Open Questions

1. **WS connection presets:** WS_PRESETS define 4 endpoints but the panel uses one
   fixed URL. Do we (a) add only *message* presets for the fixed endpoint, or (b)
   also let users switch among the 4 WS endpoints? Default assumption: **(a)** for
   this pass; treat (b) as a follow-up.
2. **Autocomplete `/api` prefix:** confirm the desired UX — fixed non-editable
   `/api/` adornment with the user typing only the suffix, vs. a normal input
   pre-seeded with `/api/`. Default assumption: **visible fixed `/api/` prefix
   adornment**, suggestions show the suffix.
3. **Schema panel placement:** collapsible right-side drawer toggled from the
   request bar (Hoppscotch-style), vs. an always-visible third column. Default
   assumption: **toggleable drawer** to preserve the 2-column request/response
   layout on smaller screens.

## Out of Scope

- Auth flows, custom-schema import into the playground, request history/saving.
- GraphQL schema *introspection over the network* (schema is static).
- Live API behavioral changes (routes, resolvers, generators).
