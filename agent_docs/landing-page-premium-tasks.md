# Implementation Plan: Landing Page Premium Rework

> Confirmed via interview (2026-05-28). Goal: re-compose the existing landing
> page into a "world-class dev tool" surface. The technical bones are good
> (Next 15 / React 19 / Tailwind v4 / GSAP + OKLCH token system) — the gap is
> **composition, hierarchy, copy, and polish**, not the stack.

## Overview

The current landing page (`apps/web/src/app/page.tsx`) renders six sections:
Hero → ProtocolShowcase → EntityBrowser → LiveCounter → DXHighlights → Footer.
It reads "templated / cheap" on four axes the user flagged: **weak hero, flat
hierarchy/spacing, generic copy, and missing polish details**. This plan keeps
the brand identity and most sections, but rebuilds the composition around one
real "wow" moment, adds the missing structural pieces (nav, final CTA), and
runs a craft pass over type, spacing, motion, and copy.

## Confirmed Intent

- **Outcome:** Premium, world-class landing page — fix all four cheap signals.
- **User:** Developers evaluating MockForge in the first ~10 seconds.
- **Success:** Confident hero + one real wow (live interactive demo + elevated
  live counter); strong vertical rhythm; sharp, dedup'd, opinionated copy;
  premium micro-details. Restrained, precise motion.
- **Constraint:** ZERO fabrication — no fake stars/logos/testimonials/metrics.
  Credibility comes from craft + the REAL live WS counter + the REAL embedded
  playground demo. Motion is restrained/precise — **no WebGL shaders**.
- **Out of scope:** WebGL shaders; fabricated social proof; new backend
  features; redesigning `/docs`, `/playground`, `/builder` internals; changing
  the core amber/OKLCH brand identity.

## Architecture Decisions

- **Reuse the token system.** All new work consumes existing CSS variables in
  `apps/web/src/app/globals.css` (`--color-accent`, `--color-surface*`,
  `--color-text-*`, `--font-display`). No new color system, no hardcoded hex.
- **Premium = restraint.** Motion direction is Linear/Vercel/Stripe-grade:
  fast (200–400ms) scroll reveals, micro-interactions on hover, the live
  counter as the single continuously "alive" element. Keep GSAP + ScrollTrigger
  (already a dependency); honor `prefers-reduced-motion`.
- **Wow without fabrication.** The hero/demo "wow" is a REAL request against the
  running mock API (reuse playground catalogue/presets where possible), not a
  scripted fake. The live counter is the proof-of-life anchor.
- **No new heavy deps.** Stay within the current stack (gsap, tailwind v4,
  react 19). Do not add WebGL/three.js/framer-motion.
- **Section components stay isolated** under
  `apps/web/src/components/landing/`. Extract shared motion helpers rather than
  duplicating GSAP boilerplate (DRY — it currently repeats in every section).

---

## Task List

### Phase 1: Foundation (craft layer everything else builds on)

#### Task 1: Shared landing primitives — motion + layout rhythm

**Description:** Extract the repeated GSAP reveal boilerplate (currently
duplicated across Hero/ProtocolShowcase/EntityBrowser/LiveCounter/DXHighlights)
into a single reusable hook/util, and add a `prefers-reduced-motion` guard.
Establish shared layout/spacing primitives (section padding scale, max-width,
eyebrow/heading rhythm) so sections stop feeling evenly-weighted. No visual
rebuild yet — this is the substrate.

**Acceptance criteria:**
- [x] A `useRevealOnScroll` (or equivalent) helper exists under
  `apps/web/src/components/landing/` and is consumed by ≥2 sections.
- [x] All reveal animations no-op when `prefers-reduced-motion: reduce` is set.
- [x] A shared section wrapper / spacing scale removes ad-hoc per-section padding
  duplication.

**Verification:**
- [x] `bun run typecheck` passes.
- [x] `bun run lint` passes.
- [ ] Manual: toggle OS "reduce motion" — page renders fully with no animation.

**Dependencies:** None
**Files likely touched:**
- `apps/web/src/components/landing/useRevealOnScroll.ts` (new)
- `apps/web/src/components/landing/Section.tsx` (new, optional)
- `apps/web/src/app/globals.css`
**Estimated scope:** S

#### Task 2: Sticky navigation bar

**Description:** Add the currently-missing top navigation — a key polish gap.
Sticky, transparent-on-hero then solid-on-scroll, with brand mark, primary
links (Docs, Playground, Builder, GitHub) and a primary CTA. Mobile-collapsible.

**Acceptance criteria:**
- [x] `Nav` renders at the top of `page.tsx` above `Hero`.
- [x] Becomes opaque/bordered after scrolling past the hero fold.
- [x] Links resolve to `/docs`, `/playground`, `/builder`, GitHub; usable on mobile.
- [x] Keyboard-focusable with visible focus rings (reuse existing ring tokens).

**Verification:**
- [x] `bun run typecheck` / `bun run lint` pass.
- [ ] Manual: scroll past hero → nav state changes; tab through links; resize to mobile.

**Dependencies:** Task 1
**Files likely touched:**
- `apps/web/src/components/landing/Nav.tsx` (new)
- `apps/web/src/app/page.tsx`
**Estimated scope:** S

### Checkpoint: Foundation
- [x] `bun run verify` (lint + format + typecheck) clean
- [x] Page builds and renders with nav; reduced-motion respected

---

### Phase 2: Hero + the one "wow" moment

#### Task 3: Hero rework — composition, hierarchy, ambient motion

**Description:** Rebuild the hero composition (not the brand). Strengthen the
headline/sub/CTA hierarchy, tighten the eyebrow→headline→sub→CTA→proof rhythm,
refine the terminal panel, and replace the static mesh blobs with quiet ambient
motion (slow gradient drift and/or faint animated grid) — restrained, no shader.
Reduce the CTA set to one primary + one secondary (currently three competing CTAs).

**Acceptance criteria:**
- [x] Single clear primary CTA + one secondary; no three-way CTA tie.
- [x] Headline/typography hierarchy visibly stronger (scale, weight, leading).
- [x] Ambient background motion is subtle, GPU-cheap, and reduced-motion-safe.
- [x] First viewport reads as a confident, premium hero on desktop + mobile.

**Verification:**
- [x] `bun run typecheck` / `bun run lint` pass.
- [x] Manual: hero fold looks premium at 1440px and 390px widths; no layout shift.
- [ ] Lighthouse: no regression vs current landing (perf budget intact).

**Dependencies:** Task 1
**Files likely touched:**
- `apps/web/src/components/landing/Hero.tsx`
- `apps/web/src/app/globals.css`
**Estimated scope:** M

#### Task 4: Live interactive demo section (the real wow)

**Description:** Add a section that lets the visitor fire a REAL request against
the running mock API and see the real JSON response inline — the credibility
centerpiece. Reuse playground catalogue/presets/response-viewer pieces where
practical (do NOT rebuild the playground). Pre-filled example + one-click run.

**Acceptance criteria:**
- [x] Visitor can trigger ≥1 real API call from the landing page and see the
  real response rendered.
- [x] Reuses existing playground/shared utilities rather than duplicating logic.
- [x] Graceful loading + error states (no silent failures; no fake data shown).

**Verification:**
- [x] `bun run typecheck` / `bun run lint` pass.
- [x] Manual: click run → real response appears; disconnect API → error state shows.

**Dependencies:** Task 1
**Files likely touched:**
- `apps/web/src/components/landing/LiveDemo.tsx` (new)
- `apps/web/src/components/playground/shared/*` (import only)
- `apps/web/src/app/page.tsx`
**Estimated scope:** M

### Checkpoint: Hero + Wow
- [x] `bun run verify` clean
- [x] First-10-seconds test: hero + live demo feel premium and prove the product is real

---

### Phase 3: Supporting sections (refine, don't rebuild)

#### Task 5: ProtocolShowcase — hierarchy + copy refine

**Description:** Refine the 2×2 bento (spacing, hover, sample-code framing) and
sharpen per-protocol copy so it's opinionated and non-duplicative with the hero.

**Acceptance criteria:**
- [x] Copy is distinct from Hero/DXHighlights (no repeated phrases).
- [x] Cards have refined hover/active states and consistent internal rhythm.

**Verification:** [x] `bun run typecheck` / `bun run lint` pass; manual hover/responsive check.
**Dependencies:** Task 1
**Files likely touched:** `apps/web/src/components/landing/ProtocolShowcase.tsx`
**Estimated scope:** S

#### Task 6: EntityBrowser — polish + density

**Description:** Improve the 14-entity grid: better card craft, hover, and
optional search/filter affordance; ensure it complements (not competes with)
the live demo.

**Acceptance criteria:**
- [x] Grid reads as polished and scannable at all breakpoints.
- [x] Copy does not duplicate the demo/protocol sections.

**Verification:** [x] `bun run typecheck` / `bun run lint` pass; manual responsive check.
**Dependencies:** Task 1
**Files likely touched:** `apps/web/src/components/landing/EntityBrowser.tsx`
**Estimated scope:** S

#### Task 7: LiveCounter — elevate as proof-of-life anchor

**Description:** Promote the real WS request counter into a deliberate, premium
"it's running right now" moment — stronger typographic treatment and framing,
keeping the real data source untouched.

**Acceptance criteria:**
- [x] Counter is visually a centerpiece, not a footnote.
- [x] Still driven by the real WS stat source; loading state remains graceful.

**Verification:** [x] `bun run typecheck` / `bun run lint` pass; manual: counter ticks live.
**Dependencies:** Task 1
**Files likely touched:** `apps/web/src/components/landing/LiveCounter.tsx`
**Estimated scope:** S

#### Task 8: DXHighlights (Quick start) — refine

**Description:** Tighten the copy-paste code-tabs section; ensure copy and code
samples don't duplicate the hero terminal or the live demo.

**Acceptance criteria:**
- [x] No content overlap with Hero/LiveDemo; tab interaction feels crisp.

**Verification:** [x] `bun run typecheck` / `bun run lint` pass; manual copy-button check.
**Dependencies:** Task 1
**Files likely touched:** `apps/web/src/components/landing/DXHighlights.tsx`
**Estimated scope:** S

#### Task 9: Final CTA section (new)

**Description:** Add a decisive closing CTA section before the footer — one
strong line + primary action, restating the value without repeating earlier copy.

**Acceptance criteria:**
- [x] A distinct closing CTA exists between the last content section and Footer.
- [x] Copy is non-duplicative and ends the page with momentum.

**Verification:** [x] `bun run typecheck` / `bun run lint` pass; manual visual check.
**Dependencies:** Task 1
**Files likely touched:**
- `apps/web/src/components/landing/FinalCTA.tsx` (new)
- `apps/web/src/app/page.tsx`
**Estimated scope:** S

#### Task 10: Footer — refine

**Description:** Polish footer spacing/typography to match the elevated page;
keep existing real links only.

**Acceptance criteria:**
- [x] Footer visually consistent with the new craft level; only real links remain.

**Verification:** [x] `bun run typecheck` / `bun run lint` pass; manual visual check.
**Dependencies:** Task 1
**Files likely touched:** `apps/web/src/components/landing/Footer.tsx`
**Estimated scope:** XS

### Checkpoint: Sections
- [x] `bun run verify` clean
- [x] Full-page scroll has clear rhythm; every section feels deliberate

---

### Phase 4: Cross-cutting polish & QA

#### Task 11: Copy pass — sharpen + de-duplicate (whole page)

**Description:** Single editorial pass across all sections + nav + metadata:
remove repeated phrases ("build fast", "zero setup", "no signup" appear in
multiple places), sharpen to opinionated dev-tooling voice, and update page
`<title>`/meta. No fabricated claims.

**Acceptance criteria:**
- [ ] No phrase/value-prop is repeated across sections.
- [ ] Voice is sharp and domain-credible; zero fabricated metrics/claims.
- [ ] Page metadata (title/description/OG) updated.

**Verification:** `bun run typecheck` / `bun run lint` pass; manual read-through; grep for duplicate phrases.
**Dependencies:** Tasks 2–10
**Files likely touched:**
- `apps/web/src/components/landing/*`
- `apps/web/src/app/layout.tsx` (metadata)
**Estimated scope:** S

#### Task 12: Motion / responsive / a11y / perf QA

**Description:** Final verification sweep: responsive (390 / 768 / 1440), reduced-
motion, keyboard nav + focus order, color contrast on accent fills, and a
Lighthouse check to confirm no perf regression from added motion/demo.

**Acceptance criteria:**
- [ ] Layout holds at mobile/tablet/desktop with no overflow or shift.
- [ ] Reduced-motion fully static; keyboard reaches all interactive elements.
- [ ] Lighthouse perf/a11y not regressed vs the pre-rework landing baseline.

**Verification:**
- [ ] `bun run verify` clean.
- [ ] `bun run test` (web vitest) passes; existing e2e unaffected.
- [ ] Manual Lighthouse + axe pass on `/`.
**Dependencies:** Tasks 2–11
**Files likely touched:** any landing component as needed
**Estimated scope:** S

### Checkpoint: Complete
- [ ] All acceptance criteria met
- [ ] `bun run verify` + `bun run test` green
- [ ] Manual first-10-seconds test passes; ready for review

---

## Risks and Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| Live demo (Task 4) couples landing to playground internals | Med | Import shared utils only; isolate in `LiveDemo.tsx`; graceful error state if API down |
| Added ambient motion hurts perf / feels "AI generic" | Med | GPU-cheap CSS/GSAP only, no WebGL; reduced-motion guard; Lighthouse gate in Task 12 |
| Copy still reads generic after rewrite | Med | Dedicated editorial pass (Task 11); grep for repeated phrases; opinionated voice |
| Scope creep into playground/docs redesign | Low | Explicitly out of scope; sections refined, not rebuilt |

## Open Questions

- Should the live demo (Task 4) default to REST, or auto-rotate protocols? (Decide at Task 4.)
- Final CTA (Task 9) destination — `/playground` vs `/docs`? (Decide at Task 9.)
