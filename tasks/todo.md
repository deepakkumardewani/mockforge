# Phase 6 — Frontend Tasks

## Task 22 — Next.js app setup (foundation)

- [x] Impl: Update globals.css with design token system (accent, surface, border, text-primary, text-muted, dark mode)
- [x] Impl: Update layout.tsx with dark mode inline script + Providers (QueryClient + ThemeToggle)
- [x] Impl: Create ThemeToggle.tsx (localStorage persistence, dark class toggle, no flash)
- [x] Impl: Create store/mf-id.ts (Zustand store for mfId)
- [x] Impl: Create hooks/use-mf-id.ts (UUID generation, localStorage persistence)
- [x] Impl: Create lib/api-client.ts (typed fetch with auto X-MF-ID header)
- [x] Impl: Create app/builder/page.tsx (minimal builder shell)
- [x] Test: All 13 web tests pass, build exits clean

## Task 23 — Hero + Protocol Showcase

- [x] Impl: Create components/landing/Hero.tsx (headline, animated terminal, CTAs, GSAP)
- [x] Impl: Create components/landing/ProtocolShowcase.tsx (4 cards with live samples, GSAP)
- [x] Test: component smoke tests pass

## Task 24 — Entity Browser + Live Counter

- [x] Impl: Create components/landing/EntityBrowser.tsx (14 entity cards grid with hover preview)
- [x] Impl: Create components/landing/LiveCounter.tsx (WebSocket counter with GSAP animation)
- [x] Impl: Create hooks/use-ws-stats.ts
- [x] Test: component smoke tests pass

## Task 25 — DX Highlights + Footer

- [x] Impl: Create components/landing/DXHighlights.tsx (3 tabs with code samples + copy button)
- [x] Impl: Create components/landing/Footer.tsx
- [x] Test: component smoke tests pass
- [x] All acceptance criteria marked complete in agent_docs/TASKS.md
