# Implementation Plan: GraphQL write parity with REST

## Overview

Add typed Pothos mutations for each standard REST fake-data resource so `/graphql` exposes create/update/delete semantics aligned with [`apps/api/src/routes/rest/`](apps/api/src/routes/rest/). Generators and GraphQL object types already exist; work centers on resolver wiring, optional merge helpers, and integration tests.

**Specification:** [`graphql-rest-mutations-parity-spec.md`](graphql-rest-mutations-parity-spec.md)

## Architecture Decisions

| Decision | Rationale |
|----------|-----------|
| Explicit mutations per resource | Preserves introspection, codegen, and field-level docs vs one generic JSON mutation. |
| Match REST shallow-merge semantics | Avoids behavioral drift between transports for the same mock API. |
| Exclude `/rest/custom` | Custom schemas are dynamic; parity is undefined without separate design. |
| Optional shared merge helper after duplication observed | Keeps early slices small; extract to `apps/api/src/lib/` when copy-paste stabilizes. |

## Dependency Graph

```text
DeletePayload type (if needed)
        │
        ├── Mutation modules (tier1 / tier2 groups)
        │         │
        │         └── graphql/index.ts imports
        │
        └── graphql.integration.test.ts
```

## Task List

### Phase 1: Foundation

- [ ] **Task 1: Inventory REST ↔ generator ↔ GraphQL type**

**Description:** Confirm each REST router (excluding `custom`) maps to `generate*` and an existing Pothos object type; note any generator signature quirks (e.g. `order`).

**Acceptance criteria:**

- [ ] Table or bullet list in PR description (or inline commit message) enumerates 14 resources: users, products, posts, comments, todos, carts, messages, notifications, quotes, recipes, countries, companies, stocks, events.
- [ ] Each resource names `generate*` module and GraphQL type string (e.g. `User`).

**Verification:**

- [ ] Manual: spot-check one router file and matching `types/tier1.ts` or `types/tier2.ts` entry.

**Dependencies:** None

**Files likely touched:** None required (documentation only); optional comment in spec if gaps found.

**Estimated scope:** Small

---

- [ ] **Task 2: Delete result type + naming convention**

**Description:** Introduce a small Pothos object (e.g. `DeleteResult`) with `deleted: Boolean!` and `id: String!` for delete mutations, unless an existing type is reused. Document mutation prefix pattern `create*` / `update*` / `delete*`.

**Acceptance criteria:**

- [ ] Schema exposes a single reusable delete payload type for all `delete*` mutations.
- [ ] `createPost` / `updateTodo` behavior unchanged for existing callers.

**Verification:**

- [ ] `cd apps/api && bun run build`

**Dependencies:** Task 1

**Files likely touched:**

- `apps/api/src/routes/graphql/types/tier1.ts` or `tier2.ts` (or tiny `types/delete-result.ts` imported from `index.ts` flow — follow local convention)

**Estimated scope:** Small

---

### Phase 2: Core — Tier 1 entities

- [ ] **Task 3: Mutations for tier1-aligned REST resources**

**Description:** Implement create/update/delete for `users`, `products`, `comments`, `carts` (and extend posts/todos coverage: add missing verbs alongside existing `createPost` / `updateTodo` **without breaking** prior shapes). Use generator defaults matching REST (`limit: 1`, `skip: 0`, `order: "asc"`).

**Acceptance criteria:**

- [ ] Each listed resource has GraphQL mutations equivalent to REST POST/PUT/DELETE semantics.
- [ ] Resolvers shallow-merge explicit args or input objects consistent with REST JSON body merge.

**Verification:**

- [ ] `cd apps/api && bun run build`
- [ ] `cd apps/api && bun run test`

**Dependencies:** Task 2

**Files likely touched:**

- `apps/api/src/routes/graphql/mutations/*.ts` (new file(s) or extensions)
- `apps/api/src/routes/graphql/index.ts` (imports)

**Estimated scope:** Medium

---

### Phase 3: Core — Tier 2 entities

- [ ] **Task 4: Mutations for tier2 REST resources**

**Description:** Implement create/update/delete for `messages`, `notifications`, `quotes`, `recipes`, `countries`, `companies`, `stocks`, `events` mirroring REST.

**Acceptance criteria:**

- [ ] All eight resources expose the three verbs where REST does.
- [ ] Nested shapes (e.g. recipe ingredients) follow shallow-merge parity with REST POST/PUT only — document inline if GraphQL requires scalar/list inputs.

**Verification:**

- [ ] `cd apps/api && bun run build`

**Dependencies:** Task 3

**Files likely touched:**

- `apps/api/src/routes/graphql/mutations/*.ts`
- `apps/api/src/routes/graphql/index.ts`

**Estimated scope:** Medium

---

### Phase 4: Verification & optional deduplication

- [ ] **Task 5: Integration tests**

**Description:** Extend [`apps/api/src/routes/graphql/graphql.integration.test.ts`](apps/api/src/routes/graphql/graphql.integration.test.ts) with mutation requests covering create/update/delete patterns across at least two entities (one tier1, one tier2) plus assertion on delete payload.

**Acceptance criteria:**

- [ ] Integration tests fail if mutations disappear from schema or delete payload loses `id`.
- [ ] Merge override verified (e.g. string field differs from generator default when passed).

**Verification:**

- [ ] `cd apps/api && bun run test:integration`

**Dependencies:** Task 4

**Files likely touched:**

- `apps/api/src/routes/graphql/graphql.integration.test.ts`

**Estimated scope:** Small–Medium

---

- [ ] **Task 6 (optional): Extract merge helper for REST + GraphQL**

**Description:** If duplication across REST routers and GraphQL resolvers exceeds maintainability threshold, introduce `apps/api/src/lib/mock-merge.ts` (name illustrative) implementing “take one generated row + shallow overlay”, refactor **one** REST router + GraphQL resolver pair first as proof, then roll forward incrementally.

**Acceptance criteria:**

- [ ] No behavior change in REST responses vs main branch for refactored routes (integration or snapshot comparison).
- [ ] GraphQL mutations delegate to same helper.

**Verification:**

- [ ] `cd apps/api && bun run test:integration`
- [ ] Spot-check REST `POST`/`PUT` on refactored resource manually or via existing REST tests if present

**Dependencies:** Task 5 (can proceed in parallel only after Task 3–4 stabilize semantics)

**Files likely touched:**

- `apps/api/src/lib/*.ts`
- Selected `apps/api/src/routes/rest/*.ts`
- `apps/api/src/routes/graphql/mutations/*.ts`

**Estimated scope:** Medium — **defer** unless copy-paste burden is confirmed.

---

## Checkpoint: After Tasks 2–4

- [ ] `cd apps/api && bun run build` succeeds
- [ ] GraphiQL introspection shows new mutation fields
- [ ] No accidental removal of `createPost` / `updateTodo`

## Checkpoint: After Task 5

- [ ] `cd apps/api && bun run test:integration` passes
- [ ] PR links [`graphql-rest-mutations-parity-spec.md`](graphql-rest-mutations-parity-spec.md) success criteria

## Risks and Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| Large GraphQL SDL / introspection payload | Low | Acceptable for mock API; split mutation files only |
| Shallow merge surprises nested arrays | Medium | Match REST exactly; document; add input types later if needed |
| Drift between REST and GraphQL | Medium | Optional Task 6 helper; parity spec as reference |

## Open Questions

Same as **Open Questions** in [`graphql-rest-mutations-parity-spec.md`](graphql-rest-mutations-parity-spec.md).
