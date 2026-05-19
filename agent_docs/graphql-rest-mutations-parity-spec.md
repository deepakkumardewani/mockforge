# Spec: GraphQL write parity with REST (mock generators)

## ASSUMPTIONS I'M MAKING

1. **Scope is `apps/api` only** — extend the Pothos schema and optional shared helpers; no playground-only branching unless existing code already depends on it.
2. **Semantics match REST today** — mutations return deterministic merged entities from existing `generate*` functions plus caller-supplied fields (shallow merge), same as `POST /` and `PUT /:id`; deletes acknowledge `{ deleted, id }` style success without persistence.
3. **Typed mutations only** — we add explicit `create*` / `update*` / `delete*` fields per resource (no generic `mutation(entity: Enum, payload: JSON)`), unless product later revisits that trade-off.
4. **`/rest/custom` is out of scope** — dynamic custom schemas are not mirrored as GraphQL mutations in this phase.
5. **Naming:** camelCase mutation fields (`createUser`, `updateProduct`, `deleteTodo`) aligned with GraphQL conventions; verbs mirror REST resources under `apps/api/src/routes/rest/`.
6. **Existing mutations** (`createPost`, `updateTodo` in `mutations/tier1.ts`) remain behavior-compatible; extend or refactor only if parity requires shared helpers without breaking responses.

Correct these assumptions before implementation if any differ from intent.

---

## Objective

Expose **write operations over GraphQL** for every standard REST fake-data resource so clients using `/graphql` can perform create/update/delete flows comparable to REST, without introducing persistence beyond today’s generator merge behavior.

### Who is this for?

- Developers exercising MockForge via GraphQL clients or codegen who today only see two mutations (`createPost`, `updateTodo`).
- Maintainers who want REST and GraphQL to stay consistent as mock semantics evolve.

### Success (high level)

- Each CRUD-capable REST router listed in [`apps/api/src/routes/rest/index.ts`](apps/api/src/routes/rest/index.ts) (except `custom`) has corresponding GraphQL mutations where REST exposes POST/PUT/DELETE.
- Integration tests prove representative mutations execute and return shaped data consistent with REST merge patterns.

---

## Tech Stack

| Layer | Choice |
|-------|--------|
| Runtime | Bun |
| HTTP / REST | Hono (`apps/api/src/routes/rest/`) |
| GraphQL | graphql-yoga + Pothos (`@pothos/core`) |
| Types | `@mockforge/types` |
| Tests | Vitest (`unit` + `integration` projects in `apps/api`) |

---

## Commands

Execute from repository root unless noted.

```bash
# Install (root)
bun install

# API — typecheck
cd apps/api && bun run build

# API — unit tests
cd apps/api && bun run test

# API — integration tests (includes GraphQL route tests)
cd apps/api && bun run test:integration

# API — lint / format (optional local gate)
cd apps/api && bun run lint
cd apps/api && bun run format

# Monorepo — aggregate checks (optional)
bun run verify
```

---

## Project Structure

| Path | Role |
|------|------|
| [`apps/api/src/routes/graphql/`](apps/api/src/routes/graphql/) | Yoga mount, Pothos builder, `types/`, `queries/`, `mutations/` |
| [`apps/api/src/routes/graphql/mutations/tier1.ts`](apps/api/src/routes/graphql/mutations/tier1.ts) | Existing demo mutations (`createPost`, `updateTodo`) |
| [`apps/api/src/data/generators/*.ts`](apps/api/src/data/generators/) | Fake entity generators consumed by REST and GraphQL |
| [`apps/api/src/routes/rest/*.ts`](apps/api/src/routes/rest/) | Reference behavior for POST/PUT/DELETE merge semantics |
| [`apps/api/src/routes/graphql/graphql.integration.test.ts`](apps/api/src/routes/graphql/graphql.integration.test.ts) | GraphQL HTTP integration tests |

---

## Code Style

- Register mutations by importing side-effect modules from [`apps/api/src/routes/graphql/index.ts`](apps/api/src/routes/graphql/index.ts) (same pattern as queries/types).
- Prefer **small mutation modules** (e.g. split by tier or resource group) over one enormous file once field count grows.
- Resolver bodies stay thin: call generator with fixed params (`limit: 1`, `skip: 0`, `order: "asc"` unless REST uses otherwise), shallow-merge inputs — mirror REST handlers.

Example shape (illustrative — actual args/types follow each entity):

```typescript
builder.mutationType({
  fields: (t) => ({
    createUser: t.field({
      type: "User",
      args: {
        // Optional inputs mirror JSON body keys REST accepts via spread merge
        firstName: t.arg.string(),
      },
      resolve: (_root, args) => {
        const base = generateUsers({ limit: 1, skip: 0, order: "asc" })[0]!;
        return { ...base, ...pickDefined(args) };
      },
    }),
  }),
});
```

Naming: mutation fields **camelCase**; types already registered on builder (`User`, `Product`, …). Extract `pickDefined` / merge helpers to `apps/api/src/lib/` only when duplication hurts readability.

---

## Testing Strategy

| Level | Framework | Location |
|-------|-------------|----------|
| Integration | Vitest + HTTP client against mounted app | `apps/api/src/routes/graphql/graphql.integration.test.ts` |
| Unit | Vitest | `apps/api` unit project (`*.unit.test.ts`) |

**Expectations**

- Add integration coverage that executes GraphQL mutations for a **representative subset** of entities (at minimum one tier1 + one tier2 + delete payload shape), asserting stable keys and merge behavior (e.g. title override).
- Run `cd apps/api && bun run test:integration` before merge.

Full matrix testing every mutation is optional if cost is high; prioritize correctness of shared merge/delete patterns and spot-check entities.

---

## Boundaries

### Always do

- Mirror REST merge semantics for POST/PUT-equivalent mutations unless spec explicitly documents an intentional divergence.
- Keep schema additive for consumers (new fields/mutations); avoid removing or renaming `createPost` / `updateTodo` without deprecation discussion.
- Run API integration tests after substantive schema changes.

### Ask first

- Introducing a GraphQL `JSON` scalar / generic catch-all mutation.
- Refactoring REST routes to depend on new shared helpers (coordinate with reviewers).
- Adding dependencies beyond existing GraphQL/Pothos stack.

### Never do

- Persist mutations to Redis or disk as part of this feature (out of scope).
- Commit secrets or environment-specific URLs into specs.

---

## Success Criteria

1. **Coverage:** GraphQL exposes create/update/delete (where REST does) for `users`, `products`, `posts`, `comments`, `todos`, `carts`, `messages`, `notifications`, `quotes`, `recipes`, `countries`, `companies`, `stocks`, `events`.
2. **Semantics:** Create/update resolvers use the same generator + shallow-merge approach as sibling REST routers; delete operations return a clear GraphQL type (e.g. `deleted: Boolean!`, `id: String!`) equivalent to REST `{ deleted, id }`.
3. **Registration:** New mutation modules are imported from [`apps/api/src/routes/graphql/index.ts`](apps/api/src/routes/graphql/index.ts); `builder.toSchema()` includes all fields.
4. **Verification:** `cd apps/api && bun run test:integration` passes with new assertions for mutation execution.
5. **Documentation:** This spec + [`graphql-rest-mutations-parity-tasks.md`](graphql-rest-mutations-parity-tasks.md) describe tasks and acceptance; PR references this spec section.

---

## Open Questions

1. Should **`createPost` / `updateTodo`** be moved into a dedicated “parity” module for clarity, or left in `tier1.ts` with new mutations elsewhere?
2. For **nested objects** (e.g. cart `products`, recipe `ingredients`), is shallow merge via GraphQL scalar/list inputs sufficient, or do we introduce input object types per entity?
3. Do we need **globally unique mutation names** audit against future third-party schema merges (unlikely short-term)?
