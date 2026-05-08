# MockForge — Implementation Task Breakdown

## Overview

MockForge is a unified fake data API platform supporting REST, GraphQL, WebSockets, and Socket.io, with a custom schema builder powered by a browser-generated identity (`mf_id`). Built as a Turborepo monorepo with two apps: `apps/web` (Next.js 16.1 — landing page, Fumadocs docs, schema builder) and `apps/api` (Hono + Bun). Redis is the sole database.

This plan contains **34 tasks** across **7 phases**. Every task is S or M sized. No task touches more than 5 files.

---

## Architecture Decisions

- **Monorepo** — Turborepo + Bun workspaces. Two apps: `apps/web` (Next.js) + `apps/api` (Hono + Bun). One `bun run dev` starts both.
- **Next.js 16.1 + Fumadocs** — App Router for the frontend; Fumadocs at `app/docs/` for built-in docs with search and sidebar. One Vercel deployment covers everything.
- **No auth** — Identity is a UUID in `localStorage`, sent as `X-MF-ID` header.
- **Redis-only** — Upstash Redis handles schemas, rate limits, and the request counter. No Postgres.
- **Separate API server** — Hono on Bun at `:4000`. Required for native WebSocket support.
- **Fake data is in-memory** — Faker.js generates data at request time. No DB reads for standard entities.
- **Vitest for unit/integration** — Bun runs Vitest. Playwright for E2E.

---

## Dependency Graph

```
Phase 1: Monorepo scaffold (Next.js + Hono) + all dependencies + testing infra
    │
Phase 2: API foundation (Hono + Redis + mf-id middleware + rate limiting)
    │
Phase 3: REST API — all 14 entities + response envelope
    │
    ├── Phase 4a: GraphQL layer          (parallel after Phase 3)
    └── Phase 4b: WebSocket + Socket.io  (parallel after Phase 3)
    │
Phase 5: Custom schema builder — parser, generator, Redis store, REST routes
    │
Phase 6: Frontend — landing page, schema builder UI, live counter
    │
Phase 7: Fumadocs docs + polish + monitoring
```

---

## Phase 1 — Monorepo Scaffold & Dependency Installation

---

### Task 1: Initialize monorepo and install ALL dependencies

**Description:** Create the full Turborepo monorepo from scratch with two apps and the shared types package. Install every dependency for frontend and backend in a single task so subsequent tasks start from a fully wired, runnable project. This is the only task that touches `package.json` files globally — all other tasks only add to already-installed packages.

**Acceptance criteria:**
- [ ] Root `package.json` configures Bun workspaces: `apps/*`, `packages/*`
- [ ] `turbo.json` defines `dev`, `build`, `test`, `test:integration`, `test:e2e`, `lint` pipeline tasks
- [ ] `apps/web` — Next.js 16.1 scaffolded with all deps installed:
  - `next`, `react`, `react-dom` (React 19.2 ships with Next.js 16.1)
  - `tailwindcss` v4, `@tailwindcss/postcss`
  - `@radix-ui/react-dialog`, `@radix-ui/react-dropdown-menu`, `@radix-ui/react-tooltip`, `@radix-ui/react-switch`, `@radix-ui/react-select`
  - `gsap`, `framer-motion`
  - `zustand`, `@tanstack/react-query`
  - `react-hook-form`, `zod`, `@hookform/resolvers`
  - `fumadocs-core`, `fumadocs-ui`, `fumadocs-mdx`
  - `nanoid`
  - `typescript`, `@types/react`, `@types/react-dom`, `@types/node`
  - `vitest`, `@vitest/coverage-v8`, `@testing-library/react`, `@testing-library/user-event`, `@testing-library/jest-dom`, `jsdom`
- [ ] `apps/api` — Hono + Bun scaffolded with all deps installed:
  - `hono`, `@hono/zod-validator`
  - `@faker-js/faker`
  - `@upstash/redis`
  - `graphql`, `graphql-yoga`, `@pothos/core`
  - `socket.io`
  - `zod`, `nanoid`
  - `vitest`, `@vitest/coverage-v8`, `supertest`, `@types/supertest`
  - `typescript`
- [ ] Playwright installed at root level: `@playwright/test`, browsers installed via `playwright install --with-deps`
- [ ] `packages/types` — bare TypeScript package scaffolded
- [ ] `bun run dev` from root starts both dev servers without errors
- [ ] `bun run build` from root builds both apps without errors
- [ ] TypeScript strict mode enabled in all workspaces via shared `tsconfig.base.json`
- [ ] `.gitignore`, `.env.example` created at root

**Verification:**
- [ ] `bun run dev` → `apps/web` runs on `:3000` (Next.js + Turbopack), `apps/api` on `:4000`
- [ ] `bun run build` exits 0 with no TypeScript errors across all packages
- [ ] `curl http://localhost:4000/health` returns `{ "status": "ok" }` (stub endpoint)
- [ ] `http://localhost:3000` renders the Next.js default page without errors

**Dependencies:** None

**Files touched:**
- `package.json` (root)
- `turbo.json`
- `bun.lockb`
- `tsconfig.base.json`
- `apps/web/package.json`, `apps/web/next.config.ts`, `apps/web/tsconfig.json`, `apps/web/src/app/page.tsx`, `apps/web/src/app/layout.tsx`
- `apps/api/package.json`, `apps/api/tsconfig.json`, `apps/api/src/index.ts`
- `packages/types/package.json`, `packages/types/tsconfig.json`, `packages/types/index.ts`
- `.gitignore`, `.env.example`, `docker-compose.yml`
- `playwright.config.ts` (root — scaffolded here, fully configured in Task 3)

**Estimated scope:** L (foundational — intentionally the largest task in the plan)

---

### Task 2: Define shared TypeScript entity types

**Description:** Write canonical TypeScript interfaces for all 14 entities in `packages/types`. These are the single source of truth consumed by Faker.js generators, the GraphQL schema, and eventually the frontend API client. All other tasks import from here — do not define entity shapes anywhere else.

**Acceptance criteria:**
- [ ] All 14 entity interfaces exported: `User`, `Product`, `Post`, `Comment`, `Todo`, `Cart`, `Message`, `Notification`, `Quote`, `Recipe`, `Country`, `Company`, `Stock`, `Event`
- [ ] Shared pagination envelope: `ApiResponse<T>` with `data`, `total`, `limit`, `skip`, `meta`
- [ ] Shared error envelope: `ApiError` with `code`, `message`, `details?`
- [ ] Custom schema types: `SchemaField`, `SchemaDefinition`, `SavedSchema`
- [ ] `packages/types` importable in both `apps/web` and `apps/api` as `@mockforge/types`
- [ ] Zero TypeScript errors

**Verification:**
- [ ] `bun run build` in `packages/types` exits 0
- [ ] `import type { Product } from '@mockforge/types'` resolves in both apps without error

**Dependencies:** Task 1

**Files touched:**
- `packages/types/entities/index.ts` (all 14 entity interfaces)
- `packages/types/api.ts` (`ApiResponse`, `ApiError`)
- `packages/types/schema.ts` (`SchemaField`, `SchemaDefinition`, `SavedSchema`)
- `packages/types/index.ts` (re-exports everything)

**Estimated scope:** M

---

### Task 3: Configure Vitest (unit + integration) and Playwright (E2E)

**Description:** Fully configure the testing infrastructure across the monorepo before any real code is written. This means Vitest set up correctly for both `apps/api` (Node/Bun environment) and `apps/web` (jsdom environment), with separate configs for unit vs integration tests, coverage reporting, and Playwright configured for E2E against the running dev servers. Every subsequent task writes tests that immediately run against this setup — no test config debt later.

**Acceptance criteria:**

**Vitest — `apps/api` (unit + integration):**
- [ ] `apps/api/vitest.config.ts` created with:
  - `environment: 'node'`
  - Two projects: `unit` (matches `**/*.unit.test.ts`) and `integration` (matches `**/*.integration.test.ts`)
  - Coverage via `@vitest/coverage-v8`, output to `coverage/` — threshold 80% lines
  - Globals enabled (`describe`, `it`, `expect` without imports)
  - `setupFiles: ['./src/tests/setup.ts']` (loads env vars from `.env.test`)
- [ ] `apps/api/src/tests/setup.ts` created — sets `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN` from `.env.test`
- [ ] `apps/api/.env.test` created (gitignored) — points to a local Redis instance for integration tests
- [ ] `apps/api/package.json` scripts:
  - `"test": "vitest run --project unit"`
  - `"test:integration": "vitest run --project integration"`
  - `"test:coverage": "vitest run --coverage"`
  - `"test:watch": "vitest --watch"`

**Vitest — `apps/web` (unit + component):**
- [ ] `apps/web/vitest.config.ts` created with:
  - `environment: 'jsdom'`
  - `plugins: [react()]` from `@vitejs/plugin-react` (Vitest uses Vite under the hood even in Next.js projects)
  - `setupFiles: ['./src/tests/setup.ts']`
  - Coverage via `@vitest/coverage-v8`
  - Globals enabled
  - `resolve.alias` maps `@/` to `./src/` to mirror Next.js path aliases
- [ ] `apps/web/src/tests/setup.ts` imports `@testing-library/jest-dom` for DOM matchers
- [ ] `apps/web/package.json` scripts:
  - `"test": "vitest run"`
  - `"test:watch": "vitest --watch"`
  - `"test:coverage": "vitest run --coverage"`

**Playwright — E2E (root level):**
- [ ] `playwright.config.ts` at monorepo root with:
  - `testDir: './e2e'`
  - `baseURL: 'http://localhost:3000'`
  - Projects: `chromium`, `firefox`, `webkit`
  - `webServer` entries: starts `apps/web` on `:3000` and `apps/api` on `:4000` before tests run
  - Screenshots on failure, video on retry
  - Timeout: 30s per test
- [ ] `e2e/` directory created at root with a `smoke.spec.ts` stub (just checks `http://localhost:3000` loads)
- [ ] Root `package.json` scripts:
  - `"test:e2e": "playwright test"`
  - `"test:e2e:ui": "playwright test --ui"`
  - `"test:e2e:debug": "playwright test --debug"`
- [ ] `playwright install --with-deps chromium firefox webkit` documented in `README.md`

**Turbo pipeline wired:**
- [ ] `turbo.json` `test` task: runs unit tests, depends on `build` of `packages/*`
- [ ] `turbo.json` `test:integration` task: not cached (always re-runs), depends on `build`
- [ ] `turbo.json` `test:e2e` task: not cached, runs only at root level

**Smoke tests written to verify setup works:**
- [ ] `apps/api/src/tests/smoke.unit.test.ts` — one trivial `expect(1 + 1).toBe(2)` test that passes
- [ ] `apps/web/src/tests/smoke.unit.test.ts` — renders a simple React component with Testing Library, asserts text is visible (does not import Next.js internals)
- [ ] `e2e/smoke.spec.ts` — visits `http://localhost:3000`, asserts page title is not empty

**Verification:**
- [ ] `bun run test` (from root) → all unit tests pass across `apps/api` and `apps/web`
- [ ] `bun --filter api test:integration` → integration smoke test passes (requires Redis running)
- [ ] `bun run test:e2e` → Playwright smoke test passes in Chromium (requires both dev servers running)
- [ ] `bun --filter api test:coverage` → coverage report generated in `apps/api/coverage/`
- [ ] `bun --filter web test:coverage` → coverage report generated in `apps/web/coverage/`

**Dependencies:** Task 1

**Files touched:**
- `apps/api/vitest.config.ts`
- `apps/api/src/tests/setup.ts`
- `apps/api/src/tests/smoke.unit.test.ts`
- `apps/api/.env.test` (gitignored)
- `apps/web/vitest.config.ts`
- `apps/web/src/tests/setup.ts`
- `apps/web/src/tests/smoke.unit.test.ts`
- `playwright.config.ts` (root — fully configured here)
- `e2e/smoke.spec.ts`
- `package.json` (root — add `test:e2e` scripts)
- `turbo.json` (add test pipeline entries)
- `README.md` (document `playwright install` step)
- `.gitignore` (add `apps/api/.env.test`, `coverage/`, `playwright-report/`, `test-results/`)

**Estimated scope:** M

---

### ✅ Checkpoint 1 — Scaffold + Testing Infrastructure Complete

- [ ] `bun run dev` starts both apps cleanly — Next.js on `:3000`, Hono on `:4000`
- [ ] `bun run build` exits 0 across all packages with no TypeScript errors
- [ ] All 14 entity types compile and are importable as `@mockforge/types`
- [ ] `/health` stub endpoint responds on `:4000`
- [ ] `bun run test` → unit smoke tests pass in both `apps/api` and `apps/web`
- [ ] `bun --filter api test:integration` → integration smoke test passes
- [ ] `bun run test:e2e` → Playwright smoke test passes in Chromium
- [ ] Coverage reports generate without errors in both apps

---

## Phase 2 — API Foundation

---

### Task 4: Hono app entry point + Redis client + health endpoint

**Description:** Wire up the Hono entry point with global middleware (CORS, logger, error handler). Create the Upstash Redis client as a singleton. Expose a `/health` endpoint that checks Redis connectivity. This is the foundation every subsequent API task builds on.

**Acceptance criteria:**
- [ ] Hono app initialised in `apps/api/src/index.ts` via `Bun.serve()`
- [ ] CORS middleware allows all origins in dev, configurable in prod
- [ ] Request logger middleware logs method, path, status, duration
- [ ] Global error handler returns `{ error: { code, message } }` envelope on uncaught errors
- [ ] Upstash Redis client created at `apps/api/src/db/redis.ts` using env vars `UPSTASH_REDIS_REST_URL` + `UPSTASH_REDIS_REST_TOKEN`
- [ ] `GET /health` returns `{ status: "ok", redis: "connected" }` (pings Redis)
- [ ] `.env.example` documents all required env vars

**Verification:**
- [ ] `curl http://localhost:4000/health` → `{ "status": "ok", "redis": "connected" }`
- [ ] Invalid route returns `{ "error": { "code": "NOT_FOUND", "message": "..." } }`
- [ ] Vitest unit test: Redis client initialises without throwing

**Dependencies:** Task 1

**Files touched:**
- `apps/api/src/index.ts`
- `apps/api/src/db/redis.ts`
- `apps/api/src/middleware/logger.ts`
- `apps/api/src/middleware/error-handler.ts`
- `.env.example`

**Estimated scope:** M

---

### Task 5: `mf-id` identity middleware

**Description:** Implement the middleware that reads `X-MF-ID` from request headers and falls back to a hashed IP. Attach the resolved identifier to Hono's context so all downstream handlers can use `c.get('mfId')` without re-reading headers. This is the identity layer — no auth, just consistent identification.

**Acceptance criteria:**
- [ ] `mf-id.ts` middleware reads `X-MF-ID` header
- [ ] If header is absent, falls back to `sha256(ip).slice(0, 16)`
- [ ] Sets `c.set('mfId', resolvedId)` for all downstream handlers
- [ ] Middleware is registered globally — applies to every route
- [ ] TypeScript type augmentation so `c.get('mfId')` returns `string` (not `unknown`)

**Verification:**
- [ ] Vitest unit test: header present → uses header value
- [ ] Vitest unit test: header absent → uses hashed IP
- [ ] `curl -H "X-MF-ID: test-123" http://localhost:4000/health` → logs `mfId: test-123`

**Dependencies:** Task 4

**Files touched:**
- `apps/api/src/middleware/mf-id.ts`
- `apps/api/src/index.ts` (register middleware)
- `apps/api/src/types/hono.d.ts` (context type augmentation)

**Estimated scope:** S

---

### Task 6: Rate limiting middleware

**Description:** Implement rolling window rate limiting keyed on `mfId` (from context, set by Task 4). Use Upstash Redis with a sliding window counter. Return standard rate limit headers on every response. Return `429` with `Retry-After` when limit is exceeded.

**Acceptance criteria:**
- [ ] Rate limit: 300 req/min per `mfId`, 60 req/min for IP fallback
- [ ] Uses Redis `INCR` + `EXPIRE` for sliding window counting
- [ ] Every response includes: `X-RateLimit-Limit`, `X-RateLimit-Remaining`, `X-RateLimit-Reset`
- [ ] `429 Too Many Requests` with `Retry-After` header when limit exceeded
- [ ] Rate limit check completes in < 5ms (single Redis round-trip)
- [ ] Middleware registered globally after `mf-id` middleware

**Verification:**
- [ ] Vitest unit test: 301st request in a window returns 429
- [ ] Vitest unit test: window resets after TTL expires
- [ ] `curl` loop: 61 requests from IP-only → 61st gets 429 with `Retry-After`

**Dependencies:** Task 5

**Files touched:**
- `apps/api/src/middleware/rate-limit.ts`
- `apps/api/src/index.ts` (register middleware)

**Estimated scope:** S

---

### Task 7: Request counter middleware

**Description:** Increment the global `stats:total_requests` Redis key on every successful API request (non-4xx, non-5xx). This single integer powers the landing page live counter. Fire-and-forget — never `await` inside the request path.

**Acceptance criteria:**
- [ ] Increments `stats:total_requests` via `redis.incr()` after response is sent
- [ ] Uses `c.executionCtx.waitUntil()` or equivalent fire-and-forget pattern — never blocks response
- [ ] Counter only increments on 2xx responses
- [ ] `GET /api/stats` returns `{ total: <number> }` for the frontend to bootstrap

**Verification:**
- [ ] Hit 5 endpoints → `GET /api/stats` returns `{ total: 5 }`
- [ ] Vitest unit test: counter increments correctly
- [ ] Response time unaffected — counter write is async

**Dependencies:** Task 4

**Files touched:**
- `apps/api/src/middleware/request-counter.ts`
- `apps/api/src/routes/stats.ts`
- `apps/api/src/index.ts` (register route)

**Estimated scope:** S

---

### ✅ Checkpoint 2 — API Foundation

- [ ] `/health` confirms Redis connected
- [ ] `X-MF-ID` middleware resolves identity on every request
- [ ] Rate limit headers present on every response
- [ ] Rate limit enforced — 301st request from same `mfId` gets 429
- [ ] Request counter increments and is readable via `/api/stats`
- [ ] All Vitest unit tests pass: `bun run test`

---

## Phase 3 — REST API: All 14 Entities

---

### Task 8: Pagination schema + response envelope helper

**Description:** Create the shared Zod schema for query params (`limit`, `skip`, `search`, `sort`, `order`) and a `respond()` helper function that wraps any data array in the standard `ApiResponse<T>` envelope. Every entity router uses these — build them once.

**Acceptance criteria:**
- [ ] `paginationSchema` Zod object: `limit` (1–100, default 10), `skip` (≥0, default 0), `search` (string, optional), `sort` (string, optional), `order` (`asc`|`desc`, default `asc`)
- [ ] `respond<T>(data: T[], total: number, params, entity: string)` returns `ApiResponse<T>`
- [ ] `meta.generatedAt` is an ISO timestamp
- [ ] Exported from `apps/api/src/lib/`

**Verification:**
- [ ] Vitest unit test: `respond()` with 5 items returns correct envelope shape
- [ ] Vitest unit test: `paginationSchema.parse({ limit: '5' })` coerces to number

**Dependencies:** Task 4

**Files touched:**
- `apps/api/src/lib/pagination.ts`
- `apps/api/src/lib/respond.ts`

**Estimated scope:** S

---

### Task 9: Faker.js generators — Tier 1 entities (6 entities)

**Description:** Write Faker.js generator functions for the 6 Tier 1 entities: `users`, `products`, `posts`, `comments`, `todos`, `carts`. Each generator accepts pagination/filter params and returns typed arrays using the interfaces from `packages/types`. Apply `limit`, `skip`, and `search` filtering inside the generator.

**Acceptance criteria:**
- [ ] `generateUsers(params)` → `User[]`
- [ ] `generateProducts(params)` → `Product[]`
- [ ] `generatePosts(params)` → `Post[]`
- [ ] `generateComments(params)` → `Comment[]`
- [ ] `generateTodos(params)` → `Todo[]`
- [ ] `generateCarts(params)` → `Cart[]`
- [ ] Each generator respects `limit` and `skip`
- [ ] `search` param filters across relevant text fields (case-insensitive)
- [ ] Generated data is realistic (not lorem ipsum — real names, real-looking emails, real category names)

**Verification:**
- [ ] Vitest unit test per generator: returns correct count for `limit`
- [ ] Vitest unit test: `search` filters correctly
- [ ] Manual check: `generateProducts({ limit: 3 })` returns 3 plausible products

**Dependencies:** Tasks 2, 7

**Files touched:**
- `apps/api/src/data/generators/users.ts`
- `apps/api/src/data/generators/products.ts`
- `apps/api/src/data/generators/posts.ts`
- `apps/api/src/data/generators/comments.ts`
- `apps/api/src/data/generators/todos.ts`
- `apps/api/src/data/generators/carts.ts`

**Estimated scope:** M

---

### Task 10: Faker.js generators — Tier 2 entities (8 entities)

**Description:** Write Faker.js generator functions for the 8 Tier 2 entities: `messages`, `notifications`, `quotes`, `recipes`, `countries`, `companies`, `stocks`, `events`. Same pattern as Task 8.

**Acceptance criteria:**
- [ ] `generateMessages(params)` → `Message[]`
- [ ] `generateNotifications(params)` → `Notification[]`
- [ ] `generateQuotes(params)` → `Quote[]`
- [ ] `generateRecipes(params)` → `Recipe[]`
- [ ] `generateCountries(params)` → `Country[]`
- [ ] `generateCompanies(params)` → `Company[]`
- [ ] `generateStocks(params)` → `Stock[]` (realistic symbols: AAPL, TSLA, etc.)
- [ ] `generateEvents(params)` → `Event[]`
- [ ] All generators respect `limit`, `skip`, `search`

**Verification:**
- [ ] Vitest unit test per generator: returns correct count
- [ ] Manual check: `generateStocks({ limit: 5 })` returns 5 plausible stock tickers

**Dependencies:** Tasks 2, 7

**Files touched:**
- `apps/api/src/data/generators/messages.ts`
- `apps/api/src/data/generators/notifications.ts`
- `apps/api/src/data/generators/quotes.ts`
- `apps/api/src/data/generators/recipes.ts`
- `apps/api/src/data/generators/countries.ts`
- `apps/api/src/data/generators/companies.ts`
- `apps/api/src/data/generators/stocks.ts`
- `apps/api/src/data/generators/events.ts`

**Estimated scope:** M

---

### Task 11: REST routes — all 14 entities

**Description:** Wire up Hono routers for all 14 entities using the generators from Tasks 8–9. Each entity gets the full CRUD surface: list, single, search, fake create, fake update, fake delete. Fake writes return the item without persisting anything.

**Acceptance criteria:**
- [ ] `GET /api/{entity}` — paginated list using `paginationSchema`
- [ ] `GET /api/{entity}/:id` — single item (generate one with seeded id)
- [ ] `GET /api/{entity}/search?q=` — full-text search across text fields
- [ ] `POST /api/{entity}` — returns fake-created item (body is accepted, ignored, merged with generated data)
- [ ] `PUT /api/{entity}/:id` — returns fake-updated item
- [ ] `DELETE /api/{entity}/:id` — returns `{ deleted: true, id }`
- [ ] All routes use `zValidator` for query/body validation
- [ ] All routes are mounted at `/api` prefix
- [ ] All 14 entities have routes registered

**Verification:**
- [ ] Vitest integration test per entity: GET list returns correct envelope
- [ ] `curl http://localhost:4000/api/products?limit=5` returns 5 products
- [ ] `curl http://localhost:4000/api/users/1` returns a single user
- [ ] `curl http://localhost:4000/api/products/search?q=phone` returns filtered results

**Dependencies:** Tasks 7, 8, 9

**Files touched:**
- `apps/api/src/routes/rest/index.ts` (mounts all entity routers)
- `apps/api/src/routes/rest/{entity}.ts` × 14

**Estimated scope:** M

---

### ✅ Checkpoint 3 — REST API Complete

- [ ] All 14 entities respond correctly to GET, POST, PUT, DELETE
- [ ] Pagination, search, sort work across all entities
- [ ] Rate limit headers present on all responses
- [ ] Request counter increments on each call
- [ ] All integration tests pass

---

## Phase 4a — GraphQL Layer

---

### Task 12: GraphQL schema — Tier 1 types + queries

**Description:** Set up Pothos schema builder with graphql-yoga. Define GraphQL object types for the 6 Tier 1 entities and their list queries with pagination args. Mount the GraphQL handler at `POST /graphql`.

**Acceptance criteria:**
- [ ] Pothos `SchemaBuilder` initialised with TypeScript type safety
- [ ] Object types defined for: `User`, `Product`, `Post`, `Comment`, `Todo`, `Cart`
- [ ] Each type has a list query: `users(limit, skip, search)`, `products(...)`, etc.
- [ ] Each type has a single query: `user(id)`, `product(id)`, etc.
- [ ] Pagination args match REST params (limit, skip, search)
- [ ] graphql-yoga handler mounted at `POST /graphql`
- [ ] GraphQL Playground accessible at `/graphql?playground=1`

**Verification:**
- [ ] Vitest integration test: `{ products(limit: 3) { title price } }` returns 3 products
- [ ] Manual: open `/graphql?playground=1`, run a query, get data

**Dependencies:** Tasks 8, 10

**Files touched:**
- `apps/api/src/routes/graphql/builder.ts`
- `apps/api/src/routes/graphql/types/tier1.ts`
- `apps/api/src/routes/graphql/queries/tier1.ts`
- `apps/api/src/routes/graphql/index.ts`

**Estimated scope:** M

---

### Task 13: GraphQL schema — Tier 2 types + queries

**Description:** Extend the Pothos schema with the 8 Tier 2 entity types and their queries. Same pattern as Task 11.

**Acceptance criteria:**
- [ ] Object types defined for: `Message`, `Notification`, `Quote`, `Recipe`, `Country`, `Company`, `Stock`, `Event`
- [ ] List + single queries for all 8 types
- [ ] All queries return data generated by Tier 2 generators

**Verification:**
- [ ] Vitest integration test: `{ stocks(limit: 5) { symbol price } }` returns 5 stocks
- [ ] `{ recipes(limit: 2) { name ingredients } }` returns 2 recipes

**Dependencies:** Tasks 9, 11

**Files touched:**
- `apps/api/src/routes/graphql/types/tier2.ts`
- `apps/api/src/routes/graphql/queries/tier2.ts`

**Estimated scope:** M

---

## Phase 4b — WebSocket + Socket.io

---

### Task 14: Bun native WebSocket server setup + `/ws/stats`

**Description:** Configure `Bun.serve()` to handle both HTTP (Hono) and native WebSocket connections side by side. Implement the `/ws/stats` endpoint that broadcasts the total request count every 2 seconds to all subscribers. This is the simplest WS endpoint and validates the WS infrastructure.

**Acceptance criteria:**
- [ ] `Bun.serve()` configured with both `fetch` (Hono) and `websocket` handlers
- [ ] HTTP and WS connections work on the same port (`:4000`)
- [ ] `/ws/stats` upgrades the connection and subscribes client to `stats` topic
- [ ] Server broadcasts `{ total: <number> }` to all `stats` subscribers every 2 seconds
- [ ] Heartbeat: server sends ping every 30s, disconnects client if no pong in 10s
- [ ] On client disconnect, subscription is cleaned up

**Verification:**
- [ ] Vitest WS test: connect to `/ws/stats`, receive `{ total: N }` within 3 seconds
- [ ] Manual: `wscat -c ws://localhost:4000/ws/stats` → see counter messages arrive

**Dependencies:** Task 7

**Files touched:**
- `apps/api/src/index.ts` (Bun.serve websocket config)
- `apps/api/src/ws/stats.ts`
- `apps/api/src/ws/index.ts` (WS router/dispatcher)

**Estimated scope:** M

---

### Task 15: `/ws/notifications` — live notification stream

**Description:** Implement the notifications WebSocket endpoint. On connect, start emitting fake notification events every 3–7 seconds (randomised interval). Notifications use the `Notification` entity generator.

**Acceptance criteria:**
- [ ] `ws://localhost:4000/ws/notifications` accepts connections
- [ ] Emits a new `Notification` object every 3–7 seconds (random interval)
- [ ] Notification shape matches `Notification` type from `packages/types`
- [ ] Emitted as JSON string
- [ ] Heartbeat/cleanup as per Task 13 pattern
- [ ] Multiple concurrent clients each receive independent streams

**Verification:**
- [ ] Vitest WS test: receive ≥ 1 notification within 8 seconds of connecting
- [ ] Vitest WS test: notification shape validates against `Notification` type

**Dependencies:** Tasks 9, 13

**Files touched:**
- `apps/api/src/ws/notifications.ts`
- `apps/api/src/ws/index.ts` (register handler)

**Estimated scope:** S

---

### Task 16: `/ws/chat/{roomId}` — bidirectional chat stream

**Description:** Implement the chat WebSocket endpoint. Clients join a room by connecting to `/ws/chat/{roomId}`. The server emits fake chat messages to all clients in the room every 2–5 seconds. Clients can also send messages which are broadcast to the room (echoed as fake response).

**Acceptance criteria:**
- [ ] `ws://localhost:4000/ws/chat/{roomId}` accepts connections
- [ ] Clients in the same `roomId` share a pub/sub topic
- [ ] Server emits fake `Message` every 2–5 seconds to all room subscribers
- [ ] Client-sent messages are broadcast to the room with a fake "reply" appended after 1s
- [ ] Message shape matches `Message` type
- [ ] Room subscriptions cleaned up on disconnect

**Verification:**
- [ ] Vitest WS test: two clients on same `roomId` both receive server messages
- [ ] Vitest WS test: message sent by client A is received by client B

**Dependencies:** Tasks 8, 13

**Files touched:**
- `apps/api/src/ws/chat.ts`
- `apps/api/src/ws/index.ts` (register handler)

**Estimated scope:** M

---

### Task 17: `/ws/ticker` — live stock ticker stream

**Description:** Implement the stock ticker WebSocket endpoint. On connect, start streaming stock price updates every 1 second. Prices fluctuate slightly from the base generated value (±0.5–2% per tick) to simulate live market data.

**Acceptance criteria:**
- [ ] `ws://localhost:4000/ws/ticker` accepts connections
- [ ] Emits array of `Stock` updates every 1 second (same 10 symbols, fluctuating prices)
- [ ] Price fluctuation is ±0.5–2% per tick, `change` and `changePercent` update accordingly
- [ ] Stock shape matches `Stock` type

**Verification:**
- [ ] Vitest WS test: receive ≥ 2 ticks within 3 seconds
- [ ] Vitest WS test: price values change between ticks

**Dependencies:** Tasks 9, 13

**Files touched:**
- `apps/api/src/ws/ticker.ts`
- `apps/api/src/ws/index.ts` (register handler)

**Estimated scope:** S

---

### Task 18: Socket.io server — notifications, chat, ticker namespaces

**Description:** Set up a Socket.io v4 server alongside the Bun WS server. Create three namespaces (`/notifications`, `/chat`, `/ticker`) that mirror the raw WS endpoints. Socket.io clients use these namespaces for the same real-time data with automatic reconnection and fallback transport.

**Acceptance criteria:**
- [ ] Socket.io server initialised and attached to the same Bun HTTP server
- [ ] `/notifications` namespace: emits `notification` event every 3–7s
- [ ] `/chat` namespace: rooms by `roomId`, bidirectional messages, same logic as raw WS
- [ ] `/ticker` namespace: emits `tick` event every 1s with stock updates
- [ ] CORS configured to allow connections from `apps/web` origin
- [ ] Socket.io client can connect from a browser without errors

**Verification:**
- [ ] Manual: connect Socket.io client from browser console → receive events on all 3 namespaces
- [ ] Vitest integration test: Socket.io client connects and receives `notification` event

**Dependencies:** Tasks 14, 15, 16

**Files touched:**
- `apps/api/src/ws/socketio/index.ts`
- `apps/api/src/ws/socketio/notifications.ts`
- `apps/api/src/ws/socketio/chat.ts`
- `apps/api/src/ws/socketio/ticker.ts`
- `apps/api/src/index.ts` (attach Socket.io)

**Estimated scope:** M

---

### ✅ Checkpoint 4 — Protocols Complete

- [ ] All 14 entities queryable via REST and GraphQL
- [ ] `/ws/stats`, `/ws/notifications`, `/ws/chat/:roomId`, `/ws/ticker` all stream data
- [ ] All 3 Socket.io namespaces functional
- [ ] All Vitest tests pass

---

## Phase 5 — Custom Schema Builder (Backend)

---

### Task 19: Schema parser + fake record generator

**Description:** Build the core schema engine: a parser that validates a `SchemaDefinition` JSON blob, and a generator that takes a parsed schema and produces fake records using Faker.js. This is the backbone of the entire custom schema feature.

**Acceptance criteria:**
- [ ] `parseSchema(input: unknown): SchemaDefinition` — validates and parses user-supplied schema JSON, throws `ZodError` on invalid input
- [ ] Supported field types: `string`, `number`, `boolean`, `date`, `enum`, `uuid`, `email`, `url`, `image`, `array(type)`
- [ ] `generateFromSchema(schema: SchemaDefinition, count: number): Record<string, unknown>[]` — generates `count` fake records
- [ ] Each field type maps to an appropriate Faker.js method
- [ ] `enum` fields randomly pick from the supplied `values` array
- [ ] `array(type)` generates 2–5 items of the inner type

**Verification:**
- [ ] Vitest unit test: Flight schema (origin enum, destination enum, price number, status enum) generates valid records
- [ ] Vitest unit test: invalid schema throws with descriptive error
- [ ] Vitest unit test: `array(string)` field generates an array of strings

**Dependencies:** Task 2

**Files touched:**
- `apps/api/src/schema-builder/parser.ts`
- `apps/api/src/schema-builder/generator.ts`

**Estimated scope:** M

---

### Task 20: Schema Redis store (save, fetch, list, delete)

**Description:** Implement the Redis persistence layer for custom schemas. Schemas are stored by a nanoid slug. Ephemeral schemas get a 1-hour TTL; persistent schemas have no TTL. An `mf_id` index tracks all schemas owned by a browser identity.

**Acceptance criteria:**
- [ ] `saveSchema(schema, mfId, persistent: boolean): string` — saves to Redis, returns slug
- [ ] `getSchema(slug): SavedSchema | null` — fetches by slug
- [ ] `listSchemas(mfId): SavedSchema[]` — fetches all schemas for an `mfId`
- [ ] `deleteSchema(slug, mfId): boolean` — deletes schema, removes from `mfId` index, returns false if not owned by `mfId`
- [ ] Redis key patterns:
  - `schema:{slug}` → JSON blob
  - `mf:{mfId}:schemas` → Redis Set of slugs
- [ ] Ephemeral schema: `EXPIRE schema:{slug} 3600`
- [ ] Persistent schema: no TTL set

**Verification:**
- [ ] Vitest integration test: save → fetch → returns same data
- [ ] Vitest integration test: ephemeral schema → TTL is ~3600s
- [ ] Vitest integration test: delete → fetch → returns null
- [ ] Vitest integration test: `mfId` can only delete its own schemas

**Dependencies:** Tasks 3, 18

**Files touched:**
- `apps/api/src/schema-builder/store.ts`

**Estimated scope:** M

---

### Task 21: Custom schema REST routes

**Description:** Expose the custom schema engine via REST endpoints. Any client can create a schema (ephemeral or persistent), fetch data from it, and manage it using their `mf_id`.

**Acceptance criteria:**
- [ ] `POST /api/schemas` — accepts `SchemaDefinition` + `persistent` flag, returns `{ slug, endpoint }`
- [ ] `GET /api/schemas` — lists all schemas for the requesting `mfId`
- [ ] `DELETE /api/schemas/:slug` — deletes schema if owned by requesting `mfId`
- [ ] `GET /api/custom/:slug` — generates paginated fake records from stored schema
- [ ] `GET /api/custom/:slug/:id` — generates one fake record
- [ ] All endpoints use `mfId` from context (set by `mf-id` middleware)
- [ ] `POST /api/schemas` body validated with Zod

**Verification:**
- [ ] Vitest integration test: POST schema → GET custom endpoint → returns generated data
- [ ] Vitest integration test: DELETE schema with wrong `mfId` → 403
- [ ] `curl -X POST /api/schemas -d '{ "name": "Flight", "fields": [...] }' -H "X-MF-ID: abc"` → returns slug

**Dependencies:** Tasks 10, 18, 19

**Files touched:**
- `apps/api/src/routes/schemas.ts`
- `apps/api/src/routes/rest/custom.ts`
- `apps/api/src/index.ts` (register routes)

**Estimated scope:** M

---

### ✅ Checkpoint 5 — Schema Builder Backend Complete

- [ ] Custom schema can be created, fetched, listed, and deleted via REST
- [ ] Ephemeral schemas expire after 1 hour
- [ ] Persistent schemas survive server restart
- [ ] `mfId` ownership enforced on delete
- [ ] All Vitest tests pass

---

## Phase 6 — Frontend

---

### Task 22: Next.js app setup — design tokens, layout, mf-id generation

**Description:** Set up the `apps/web` application properly: configure Tailwind v4 with the MockForge custom design token system, set up the root Next.js App Router layout with dark/light mode support, and implement `mf_id` generation and storage in a Zustand store. Every subsequent frontend task builds on top of this.

**Acceptance criteria:**
- [ ] Tailwind v4 configured with custom CSS variables in `globals.css`: `--color-accent`, `--color-surface`, `--color-border`, `--color-text-primary`, `--color-text-muted` (dark + light values via `.dark` class)
- [ ] `app/layout.tsx` sets up root HTML shell with font, dark mode class toggle, TanStack Query provider, Zustand provider
- [ ] Dark/light mode toggle: persists to `localStorage`, applied as `dark` class on `<html>` — no flash on reload
- [ ] `useMfId()` hook: generates `crypto.randomUUID()` on first visit, stores in `localStorage` as `mf_id`, returns it on subsequent visits
- [ ] Zustand store holds `mfId` and exposes it app-wide
- [ ] `apiClient` utility: typed fetch wrapper that automatically adds `X-MF-ID: <mfId>` header to every request to `apps/api`
- [ ] TanStack Query `QueryClient` configured (stale time 30s, retry 1)
- [ ] `app/page.tsx` — minimal landing page shell (content added in Tasks 23–25)
- [ ] `app/builder/page.tsx` — minimal builder shell (content added in Tasks 26–27)

**Verification:**
- [ ] `http://localhost:3000` renders without errors
- [ ] `localStorage.getItem('mf_id')` is set to a UUID after first load
- [ ] Dark/light toggle switches theme and persists across refresh
- [ ] `apiClient('http://localhost:4000/api/products')` includes `X-MF-ID` header in network tab

**Dependencies:** Tasks 1, 3

**Files touched:**
- `apps/web/src/app/layout.tsx`
- `apps/web/src/app/globals.css` (design tokens)
- `apps/web/src/app/page.tsx` (shell)
- `apps/web/src/app/builder/page.tsx` (shell)
- `apps/web/src/store/mf-id.ts`
- `apps/web/src/hooks/use-mf-id.ts`
- `apps/web/src/lib/api-client.ts`

**Estimated scope:** M

---

### Task 23: Landing page — Hero + Protocol Showcase sections

**Description:** Build the first two sections of the landing page: the Hero (headline, animated code terminal, CTAs) and the Protocol Showcase (animated cards for REST, GraphQL, WS, Socket.io with live demo outputs). GSAP scroll-triggered entrance animations on both sections.

**Acceptance criteria:**
- [ ] Hero: headline, subheadline, two CTAs ("Explore Docs" → `apps/docs`, "Try the Builder" → `/builder`)
- [ ] Hero: animated code terminal cycles through 3 code snippets (REST fetch, GraphQL query, WS connect) with a typewriter effect (GSAP)
- [ ] Protocol Showcase: 4 cards (REST, GraphQL, WS, Socket.io) each showing a live sample response snippet
- [ ] GSAP `ScrollTrigger` entrance animations: hero fades up on load, cards stagger in on scroll
- [ ] Fully responsive (mobile + desktop)
- [ ] Dark/light mode correct on both sections

**Verification:**
- [ ] Manual: scroll the page — animations trigger correctly
- [ ] Manual: code terminal cycles through all 3 snippets
- [ ] Manual: dark/light toggle — no unstyled elements

**Dependencies:** Task 22

**Files touched:**
- `apps/web/src/components/landing/Hero.tsx`
- `apps/web/src/components/landing/ProtocolShowcase.tsx`
- `apps/web/src/pages/Landing.tsx`

**Estimated scope:** M

---

### Task 24: Landing page — Entity Browser + Live Counter sections

**Description:** Build the Entity Browser (grid of all 14 entities with hover sample preview) and the Live Counter (total API requests, updated in real time via WebSocket connection to `/ws/stats`).

**Acceptance criteria:**
- [ ] Entity Browser: 14 cards in a responsive grid, each showing entity name + icon + 2–3 sample field names
- [ ] Hover on entity card: reveals a small animated JSON preview of one sample record
- [ ] Live Counter: connects to `ws://api:4000/ws/stats` on mount, displays animated number counter (GSAP `countTo`)
- [ ] Counter reconnects automatically if WebSocket drops
- [ ] Counter shows a formatted number (e.g. "1,234,567 requests served")
- [ ] Scroll-triggered entrance animations on both sections

**Verification:**
- [ ] Manual: hover entity card → JSON preview appears
- [ ] Manual: counter updates when API calls are made in another tab
- [ ] Manual: counter is visible in both dark and light mode

**Dependencies:** Tasks 13, 22

**Files touched:**
- `apps/web/src/components/landing/EntityBrowser.tsx`
- `apps/web/src/components/landing/LiveCounter.tsx`
- `apps/web/src/hooks/use-ws-stats.ts`

**Estimated scope:** M

---

### Task 25: Landing page — DX Highlights + Footer

**Description:** Build the DX Highlights section (copy-paste code samples in multiple languages, TypeScript types callout) and the Footer. Complete the landing page.

**Acceptance criteria:**
- [ ] DX Highlights: 3 tabs (JavaScript, Python, cURL) with syntax-highlighted code samples for a `GET /api/products` call
- [ ] Syntax highlighting via `highlight.js` or `shiki` (no runtime dependency on a full editor)
- [ ] "Copy" button per code block — copies to clipboard, shows "Copied!" for 2s
- [ ] "Zero signup" callout with icon
- [ ] Footer: links to docs, GitHub (placeholder), schema builder

**Verification:**
- [ ] Manual: copy button works in all browsers
- [ ] Manual: tab switching shows correct language sample
- [ ] Manual: full landing page scrolls without layout issues

**Dependencies:** Task 23

**Files touched:**
- `apps/web/src/components/landing/DXHighlights.tsx`
- `apps/web/src/components/landing/Footer.tsx`

**Estimated scope:** S

---

### Task 26: Schema builder UI — field definition + live preview

**Description:** Build the core schema builder interface at `/builder`. Two modes: visual (form-based field editor) and JSON (raw textarea). Live preview panel shows generated sample records on the right as fields are defined.

**Acceptance criteria:**
- [ ] Visual mode: add/remove fields, set name, type, and type-specific options (enum values, min/max for numbers)
- [ ] Field types available: `string`, `number`, `boolean`, `date`, `enum`, `uuid`, `email`, `url`, `image`, `array(string)`
- [ ] JSON mode: raw textarea accepts `SchemaDefinition` JSON, validates with Zod on change
- [ ] Toggle between visual and JSON modes (JSON reflects visual and vice versa)
- [ ] Live preview: calls `POST /api/schemas` with `persistent: false` on debounce (500ms), displays 3 generated records
- [ ] Preview updates in real time as fields are edited
- [ ] Handled with `react-hook-form` + Zod

**Verification:**
- [ ] Manual: add a `string` field → preview shows string values
- [ ] Manual: add an `enum` field with values `[A, B, C]` → preview shows only A, B, or C
- [ ] Manual: switch to JSON mode → see the equivalent JSON

**Dependencies:** Tasks 20, 21

**Files touched:**
- `apps/web/src/pages/Builder.tsx`
- `apps/web/src/components/builder/FieldEditor.tsx`
- `apps/web/src/components/builder/JsonEditor.tsx`
- `apps/web/src/components/builder/Preview.tsx`

**Estimated scope:** L (break into two sessions if needed)

---

### Task 27: Schema builder UI — save, list, copy endpoint

**Description:** Add the persistence layer to the schema builder: save a schema to Redis (persistent), list saved schemas, delete, and display the generated endpoint URL with a copy button.

**Acceptance criteria:**
- [ ] "Save Schema" button: calls `POST /api/schemas` with `persistent: true`, uses `mfId` from Zustand store
- [ ] Saved schemas sidebar: lists all schemas for the current `mfId` (calls `GET /api/schemas`)
- [ ] Click a saved schema → loads it into the builder
- [ ] Delete button per saved schema (calls `DELETE /api/schemas/:slug`)
- [ ] Endpoint URL displayed after save: `https://api.mockforge.dev/api/custom/{slug}`
- [ ] Copy button copies endpoint URL to clipboard
- [ ] One-time dismissable prompt after first save: "Your browser ID is `{mfId}` — save it to restore schemas on another device"

**Verification:**
- [ ] Manual: save schema → endpoint URL appears → copy works
- [ ] Manual: refresh page → saved schemas still listed
- [ ] Manual: delete schema → removed from list

**Dependencies:** Tasks 20, 25

**Files touched:**
- `apps/web/src/components/builder/SavedSchemas.tsx`
- `apps/web/src/components/builder/EndpointDisplay.tsx`
- `apps/web/src/components/builder/MfIdPrompt.tsx`
- `apps/web/src/pages/Builder.tsx` (wire up)

**Estimated scope:** M

---

### ✅ Checkpoint 6 — Frontend Complete

- [ ] Landing page renders fully — all 5 sections, animations, dark/light mode
- [ ] Live counter connects to WS and updates
- [ ] Schema builder: create, preview, save, list, delete all work
- [ ] `mf_id` persists across refreshes
- [ ] `X-MF-ID` header sent on all API calls from the frontend

---

## Phase 7 — Docs, Polish & Monitoring

---

### Task 28: Fumadocs setup + docs structure inside `apps/web`

**Description:** Configure Fumadocs inside the existing Next.js app. Fumadocs lives at `app/docs/` as a route group, with MDX source files in `content/docs/`. Set up the sidebar structure, theme customisation to match MockForge design tokens, and stub pages for every section.

**Acceptance criteria:**
- [ ] `fumadocs-core`, `fumadocs-ui`, `fumadocs-mdx` wired into Next.js via `next.config.ts` using `withFumadocs()`
- [ ] `source.config.ts` at root of `apps/web` defines the MDX source directory (`content/docs/`)
- [ ] `app/docs/layout.tsx` renders the Fumadocs sidebar layout with custom theme matching MockForge tokens (accent color, dark mode)
- [ ] `app/docs/[[...slug]]/page.tsx` handles all doc routes dynamically
- [ ] Sidebar sections configured: Getting Started, REST API, GraphQL, WebSockets, Socket.io, Custom Schemas, Rate Limits, Identity
- [ ] Each section has at least a stub MDX page in `content/docs/`
- [ ] Built-in Fumadocs search works (default local search)
- [ ] `http://localhost:3000/docs` renders docs with sidebar, no 404

**Verification:**
- [ ] `http://localhost:3000/docs` renders sidebar with all sections
- [ ] Clicking any sidebar link loads the stub page without error
- [ ] Dark mode matches the rest of `apps/web`
- [ ] `bun run build` compiles docs pages without errors

**Dependencies:** Task 1

**Files touched:**
- `apps/web/next.config.ts` (add `withFumadocs()`)
- `apps/web/source.config.ts`
- `apps/web/src/app/docs/layout.tsx`
- `apps/web/src/app/docs/[[...slug]]/page.tsx`
- `apps/web/content/docs/**/*.mdx` (stub pages per section)

**Estimated scope:** M

---

### Task 29: Docs content — REST API reference

**Description:** Write the REST API reference documentation. Cover every endpoint for every entity with request/response examples, query param tables, and error codes.

**Acceptance criteria:**
- [ ] One MDX page per entity (or grouped by tier)
- [ ] Each endpoint documented: method, path, params table, example request (cURL), example response (JSON)
- [ ] Pagination params documented once, referenced from all entity pages
- [ ] Rate limiting docs: limits, headers, 429 response example
- [ ] Response envelope documented with field descriptions

**Verification:**
- [ ] Manual: every REST endpoint in the spec has a corresponding docs entry
- [ ] Manual: copy-paste any cURL example → it works against local API

**Dependencies:** Tasks 11, 28

**Files touched:**
- `apps/web/content/docs/rest/**/*.mdx`

**Estimated scope:** M

---

### Task 30: Docs content — GraphQL, WebSocket, Socket.io, Custom Schemas

**Description:** Write documentation for the non-REST protocols and the custom schema builder. Include connection examples, event schemas, and a full schema builder walkthrough.

**Acceptance criteria:**
- [ ] GraphQL: endpoint, playground URL, example queries for 3 entities, pagination args
- [ ] WebSockets: connection examples for all 4 WS endpoints, message shape per endpoint
- [ ] Socket.io: namespace list, event names, client connection code (JS)
- [ ] Custom Schemas: step-by-step walkthrough (define → preview → save → use endpoint), field type reference table
- [ ] Identity: explanation of `mf_id`, `X-MF-ID` header, rate limiting behaviour

**Verification:**
- [ ] Manual: follow Custom Schemas walkthrough from scratch → working endpoint at the end
- [ ] Manual: copy Socket.io connection snippet → works in browser console

**Dependencies:** Tasks 13, 18, 21, 28

**Files touched:**
- `apps/web/content/docs/graphql.mdx`
- `apps/web/content/docs/websockets.mdx`
- `apps/web/content/docs/socketio.mdx`
- `apps/web/content/docs/custom-schemas.mdx`
- `apps/web/content/docs/identity.mdx`

**Estimated scope:** M

---

### Task 31: Cronitor monitoring setup

**Description:** Wire up Cronitor (or equivalent) for uptime and latency monitoring on the live API. Create a `/health` ping monitor and configure latency alerts.

**Acceptance criteria:**
- [ ] Cronitor monitor created for `GET https://api.mockforge.dev/health`
- [ ] Ping interval: every 1 minute
- [ ] Alert on: status non-200, response time > 2s, 3 consecutive failures
- [ ] Alert channel: email (or Slack webhook if preferred)
- [ ] Cronitor environment variable (`CRONITOR_API_KEY`) documented in `.env.example`

**Verification:**
- [ ] Manually trigger a downtime → alert fires within 3 minutes
- [ ] Cronitor dashboard shows uptime history

**Dependencies:** Task 4

**Files touched:**
- `.env.example` (add `CRONITOR_API_KEY`)
- `apps/api/src/index.ts` (Cronitor heartbeat on startup, optional)

**Estimated scope:** S

---

### Task 32: E2E tests — 3 critical user journeys

**Description:** Write Playwright E2E tests covering the three critical user journeys defined in the spec. These are the final safety net before any deployment.

**Acceptance criteria:**
- [ ] Journey 1: Visit landing page → live counter is visible and shows a number → copy a cURL example → run it → get data
- [ ] Journey 2: Visit `/builder` → add 3 fields → see preview update → copy ephemeral endpoint URL → `curl` it → get data
- [ ] Journey 3: Visit `/builder` → save a schema → refresh page → schema still listed in sidebar
- [ ] Tests run against local dev servers (`bun run dev`)
- [ ] `bun run test:e2e` executes all Playwright tests

**Verification:**
- [ ] `bun run test:e2e` exits 0 with all 3 journeys passing

**Dependencies:** Tasks 23, 25, 26

**Files touched:**
- `apps/web/tests/e2e/landing.spec.ts`
- `apps/web/tests/e2e/builder-ephemeral.spec.ts`
- `apps/web/tests/e2e/builder-persistent.spec.ts`
- `apps/web/playwright.config.ts`

**Estimated scope:** M

---

### Task 33: CI pipeline (GitHub Actions)

**Description:** Set up a GitHub Actions workflow that runs on every push and PR: type-check, lint, unit tests, integration tests. Separate job for E2E (runs on PRs to main only, needs both servers running).

**Acceptance criteria:**
- [ ] `bun run lint` passes in CI
- [ ] `bun run build` passes in CI (type-check all packages)
- [ ] Vitest unit + integration tests pass in CI
- [ ] E2E Playwright tests run on PRs to `main` only
- [ ] Redis service container spun up for integration tests
- [ ] CI fails fast — any step failure stops the pipeline
- [ ] CI badge added to `README.md`

**Verification:**
- [ ] Push a failing test → CI fails and blocks merge
- [ ] Push a fix → CI passes

**Dependencies:** Tasks 5, 10, 20, 31

**Files touched:**
- `.github/workflows/ci.yml`
- `README.md`

**Estimated scope:** M

---

### Task 34: Deployment — Railway (API) + Vercel (web + docs)

**Description:** Configure production deployment for all three apps. API on Railway with environment variables. Web and docs on Vercel with monorepo root directory overrides.

**Acceptance criteria:**
- [ ] `apps/api` deployed on Railway with `bun run start` as the start command
- [ ] Railway environment variables set: `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN`, `CRONITOR_API_KEY`, `NODE_ENV=production`
- [ ] `apps/web` deployed on Vercel with root directory `apps/web` — serves both the landing page and `/docs` from the same deployment
- [ ] CORS in `apps/api` allows Vercel production origins
- [ ] `api.mockforge.dev` DNS configured for Railway
- [ ] `mockforge.dev` DNS configured for Vercel (landing + docs at `/docs`)

**Verification:**
- [ ] `curl https://api.mockforge.dev/health` → `{ "status": "ok", "redis": "connected" }`
- [ ] `https://mockforge.dev` loads landing page with live counter working
- [ ] `https://mockforge.dev/docs` loads Fumadocs documentation with sidebar

**Dependencies:** Tasks 3, 21, 27

**Files touched:**
- `apps/api/src/index.ts` (production CORS origins)
- `railway.json` or `railway.toml`
- `vercel.json` (if needed for monorepo config)
- `README.md` (deployment docs)

**Estimated scope:** M

---

### ✅ Final Checkpoint — v1 Launch Ready

- [ ] All 35 tasks complete
- [ ] All Vitest unit + integration tests pass (`bun run test`)
- [ ] All 3 E2E Playwright journeys pass (`bun run test:e2e`)
- [ ] `bun run build` exits 0 across all packages
- [ ] Production URLs all respond correctly
- [ ] Live counter visible and updating on the landing page
- [ ] Custom schema → endpoint flow works end-to-end in production
- [ ] Cronitor shows green uptime
- [ ] CI passes on `main` branch

---

## Risks and Mitigations

| Risk | Impact | Mitigation |
|---|---|---|
| Socket.io v4 incompatibility with Bun | High | Test Socket.io connection in Task 17 early; fallback: use Bun native WS only, document Socket.io as "coming soon" |
| Upstash Redis free tier (10k commands/day) hit at launch | Medium | Add `GET /api/stats` caching (cache for 5s); rate limiter uses sliding window efficiently |
| GSAP license for commercial use | Low | MockForge is free; GSAP free tier covers non-commercial. Confirm on gsap.com |
| Bun WebSocket + HTTP on same port conflicts | Medium | Validate in Task 13 first; if issues, run WS on `:4001` as fallback |
| Turborepo cache invalidation across Bun workspaces | Low | Pin Turborepo version; document `turbo --force` for cache busting |

---

## Open Questions (Resolve Before Starting)

1. **Railway vs Fly.io** — Railway free tier was recently restructured. Confirm current free tier limits support always-on WebSocket server before scaffolding Railway config.
2. **GSAP license** — confirm free tier covers this use case at `gsap.com/licensing`.
3. **Domain** — "MockForge" confirmed? Purchase domain before Task 33.
4. **Upstash plan** — free tier is 10k commands/day. At launch, consider a $10/mo Pay-as-you-go plan to avoid hitting ceiling.