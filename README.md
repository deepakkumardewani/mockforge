<p align="center">
  <img src="apps/web/src/app/icon.svg" width="72" height="72" alt="MockForge" />
</p>

<h1 align="center">MockForge</h1>

<p align="center">
  <strong>A hosted fake-data API for REST, GraphQL, WebSockets, and Socket.IO.</strong><br />
  No signup. No API key. Point your client at the origin and go.
</p>

<p align="center">
  <a href="https://mockforge.dev">Website</a> ·
  <a href="https://api.mockforge.dev">API</a> ·
  <a href="https://mockforge.dev/docs">Docs</a> ·
  <a href="https://mockforge.dev/playground">Playground</a> ·
  <a href="https://mockforge.dev/builder">Schema builder</a>
</p>

## Why MockForge

Most frontend work stalls on a backend that is not ready, or on fixture files that drift from the real contract. MockForge is a **typed mock API you call from the app** — the same paths, envelopes, and live channels you would use against a production server.

- **Open and go.** Public origin, no installer, no account wall.
- **One model, four transports.** The same 14 resources over REST and GraphQL, plus live WebSocket and Socket.IO streams.
- **Your own shapes.** Design a schema in the builder and read generated rows at a public `GET`.
- **Honest mocks.** Writes return a sample row and never persist. `id` is a generator offset, not a stored primary key.

## Features

- **REST** — paginated lists (`limit` / `skip`), search, and non-persistent writes on every built-in resource
- **GraphQL** — `POST /graphql` with the same 14 entities; list fields return arrays
- **WebSockets** — stats, notifications, chat rooms, and a stock ticker on the API host
- **Socket.IO** — notifications, chat, and ticker with automatic reconnect (try it in the playground)
- **Custom schemas** — ten field types, preview as you edit, public `GET /api/custom/{slug}`
- **Optional identity** — send `X-MF-ID` to own schemas and raise the HTTP quota (300/min vs 60/min by IP)

> [!NOTE]
> List responses use `{ data, total, limit, skip, meta }`. GraphQL lists are plain arrays. Mutations and REST writes do not persist.

## Quick start

Base URL: `https://api.mockforge.dev`

```bash
# REST — paginated products
curl "https://api.mockforge.dev/api/products?limit=5"

# REST — one user (id is a 1-based offset)
curl "https://api.mockforge.dev/api/users/1"

# GraphQL
curl -X POST https://api.mockforge.dev/graphql \
  -H "Content-Type: application/json" \
  -d '{"query":"{ users(limit: 3) { id firstName email } }"}'
```

```javascript
const ws = new WebSocket("wss://api.mockforge.dev/ws/ticker");
ws.onmessage = (event) => console.log(JSON.parse(event.data));
```

Explore REST, GraphQL, WebSocket, and Socket.IO from the [playground](https://mockforge.dev/playground) without writing a client.

## Resources

Fourteen generated entities, plus **Custom** from the builder (15 typed resources).

| Resource | Path |
| --- | --- |
| Users | `/api/users` |
| Products | `/api/products` |
| Posts | `/api/posts` |
| Comments | `/api/comments` |
| Todos | `/api/todos` |
| Carts | `/api/carts` |
| Messages | `/api/messages` |
| Notifications | `/api/notifications` |
| Quotes | `/api/quotes` |
| Recipes | `/api/recipes` |
| Countries | `/api/countries` |
| Companies | `/api/companies` |
| Stocks | `/api/stocks` |
| Events | `/api/events` |
| Custom (builder) | `/api/custom/{slug}` |

Field catalogs live in the [REST docs](https://mockforge.dev/docs/rest).

### REST

| Verb | Path | Result |
| --- | --- | --- |
| `GET` | `/api/{entity}?limit&skip&search` | List envelope |
| `GET` | `/api/{entity}/:id` | `{ data }` |
| `GET` | `/api/{entity}/search?q=` | Same envelope |
| `POST` / `PUT` / `DELETE` | `/api/{entity}` … | Mock row only |

`limit` defaults to 30 (max 100). Dedicated search uses `q`; list endpoints also accept `search`.

### GraphQL

Same entity names as REST (`users`, `user(id)`, `createUser`, …). Args: `limit` (default 10, max 100), `skip`, `search` where supported. Custom schemas are REST-only.

### Realtime

| Protocol | Where | Streams |
| --- | --- | --- |
| WebSocket | `wss://api.mockforge.dev` | `/ws/stats`, `/ws/notifications`, `/ws/chat/{roomId}`, `/ws/ticker` |
| Socket.IO | Hosted Socket.IO origin (playground) | `/notifications`, `/chat` (`query.roomId`), `/ticker` |

Stats WebSockets expect a `pong` reply to `ping`. There is no Socket.IO `/stats` namespace.

## Custom schemas

1. Open the [schema builder](https://mockforge.dev/builder).
2. Add fields (`string`, `number`, `boolean`, `date`, `enum`, `uuid`, `email`, `url`, `image`, `array`).
3. Save — the API mints `GET /api/custom/{slug}` (list + search). Records are generated on each request.

Schema **definitions** (`POST` / `GET` / `PUT` / `DELETE` `/api/schemas`) require `X-MF-ID`. Public sample `GET`s do not.

## Identity and limits

No account. A client-generated UUID does two jobs when sent as `X-MF-ID`:

1. Owns builder schemas (the site stores it as `mf_id` in `localStorage`)
2. Raises the HTTP quota

| You send | Quota |
| --- | --- |
| `X-MF-ID` | 300 req/min |
| Nothing (IP) | 60 req/min |

Responses include `X-RateLimit-*` when the limiter is active. Over the cap: `429` with `TOO_MANY_REQUESTS` and `Retry-After: 60`. CORS is open (`*`). Socket.IO does not use `X-MF-ID`.

Copy the builder recovery key if you switch devices. Details: [Identity & rate limits](https://mockforge.dev/docs/identity).

## Who it's for

| Scenario | How you use it |
| --- | --- |
| **Frontend development** | Point the app at the origin and render against typed REST or GraphQL. |
| **Integration tests** | Hit the same paths the client uses; do not treat mutations as durable state. |
| **Protocol comparison** | Read a resource over HTTP, then subscribe to the matching live stream. |
| **Product demos** | Issue live `GET`s so the audience sees real JSON, not screenshots of fixtures. |

## Learn more

- [Getting started](https://mockforge.dev/docs/getting-started) — first requests in under a minute
- [REST reference](https://mockforge.dev/docs/rest) — envelopes, verbs, entity fields
- [GraphQL](https://mockforge.dev/docs/graphql) · [WebSockets](https://mockforge.dev/docs/websockets) · [Socket.IO](https://mockforge.dev/docs/socketio)
- [Custom schemas](https://mockforge.dev/docs/custom-schemas)

<div align="center">
  <sub>No tracking. No ads. No nonsense.</sub>
</div>
