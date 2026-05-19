# Spec: MockForge Playground

## Objective

Build an in-app `/playground` page on the MockForge web app where any visitor can interactively try MockForge's four protocols — REST, GraphQL, WebSocket, and Socket.IO — against the existing pre-seeded demo API. The page serves two audiences:

- **First-time visitors** evaluating MockForge: a "try it now" surface that demonstrates protocol coverage without any setup.
- **Seasoned users**: a protocol scratchpad for sending arbitrary requests against demo endpoints.

**Success means**: a user lands on `/playground`, picks a tab, sends a request (or opens a socket), and sees a real, live response — with zero configuration.

## Tech Stack

- Next.js 15 (App Router) + React 19
- TypeScript (strict)
- Tailwind v4 with CSS variables (`var(--color-*)`) — already wired in `apps/web/src/app/globals.css`
- Bricolage Grotesque (display) — already wired in `layout.tsx`
- TanStack Query v5 — for REST/GraphQL request lifecycle
- Radix UI primitives — Tabs, Select, Tooltip (already installed)
- framer-motion — already installed (used sparingly)
- Native `WebSocket` API — for WS tab (no extra dep)
- `socket.io-client` — **new dependency** (`bun add socket.io-client` in `apps/web`)
- Zod — input validation for URLs / JSON

## Commands

Run from repo root:

```
Install:    bun install
Dev (all):  bun run dev
Build:      bun run build
Test:       bun run test
Typecheck:  bun run typecheck
Lint:       bun run lint
Format:     bun run format
E2E:        bun run test:e2e
```

Run from `apps/web`:

```
Web dev:    bun run dev   (Next.js on default port)
Web build:  bun run build
Web test:   bun run test
```

The user has stated the server is always running — do not start dev servers manually.

## Project Structure

New files live under `apps/web/src`:

```
apps/web/src/
├── app/
│   └── playground/
│       └── page.tsx                 # Route entry — renders <Playground />
├── components/
│   └── playground/
│       ├── Playground.tsx           # Top-level shell: header + tabs
│       ├── PlaygroundTabs.tsx       # Radix Tabs wrapper, 4 tabs
│       ├── rest/
│       │   ├── RestPanel.tsx        # REST request/response panel
│       │   ├── MethodUrlBar.tsx     # Method dropdown + URL input + Send
│       │   ├── HeadersEditor.tsx    # Key/value rows
│       │   ├── BodyEditor.tsx       # JSON textarea
│       │   └── ResponseViewer.tsx   # status pill + time + body + headers
│       ├── graphql/
│       │   ├── GraphqlPanel.tsx     # Query + variables + response
│       │   ├── QueryEditor.tsx
│       │   └── VariablesEditor.tsx
│       ├── ws/
│       │   ├── WsPanel.tsx          # WebSocket bidirectional console
│       │   ├── ConnectionBar.tsx    # URL + Connect/Disconnect + status
│       │   ├── MessageComposer.tsx  # Textarea + Send
│       │   └── EventLog.tsx         # Scrolling timestamped log
│       ├── socketio/
│       │   ├── SocketIoPanel.tsx    # Socket.IO console
│       │   ├── NamespaceBar.tsx     # URL + namespace + event + connect
│       │   ├── EmitComposer.tsx     # Event name + payload + Emit
│       │   └── (reuses EventLog from ws/)
│       └── shared/
│           ├── PresetPicker.tsx     # Pre-seeded example chips
│           ├── StatusPill.tsx       # Connection / status indicator
│           ├── JsonView.tsx         # Read-only JSON pretty-print
│           └── presets.ts           # Demo endpoint catalogue
├── hooks/
│   ├── use-rest-request.ts          # TanStack Query mutation wrapper
│   ├── use-graphql-request.ts
│   ├── use-ws-console.ts            # Connect + send + buffered events
│   └── use-socketio-console.ts
└── tests/
    └── playground.unit.test.tsx     # Component smoke + interaction tests
```

E2E (optional, in `e2e/`):
```
e2e/playground.spec.ts               # Tab switching + send REST + WS connect
```

## Code Style

Match the patterns already in `apps/web/src/components/builder/*` and `landing/*`:

```tsx
"use client";

import { useState } from "react";

type Method = "GET" | "POST" | "PUT" | "DELETE";
const METHODS: Method[] = ["GET", "POST", "PUT", "DELETE"];

interface MethodUrlBarProps {
  method: Method;
  url: string;
  onMethodChange: (method: Method) => void;
  onUrlChange: (url: string) => void;
  onSend: () => void;
  isLoading: boolean;
}

export function MethodUrlBar({
  method,
  url,
  onMethodChange,
  onUrlChange,
  onSend,
  isLoading,
}: MethodUrlBarProps) {
  return (
    <div className="flex items-stretch gap-2 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-raised)] p-2">
      <select
        value={method}
        onChange={(e) => onMethodChange(e.target.value as Method)}
        className="rounded-lg bg-[var(--color-surface)] px-3 font-mono text-sm text-[var(--color-text-primary)]"
      >
        {METHODS.map((m) => (
          <option key={m} value={m}>{m}</option>
        ))}
      </select>
      <input
        value={url}
        onChange={(e) => onUrlChange(e.target.value)}
        placeholder="/api/users"
        className="flex-1 rounded-lg bg-[var(--color-surface)] px-3 font-mono text-sm text-[var(--color-text-primary)]"
      />
      <button
        type="button"
        onClick={onSend}
        disabled={isLoading}
        className="rounded-lg px-4 font-medium text-[var(--color-bg)]"
        style={{ background: "var(--color-accent)" }}
      >
        {isLoading ? "Sending…" : "Send"}
      </button>
    </div>
  );
}
```

Conventions:
- `"use client"` on any file using state, refs, or browser APIs.
- Components in `PascalCase.tsx`, hooks in `kebab-case.ts` prefixed with `use-`.
- Props interfaces named `<Component>Props`, declared above the component.
- Functions stay under ~30 lines; extract sub-components when JSX exceeds ~20 lines.
- No inline styles except for CSS-variable values that Tailwind v4's arbitrary class can't express cleanly (matches Hero / ThemeToggle pattern).
- Always use design tokens: `var(--color-border)`, `var(--color-surface-raised)`, `var(--color-surface-hover)`, `var(--color-text-primary)`, `var(--color-text-muted)`, `var(--color-accent)`, `var(--color-code-bg)`, `var(--color-code-text)`.
- Borders are `rounded-xl` on panels, `rounded-lg` on inputs/buttons — matches `builder/page.tsx` and `Hero.tsx`.
- Monospace (`font-mono`) for URLs, code, log lines.
- No raw hex colors. No purple/indigo. No gradient text. No oversized padding.

## Pre-seeded Demo Presets

A static catalogue exposed via a `PresetPicker` row at the top of each tab. Selecting a preset populates the inputs but does not auto-send.

### REST presets
- `GET /api/users` — list users
- `GET /api/users/1` — single user
- `POST /api/posts` — create post (sample body)
- `GET /api/products?limit=5` — paginated products
- `DELETE /api/todos/1` — delete

### GraphQL presets
- **Users** — `users(limit: 5)` with `id`, `firstName`, `lastName`, `email`.
- **Product by id** — variables `{ "id": "1" }`; argument type is `String!`.
- **Recent posts** — `posts(limit: 3)` with `id`, `title`, `body`.
- **Create post** — `createPost` mutation (`title`, optional `body`) — demo echo, same non-persistent behavior as REST `POST /api/posts`.
- **Update todo** — `updateTodo` mutation (`id`, optional `completed`, `todo`) — demo merge, same spirit as REST updates.

### WebSocket presets
- `ws://localhost:4000/ws/stats`
- `ws://localhost:4000/ws/chat`
- `ws://localhost:4000/ws/notifications`
- `ws://localhost:4000/ws/ticker`

### Socket.IO presets
- `http://localhost:4001` namespace `/chat`, event `message`
- `http://localhost:4001` namespace `/notifications`, event `notify`
- `http://localhost:4001` namespace `/ticker`, event `tick`

Endpoint base URLs come from `NEXT_PUBLIC_API_URL` and a new `NEXT_PUBLIC_SOCKETIO_URL` (default `http://localhost:4001`).

## Testing Strategy

- **Framework**: Vitest + Testing Library (already configured in `apps/web`).
- **Unit/component tests** live at `apps/web/src/tests/playground.unit.test.tsx`. Cover:
  - Tab switch renders the correct panel.
  - REST preset populates method + URL.
  - Submitting a REST request calls `apiClient` and renders the response status.
  - WS connect/disconnect toggles state (mock `WebSocket`).
  - Socket.IO connect (mock `io()` from `socket.io-client`).
  - Invalid JSON in body editor surfaces an inline error and blocks Send.
- **E2E (Playwright)**: a single spec `e2e/playground.spec.ts` that loads `/playground`, switches each tab, fires one REST request against the dev API, and asserts a non-empty response panel. Skip in CI if API server isn't running.
- **Coverage**: at minimum the four panels and their hooks have tests. No formal coverage threshold added beyond what `turbo run test` already enforces.

## Boundaries

**Always:**
- Use the existing CSS variable tokens. No new color tokens unless we add them globally with the user's approval.
- Use `apiClient` from `apps/web/src/lib/api-client.ts` for REST calls (it already handles `X-MF-ID`).
- Read base URLs from `process.env.NEXT_PUBLIC_*` with sensible defaults to `localhost`.
- Validate JSON bodies and variables with `JSON.parse` inside a try/catch — surface errors inline.
- Clean up WS / Socket.IO connections on tab change and unmount.
- Match the typography/spacing scale already in `builder/page.tsx` and `Hero.tsx`.

**Ask first:**
- Adding any dependency other than `socket.io-client`.
- Introducing a new design token, new font, or new global CSS rule.
- Adding persistence (localStorage, cookies, server state).
- Adding analytics or telemetry on playground actions.
- Touching `apps/api` (the playground must work against today's API surface).

**Never:**
- Persist requests, history, or saved collections.
- Add authentication flows or env-var management UI.
- Hit the user's own configured mocks — playground is for the pre-seeded demo API only.
- Use purple/indigo accents, gradient text, oversized hero blocks, generic card grids.
- Introduce loading spinners where a skeleton or button state would do.
- Commit secrets or hard-coded production URLs.

## Success Criteria

The playground is done when **all** of the following are true:

1. Navigating to `/playground` renders a single page with four tabs labeled REST, GraphQL, WebSocket, Socket.IO.
2. Switching tabs preserves no state — refresh restores defaults; switching away tears down any open socket.
3. **REST tab**: user can pick a method, type/select a URL, edit headers and JSON body, hit Send, and see a response panel with status code, response time (ms), pretty-printed JSON body, and headers. Errors render as a non-success status pill with the error body.
4. **GraphQL tab**: user can edit a query and variables, hit Send, and see the response. Validates variables JSON before sending.
5. **WebSocket tab**: user can enter/select a `ws://` URL, connect, see a status pill flip to "Connected", send text messages from a composer, and watch outgoing/incoming messages stream into a timestamped log. Disconnect button closes the socket cleanly.
6. **Socket.IO tab**: user can enter a base URL + namespace, connect, subscribe to one event name, emit events with a JSON payload, and see incoming events in a timestamped log.
7. Visual style matches the existing app: dark default, amber accent, Bricolage Grotesque, `rounded-xl` panels, CSS-variable tokens — no AI-aesthetic tells.
8. Keyboard accessible: every interactive control is reachable via Tab, focusable inputs have visible focus rings, the active tab is announced to screen readers via Radix Tabs.
9. Responsive at 320 / 768 / 1024 / 1440 px. On narrow screens the request/response panels stack vertically.
10. `bun run typecheck`, `bun run lint`, and `bun run test` all pass.
11. The playground link is reachable from at least one existing entry point (Hero CTA or footer) so first-time visitors can find it.

## Open Questions

- Should the playground link be added to the Hero "primary CTA" or only the Footer? Default: Footer + a secondary CTA in Hero.
- Do we want a global "Reset" button per tab, or rely on page refresh? Default: no Reset button (stateless intent already covers this).
- Should we surface MockForge's `X-MF-ID` header in the playground REST panel? Default: no — keep it invisible; `apiClient` handles it.
- For Socket.IO, do we allow multiple simultaneous event subscriptions or just one? Default: one subscription per session to keep the UI honest.
