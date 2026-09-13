<p align="center">
  <img src="apps/web/src/app/icon.svg" width="72" height="72" alt="MockForge" />
</p>

<h1 align="center">MockForge</h1>

<p align="center">
  A hosted fake-data API for REST, GraphQL, WebSockets, and Socket.IO.<br />
  No signup. No API key. Point your client at the public origin and go.
</p>

<p align="center">
  <a href="https://github.com/deepakkumardewani/mockforge/actions/workflows/ci.yml"><img src="https://github.com/deepakkumardewani/mockforge/actions/workflows/ci.yml/badge.svg" alt="CI" /></a>
  <img src="https://img.shields.io/badge/typescript-%23007ACC.svg?style=flat&logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Bun-%23000000.svg?style=flat&logo=bun&logoColor=white" alt="Bun" />
  <img src="https://img.shields.io/badge/Next-black?style=flat&logo=next.js&logoColor=white" alt="Next.js" />
  <img src="https://img.shields.io/badge/hono-E36002?style=flat&logo=hono&logoColor=white" alt="Hono" />
  <img src="https://img.shields.io/badge/-GraphQL-E10098?style=flat&logo=graphql&logoColor=white" alt="GraphQL" />
  <img src="https://img.shields.io/badge/github%20actions-%232671E5.svg?style=flat&logo=githubactions&logoColor=white" alt="GitHub Actions" />
</p>

<p align="center">
  <a href="https://mockforge.dev">Website</a> ·
  <a href="https://api.mockforge.dev">API</a> ·
  <a href="https://mockforge.dev/docs">Docs</a> ·
  <a href="https://mockforge.dev/playground">Playground</a> ·
  <a href="https://mockforge.dev/builder">Schema builder</a>
</p>

## What it does

MockForge generates realistic mock data so you can build and test clients without standing up a backend.

- **REST** — 14 entities under `/api/{entity}` with list, get, search, and non-persistent writes
- **GraphQL** — same entities at `POST /graphql`
- **WebSockets** — live streams at `/ws/stats`, `/ws/notifications`, `/ws/chat/{roomId}`, `/ws/ticker`
- **Socket.IO** — `/notifications`, `/chat`, `/ticker` on a separate Socket.IO origin
- **Custom schemas** — design a shape in the builder, then read it at `/api/custom/{slug}`
- **Identity** — optional `X-MF-ID` owns your schemas and raises the rate limit (300/min vs 60/min by IP)

> [!NOTE]
> Writes never persist. Record `id` values are generator offsets, not stored primary keys.

## Quick start

```bash
# REST
curl "https://api.mockforge.dev/api/users?limit=5"

# GraphQL
curl -X POST https://api.mockforge.dev/graphql \
  -H "Content-Type: application/json" \
  -d '{"query":"{ users { id firstName email } }"}'
```

Use the [playground](https://mockforge.dev/playground) to try REST, GraphQL, WebSocket, and Socket.IO from the browser.

## Local development

This is a Bun + Turbo monorepo (`apps/web`, `apps/api`, `packages/types`).

```bash
bun install
docker compose up -d   # Redis for rate limits and integration tests
bun run dev            # web :3000, API :4000 (Socket.IO :4001)
```

| Script | Purpose |
| --- | --- |
| `bun run lint` | oxlint across workspaces |
| `bun run typecheck` | `tsc --noEmit` |
| `bun run test` | Vitest unit tests |
| `bun run ci` | lint + typecheck + test (CI gate) |
| `bun run test:integration` | API tests that need Redis |
| `bun run test:e2e` | Playwright (install browsers first) |

Copy `apps/api/.env.example` for local Redis (`REDIS_LOCAL=true`, `REDIS_URL=redis://localhost:6379`).

## Repository layout

```
apps/web     Next.js site, docs, playground, schema builder
apps/api     Hono API, GraphQL Yoga, WebSockets, Socket.IO
packages/types   Shared TypeScript types
```

## Identity and limits

No account is required. Send `X-MF-ID` (a client-generated UUID) to own custom schemas and use the higher quota. Schema mutations require that header; public `GET`s do not. Rate-limit headers are `X-RateLimit-*`; a 429 returns `TOO_MANY_REQUESTS` and `Retry-After: 60`. Limits fail open if Redis is down.

Socket.IO does not use `X-MF-ID`. CORS is open (`*`).

## CI

Pull requests and pushes to `main` run [`.github/workflows/ci.yml`](.github/workflows/ci.yml): install with a frozen lockfile, then `lint`, `typecheck`, and `test`.
