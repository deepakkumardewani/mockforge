# MockForge

Unified fake data API platform supporting REST, GraphQL, WebSockets, and Socket.io.

## Setup

```bash
bun install
```

## Development

```bash
bun run dev       # starts apps/web on :3000 and apps/api on :4000
```

## Testing

```bash
bun run test                          # unit tests (all packages)
bun --filter @mockforge/api test:integration  # integration tests (requires Redis)
bun run test:e2e                      # Playwright E2E tests
```

## Install Playwright browsers (first time only)

```bash
playwright install --with-deps chromium firefox webkit
```

## Build

```bash
bun run build
```
