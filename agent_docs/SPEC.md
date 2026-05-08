# Spec: MockForge — The Ultimate Fake Data API Platform

## Objective

Build a production-grade fake data API platform that surpasses DummyJSON by offering REST, GraphQL, WebSockets, and Socket.io from a single unified service, with a zero-friction custom schema builder and a world-class developer experience. Completely free, no signup required.

### Who is this for?
All developer types equally:
- **Frontend devs** prototyping UI without a backend
- **Backend devs** testing integrations and load scenarios
- **Full-stack teams** bootstrapping MVPs fast

### User Stories

- As a frontend dev, I can hit `GET /api/products?limit=20` and get realistic fake product data in seconds — no signup, no API key.
- As a developer, I can connect a WebSocket to `/ws/chat` and receive a stream of fake chat messages in real time.
- As a developer, I visit the schema builder, define a `Flight` entity, and immediately get a working endpoint at `/api/custom/{slug}/flights` — no account created.
- As a returning developer, my custom schemas are still there when I come back — persisted silently using my browser ID.

---

## Assumptions

1. "MockForge" is a working title — keep for now.
2. **Repository structure: Monorepo.** Two apps + shared types: `apps/web` (Next.js 16.1 — landing page, docs via Fumadocs, schema builder), `apps/api` (Hono + Bun — API server), `packages/types` (shared TS types). Turborepo orchestrates tasks; Bun handles workspaces. Deployments are separate — Vercel for web, Railway for API.
3. **No auth, no signup, no accounts.** Identity is a UUID (`mf_id`) generated on first visit and stored in `localStorage`. Sent as `X-MF-ID` header on all API calls. Persisted to Redis only when a schema is first saved (lazy). No Clerk, no JWT, no sessions, no passwords.
4. **No API keys.** Rate limiting is keyed on `mf_id` (with IP as fallback if header absent). No `X-API-Key` header, no key management UI.
5. **Redis-only database.** No Postgres, no MongoDB. All persistent state (custom schemas, rate limit counters, request counter, mf_id records) lives in Upstash Redis. Schema save = one `SET`. Schema fetch = one `GET`. Zero additional infrastructure.
6. The API is a **separate Hono + Bun server** (`apps/api`), not Next.js API routes. Required for native WebSocket/Socket.io support — serverless functions cannot hold persistent connections.
7. Ephemeral schemas: stored in Redis with 1-hour TTL. Persistent schemas: same Redis structure, no TTL.
8. The service is fully free — no paid tiers, no billing infrastructure.
9. Socket.io and raw WebSocket endpoints are distinct — Socket.io at `/socket.io`, raw WS at `/ws`.
10. No mobile app — web only.

---

## Tech Stack

### Frontend
| Layer | Choice | Reason |
|---|---|---|
| Framework | Next.js 16.1 (App Router) | SSR for landing page SEO, Fumadocs integrates natively, Vercel zero-config deploy |
| React | React 19.2 | Ships bundled with Next.js 16.1 |
| Styling | Tailwind CSS v4 + custom design tokens | Full control — no component library opinions; design is a differentiator |
| Components | Radix UI (headless primitives) | Accessible dropdowns, modals, tooltips with zero styling lock-in |
| Animations | GSAP + Framer Motion | GSAP for landing scroll sequences, Framer for component transitions |
| Theme | CSS variables via Tailwind v4 | Dark/light mode via custom token system |
| Docs | Fumadocs (`app/docs/`) | Next.js-native MDX docs — auto-sidebar, search, built into the same app |
| Identity | `localStorage` UUID (`mf_id`) | Generated on first visit, no signup required |
| State | Zustand + TanStack Query | Lightweight global state + server state caching |
| Forms | React Hook Form + Zod | Schema builder forms |
| Testing | Vitest + React Testing Library | Component + unit tests in jsdom environment |
| E2E | Playwright | Full browser testing across Chromium, Firefox, WebKit |

> **Why Next.js over Vite?** Fumadocs is the deciding factor — it's built specifically for Next.js App Router and gives production-quality docs (search, auto-sidebar, MDX, versioning) with minimal config. A separate Astro/Vite docs site would mean a third app in the monorepo, a second Vercel deployment to manage, and duplicated design tokens. Fumadocs inside `apps/web` keeps everything in one place. Next.js Turbopack (default in v16) also closes most of the HMR speed gap with Vite.

### Backend
| Layer | Choice | Reason |
|---|---|---|
| Runtime | Bun | Native WebSocket support, faster startup |
| Framework | Hono | Runs natively on Bun, edge-ready, first-class TypeScript |
| GraphQL | Pothos + graphql-yoga | Code-first, TypeScript-native, no codegen hell |
| WebSockets | Bun native (`Bun.serve`) | Built into Bun's server — no `ws` package needed |
| Socket.io | socket.io v4 | Namespaced rooms, fallback transport; works on Bun |
| Identity | `X-MF-ID` header middleware | Reads `mf_id` from header, falls back to IP hash |
| Rate Limiting | Upstash Redis + @hono/rate-limiter | Keyed on `mf_id`; sub-ms via Redis |
| Monitoring | Cronitor | Uptime checks, latency alerts |

### Database
| Concern | Storage | Key pattern |
|---|---|---|
| Custom schemas (persistent) | Redis (Upstash) | `schema:{slug}` → JSON blob |
| Custom schemas (ephemeral) | Redis (Upstash) | `schema:{slug}` → JSON blob, 1hr TTL |
| Schemas by mf_id | Redis (Upstash) | `mf:{mf_id}:schemas` → Set of slugs |
| Rate limit counters | Redis (Upstash) | `rate:{mf_id}` → counter, rolling TTL |
| Total request counter | Redis (Upstash) | `stats:total_requests` → integer |
| Fake data generation | In-memory | Generated at request time via Faker.js — no DB read |

> **Why Redis-only?** The only persistent data is JSON blobs (schemas) and counters. No joins, no transactions, no relational queries. Redis handles all access patterns with O(1) reads. Upstash free tier (10k commands/day, 256MB) is sufficient for v1. Postgres would be pure overhead.

---

## Data Entities (Built-in)

### Tier 1 — Launch
- `users` — name, email, avatar, address, company, phone, role
- `products` — title, price, category, description, images, rating, stock
- `posts` — title, body, tags, reactions, author
- `comments` — body, postId, author, likes, createdAt
- `todos` — text, completed, userId, priority, dueDate
- `carts` — userId, items[], total, discountedTotal

### Tier 2 — Launch (differentiators over DummyJSON)
- `messages` — senderId, receiverId, body, roomId, timestamp (drives WS chat)
- `notifications` — userId, type, title, body, read, createdAt (drives WS notifications)
- `quotes` — text, author, category
- `recipes` — name, ingredients[], steps[], cuisine, prepTime
- `countries` — name, capital, population, currency, flag, continent
- `companies` — name, industry, employees, revenue, founded, ceo
- `stocks` — symbol, name, price, change, changePercent, volume (drives WS ticker)
- `events` — title, location, date, attendees, category (drives WS presence demo)

### Custom Schemas
User-defined entities with typed fields: `string`, `number`, `boolean`, `date`, `enum`, `uuid`, `email`, `url`, `image`, `array(type)`, `ref(entity)`.

---

## API Surface

### REST
```
GET  /api/{entity}                     → paginated list (limit, skip, search, sort, order)
GET  /api/{entity}/{id}               → single item
POST /api/{entity}                     → fake create (returns item, does not persist)
PUT  /api/{entity}/{id}               → fake update
DELETE /api/{entity}/{id}             → fake delete
GET  /api/{entity}/search?q=          → search across text fields
GET  /api/custom/{schemaId}           → custom schema list
GET  /api/custom/{schemaId}/{id}      → custom schema item
```

Response envelope:
```json
{
  "data": [...],
  "total": 150,
  "limit": 10,
  "skip": 0,
  "meta": {
    "entity": "products",
    "generatedAt": "2025-01-01T00:00:00Z"
  }
}
```

### GraphQL
- Endpoint: `POST /graphql`
- Playground at `/graphql` (enabled via query param `?playground=1`)
- All entities queryable with filter, sort, pagination args
- Custom schemas auto-generate types at runtime

### WebSocket (raw)
```
ws://api.mockforge.dev/ws/notifications   → pushes fake notification every N seconds
ws://api.mockforge.dev/ws/chat/{roomId}   → fake chat stream, bidirectional
ws://api.mockforge.dev/ws/ticker          → fake stock ticker, price updates
ws://api.mockforge.dev/ws/stats           → streams total request count every 2s (landing page counter)
```

### Socket.io
```
Namespace: /notifications
Namespace: /chat       — rooms by roomId
Namespace: /ticker
```
Each namespace emits typed events matching the WS endpoints above.

---

## Rate Limiting

| Identifier | Limit | Reset window |
|---|---|---|
| `mf_id` (from `X-MF-ID` header) | 300 req/min | Rolling |
| IP hash (fallback, no header) | 60 req/min | Rolling |

Headers returned: `X-RateLimit-Limit`, `X-RateLimit-Remaining`, `X-RateLimit-Reset`.  
On breach: `429 Too Many Requests` with `Retry-After` header.

> `mf_id` is more accurate than IP — avoids penalising shared offices/universities/carriers. IP is the fallback for headless clients that don't send the header. No concept of tiers — same limit for everyone.

---

## Identity (Anonymous UUID Model)

No signup, no login, no accounts. Identity is a UUID generated silently in the browser.

### How it works
1. On first visit, the frontend generates a `crypto.randomUUID()` and stores it in `localStorage` as `mf_id`
2. Every API request sends it as `X-MF-ID: <uuid>` header
3. The Hono `mf-id` middleware reads this header and attaches it to the request context
4. Rate limiting is keyed on `mf_id`
5. When a user saves a first schema, the backend lazily writes `mf:{mf_id}:schemas` to Redis — no registration step

### Redis schema storage
```
mf:{mf_id}:schemas          → Redis Set of slugs owned by this mf_id
schema:{slug}               → JSON string: { schema, mf_id, name, createdAt, persistent: bool }
schema:{slug} + TTL 3600    → ephemeral schemas expire after 1 hour
```

### One honest tradeoff
`localStorage` is per-browser, per-device. Clearing storage = schemas gone, no recovery. Mitigation: after first schema save, show a one-time dismissable prompt: *"Save your ID to restore schemas on another device: `mf_abc123`"*. Optional manual restore field in the schema builder. This is acceptable for a free developer tool.

### What this replaces
- ~~Clerk~~ — removed entirely
- ~~JWT / refresh tokens~~ — not needed
- ~~API keys~~ — not needed
- ~~Sign-in / sign-up pages~~ — not needed
- ~~`/auth/*` routes~~ — not needed
- ~~`/keys/*` routes~~ — not needed

---

## Monitoring (Internal / Ops Only)

No user-facing analytics dashboards. One exception: a **live request counter** on the landing page.

**Implementation:** Every API request (REST, GraphQL, WS connection) fires a Redis `INCR` on a single key `stats:total_requests`. A dedicated WebSocket endpoint (`ws://api.mockforge.dev/ws/stats`) streams the current count to subscribers every 2 seconds. This is the only "analytics" data stored — a single integer in Redis.

**Cronitor** (or equivalent) monitors:
- Uptime checks on `/health` endpoint (every 1 min)
- Latency alerts if p95 REST response > 200ms
- Error rate alerts if 5xx rate > 1% over 5 min window

---

## UI/UX

### Landing Page (`/`)
Sections (top to bottom):
1. **Hero** — Headline, subhead, animated code snippet cycling through REST/GraphQL/WS examples, two CTAs (Explore Docs, Get API Key)
2. **Protocol showcase** — Animated cards showing REST / GraphQL / WS / Socket.io with live demo outputs
3. **Entity browser** — Grid of all data entities with hover previews of sample data
4. **Schema builder teaser** — Short demo of building a custom schema
5. **Live counter** — Total API requests served, updated in real time via WebSocket (count stored in Redis, streamed to clients)
6. **DX highlights** — TypeScript types, copy-paste code samples, zero signup required
7. **Footer**

GSAP animations: scroll-triggered reveals, staggered entity card entrances, animated code terminal, number counters.

### Docs (`/docs`)
- Auto-generated sidebar from MDX files
- Sections: Getting Started, REST API, GraphQL, WebSockets, Socket.io, Custom Schemas, Rate Limits, Auth, Analytics
- Embedded live API playground per endpoint (try it in-browser)
- Code examples in JS/TS, Python, cURL, Go

### Schema Builder (`/builder`)
- Visual mode: drag-and-drop field editor, type picker, field config (required, default, range)
- JSON mode: paste raw JSON Schema or Faker.js-style config
- Live preview: see generated sample records on the right
- Ephemeral mode: no login, get a temporary URL valid for 1 hour
- Persistent mode (logged in): save, name, share, version schemas

---

## Custom Schema Builder — Technical Design

### Schema Definition Format
```json
{
  "name": "Flight",
  "fields": [
    { "name": "id", "type": "uuid" },
    { "name": "origin", "type": "enum", "values": ["JFK","LHR","DXB","SIN"] },
    { "name": "destination", "type": "enum", "values": ["JFK","LHR","DXB","SIN"] },
    { "name": "price", "type": "number", "min": 100, "max": 5000 },
    { "name": "status", "type": "enum", "values": ["scheduled","delayed","cancelled","landed"] },
    { "name": "departureAt", "type": "date", "from": "now", "to": "+7d" }
  ]
}
```

### Persistence
- Ephemeral schemas: stored in Redis with 1-hour TTL, identified by a short nanoid slug
- Persistent schemas: stored in Redis with no TTL, linked to `mf_id`
- Endpoint: `/api/custom/{slug}` → dynamically generates and returns fake records on each request using the stored schema

---

## Project Structure

```
mockforge/
├── apps/
│   ├── web/                        # Next.js 16.1 frontend + docs
│   │   ├── app/
│   │   │   ├── page.tsx            # Landing page
│   │   │   ├── docs/               # Fumadocs MDX docs (auto-sidebar, search)
│   │   │   └── builder/            # Schema builder (view + manage schemas by mf_id)
│   │   ├── components/
│   │   │   ├── landing/            # Hero, protocol showcase, live counter, etc.
│   │   │   ├── builder/            # Schema builder components
│   │   │   └── ui/                 # Shared Radix-based UI primitives
│   │   ├── content/
│   │   │   └── docs/               # MDX source files for Fumadocs
│   │   └── lib/
│   │       ├── api-client.ts       # Typed fetch wrapper (adds X-MF-ID header)
│   │       └── ws-client.ts        # WebSocket/Socket.io hooks
│   │
│   └── api/                        # Hono + Bun backend
│       ├── src/
│       │   ├── index.ts            # Entry point, mounts all routers
│       │   ├── routes/
│       │   │   ├── rest/           # One file per entity + custom
│       │   │   ├── graphql/        # Pothos schema + yoga handler
│       │   │   └── schemas/        # Custom schema CRUD (save, list, delete by mf_id)
│       │   ├── ws/
│       │   │   ├── raw/            # Raw WebSocket handlers
│       │   │   └── socketio/       # Socket.io namespace handlers
│       │   ├── middleware/
│       │   │   ├── rate-limit.ts   # Keyed on mf_id, fallback to IP hash
│       │   │   └── mf-id.ts        # Reads X-MF-ID header, attaches to context
│       │   ├── data/
│       │   │   ├── generators/     # Faker.js-based generators per entity
│       │   │   └── seeds/          # Static seed datasets
│       │   ├── schema-builder/
│       │   │   ├── parser.ts       # JSON schema → field spec
│       │   │   ├── generator.ts    # Field spec → fake record
│       │   │   └── store.ts        # Redis persistence (SET/GET/DEL/EXPIRE)
│       │   └── db/
│       │       └── redis.ts        # Upstash Redis client (only DB)
│       └── tests/
│           ├── unit/
│           └── integration/
│
├── packages/
│   └── types/                      # Shared TypeScript types
│
└── docker-compose.yml              # Local dev: Redis only (Upstash in prod)
```

---

## Commands

```bash
# Root (Turborepo + Bun workspaces)
bun run dev                  # Start both apps in watch mode
bun run build                # Build both apps
bun run test                 # Run all unit tests
bun run test:e2e             # Run Playwright E2E tests
bun run lint                 # Lint all packages

# Frontend (apps/web)
bun --filter web dev         # Next.js dev server on :3000 (Turbopack)
bun --filter web build       # Production build
bun --filter web test        # Vitest unit tests
bun --filter web test:watch  # Vitest watch mode

# Backend (apps/api)
bun --filter api dev         # Hono/Bun dev server on :4000 (--watch)
bun --filter api build       # tsc build (type-check only; Bun runs TS directly)
bun --filter api test        # vitest run (unit only)
bun --filter api test:integration  # vitest run (integration, requires Redis)
bun --filter api test:watch  # vitest --watch

# E2E (root)
bun run test:e2e             # playwright test (all browsers)
bun run test:e2e:ui          # playwright test --ui
bun run test:e2e:debug       # playwright test --debug

# Docker (local infra)
docker compose up -d         # Start Redis (local dev only — Upstash in prod)
docker compose down          # Stop all
```

---

## Code Style

### TypeScript — strict mode everywhere
```typescript
// apps/api/src/routes/rest/products.ts
import { Hono } from 'hono'
import { zValidator } from '@hono/zod-validator'
import { generateProducts } from '../../data/generators/products'
import { paginationSchema } from '../../lib/schemas'

export const productsRouter = new Hono()

productsRouter.get('/', zValidator('query', paginationSchema), async (c) => {
  const { limit, skip, search, sort, order } = c.req.valid('query')
  const products = generateProducts({ limit, skip, search, sort, order })
  return c.json({
    data: products,
    total: 100,
    limit,
    skip,
  })
})
```

```typescript
// apps/api/src/ws/stats.ts — Bun native WebSocket (no ws package)
export const statsHandler = {
  open(ws: ServerWebSocket) {
    ws.subscribe('stats')
  },
  close(ws: ServerWebSocket) {
    ws.unsubscribe('stats')
  },
}

// Broadcast from anywhere:
server.publish('stats', JSON.stringify({ total: await redis.get('stats:total_requests') }))
```

Conventions:
- Filenames: `kebab-case.ts`
- Types/interfaces: `PascalCase`
- Functions/variables: `camelCase`
- Constants: `SCREAMING_SNAKE_CASE`
- Zod schemas validate all inputs at the router layer
- No `any` — use `unknown` + type narrowing
- All async functions have typed return types

---

## Testing Strategy

| Level | Tool | What it tests |
|---|---|---|
| Unit | Vitest + React Testing Library | API generators, schema parser, rate limiter logic, React components (jsdom) |
| Integration | Vitest + Supertest | REST endpoints, schema CRUD, GraphQL queries (requires Redis) |
| WebSocket | Vitest + Bun WS client | WS connection, message format, disconnect handling |
| E2E | Playwright | Landing page, schema builder flow, docs navigation (Chromium, Firefox, WebKit) |

Coverage target: 80% unit + integration for API layer. E2E covers the 3 critical user journeys:
1. Anonymous user → hits REST endpoint → gets data (no header needed)
2. User opens schema builder → defines schema → gets working endpoint (ephemeral, no save)
3. User saves schema → revisits → schemas restored from Redis via mf_id

---

## Success Criteria

### v1 Launch
- [ ] All Tier 1 + Tier 2 entities available via REST with pagination, search, sort
- [ ] GraphQL endpoint with all entities queryable
- [ ] All 3 WebSocket use cases streaming fake data (chat, notifications, ticker)
- [ ] All 3 Socket.io namespaces functional
- [ ] Custom schema builder: ephemeral (no save) + persistent (saved to Redis via mf_id) modes working
- [ ] `mf_id` generated on first visit, sent as `X-MF-ID`, used for rate limiting and schema ownership
- [ ] Rate limiting enforced per mf_id, fallback to IP, correct headers returned
- [ ] Schema builder UI: create, view, delete saved schemas — no login required
- [ ] Landing page with GSAP animations, dark/light mode
- [ ] Docs site with all endpoints documented + playground
- [ ] Landing page live request counter updates in real time via WebSocket

### Performance
- [ ] REST endpoint p95 response time < 50ms (fake data, no DB read)
- [ ] GraphQL p95 < 100ms
- [ ] WebSocket connection established < 200ms
- [ ] Rate limit check: < 5ms (Redis)

### DX
- [ ] Any endpoint reachable in < 30 seconds from landing page
- [ ] Code sample copy-paste works out of the box (correct headers, auth, URL)
- [ ] TypeScript types downloadable / npm-installable for all entities
- [ ] Schema builder: custom endpoint working in < 2 minutes from blank

---

## Boundaries

**Always:**
- Validate all inputs with Zod at the router boundary
- Run `bun run lint` and `bun run test` before committing
- Return consistent error envelope: `{ error: { code, message, details? } }`

**Ask first:**
- Adding a new npm dependency
- Changing the custom schema JSON format (breaks existing saved schemas)
- Modifying rate limit values
- Adding a new top-level route namespace

**Never:**
- Return real user emails/passwords in fake data (even as examples)
- Let WebSocket connections accumulate without a heartbeat/timeout
- Merge without passing CI

---

## Open Questions

1. **Deployment infra** — **Railway (API) + Vercel (web)** is the recommended free tier combo. Railway supports persistent WebSocket connections, has a free tier generous enough for launch, and deploys from a monorepo with a root directory override. Vercel handles Next.js with zero config. **Confirm Railway free tier limits before scaffolding CI.**
2. **Monorepo tooling** — Confirmed: Turborepo + Bun workspaces. `turbo.json` pipeline defines `build`, `dev`, `test`, `lint` tasks per package.
3. **Package name / domain** — "MockForge" — keep for now.
4. **Ephemeral schema TTL** — 1 hour. Keep for now.

---

## v2 / Backlog

Features intentionally deferred from v1. Prioritize after launch based on user feedback.

### DX & SDK
- [ ] **shadcn/ui** — if the schema builder or docs playground grows into a full dashboard, shadcn components can be adopted for those specific pages without touching the landing page
- [ ] **TypeScript SDK / npm package** (`mockforge-types`) — publish all entity types as an installable package. Post-launch.
- [ ] **OpenAPI spec** — auto-generate from Hono routes, expose at `/openapi.json`. Enables Postman import, SDK generation.
- [ ] **Code snippet generator** — in-browser tool: pick entity + language (JS, Python, Go, cURL) → copy-paste ready code.

### Data & Entities
- [ ] **`images` entity** — fake Unsplash-style image metadata (url, alt, photographer, dimensions)
- [ ] **`vehicles` entity** — make, model, year, vin, color, fuel type
- [ ] **`medical` entity** — patient records, diagnoses, medications (useful for healthcare app prototyping)
- [ ] **`finance` entity** — transactions, accounts, balances (useful for fintech prototyping)
- [ ] **Seed param for deterministic data** — `?seed=42` returns the same records every time (reproducible tests)
- [ ] **Locale param** — `?locale=fr` returns names, addresses in French etc. (Faker.js supports this)

### Real-time
- [ ] **Multiplayer / presence** (`/ws/presence/{roomId}`) — fake cursor positions, who's online, collaborative indicators
- [ ] **Custom real-time schemas** — let users stream their own custom entity over WS

### Identity & Auth (if needed post-launch)
- [ ] **Clerk integration** — add proper accounts if team schemas or cross-device sync become a user demand
- [ ] **Postgres** — migrate from Redis if schema data grows beyond 256MB or complex querying is needed (e.g. search across all schemas)
- [ ] **API keys** — programmatic schema management via CI/CD pipelines without a browser
- [ ] **Cross-device schema sync** — let users enter their `mf_id` manually to restore schemas on a new device
- [ ] **Email-based schema backup** — enter email, get a recovery link containing your `mf_id`
- [ ] **Team shared schemas** — share a persistent custom schema endpoint with teammates via invite link
- [ ] **Schema versioning** — pin a schema version so endpoint doesn't break on edits
- [ ] **Schema import from OpenAPI / JSON Schema** — paste an existing spec and auto-convert to MockForge schema

### Platform
- [ ] **GraphQL subscriptions** — real-time GraphQL over WS (maps to existing WS use cases)
- [ ] **gRPC endpoint** — proto-based fake data (niche but differentiating)
- [ ] **CLI tool** — `npx mockforge pull products 20` to generate and save fake data locally
- [ ] **VS Code extension** — generate fake data inline in editor