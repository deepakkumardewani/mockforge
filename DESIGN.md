---
name: MockForge
description: High-precision mock API platform for developers. Dark-default, amber-accented, editorial typography.

colors:
  # ── Dark mode (default) ───────────────────────────────────────────
  background: "#141413"
  surface: "#141413"
  surface-raised: "#1c1c1b"
  surface-hover: "#2a2a28"
  border: "#32322f"
  border-strong: "#4a4845"
  accent: "#e8b565"
  accent-muted: "#c49645"
  on-accent: "#141413"
  text-primary: "#f2f1ef"
  text-muted: "#8f8d87"
  code-bg: "#0d0d0c"
  code-text: "#e3e2df"
  # ── Light mode overrides (.light class) ──────────────────────────
  accent-lm: "#b8832a"
  surface-lm: "#f9f9f7"
  surface-raised-lm: "#f0efe9"
  surface-hover-lm: "#e8e6df"
  border-lm: "#dddcd6"
  text-primary-lm: "#161513"
  text-muted-lm: "#63615d"
  on-accent-lm: "#161513"

typography:
  display-lg:
    fontFamily: "Bricolage Grotesque"
    fontSize: 72px
    fontWeight: "800"
    lineHeight: 76px
    letterSpacing: -0.03em
  display-md:
    fontFamily: "Bricolage Grotesque"
    fontSize: 56px
    fontWeight: "700"
    lineHeight: 60px
    letterSpacing: -0.025em
  headline-lg:
    fontFamily: "Bricolage Grotesque"
    fontSize: 36px
    fontWeight: "600"
    lineHeight: 42px
    letterSpacing: -0.02em
  headline-md:
    fontFamily: "Bricolage Grotesque"
    fontSize: 24px
    fontWeight: "600"
    lineHeight: 30px
    letterSpacing: -0.015em
  headline-sm:
    fontFamily: "Bricolage Grotesque"
    fontSize: 18px
    fontWeight: "600"
    lineHeight: 24px
    letterSpacing: -0.01em
  body-lg:
    fontFamily: "ui-sans-serif, system-ui, sans-serif"
    fontSize: 16px
    fontWeight: "400"
    lineHeight: 26px
    letterSpacing: 0em
  body-md:
    fontFamily: "ui-sans-serif, system-ui, sans-serif"
    fontSize: 14px
    fontWeight: "400"
    lineHeight: 22px
    letterSpacing: 0em
  label-sm:
    fontFamily: "ui-sans-serif, system-ui, sans-serif"
    fontSize: 11px
    fontWeight: "500"
    lineHeight: 16px
    letterSpacing: 0.06em
  mono:
    fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace"
    fontSize: 13px
    fontWeight: "400"
    lineHeight: 20px
    letterSpacing: 0em

rounded:
  sm: 0.25rem
  DEFAULT: 0.375rem
  md: 0.5rem
  lg: 0.75rem
  xl: 1rem
  full: 9999px

spacing:
  unit: 8px
  xs: 4px
  sm: 8px
  md: 16px
  lg: 24px
  xl: 40px
  2xl: 64px
  container-padding: 24px
  section-margin: 80px
  card-gap: 16px
  panel-gap: 1px

components:
  card-standard:
    backgroundColor: "{colors.surface-raised}"
    borderColor: "{colors.border}"
    borderWidth: 1px
    rounded: "{rounded.lg}"
    padding: "{spacing.lg}"
  card-hover:
    backgroundColor: "{colors.surface-hover}"
    borderColor: "{colors.accent}"
    borderWidth: 1px
    rounded: "{rounded.lg}"
  button-primary:
    backgroundColor: "{colors.accent}"
    textColor: "{colors.on-accent}"
    rounded: "{rounded.md}"
    height: 40px
    padding: 0 20px
    fontFamily: "Bricolage Grotesque"
    fontWeight: "600"
    fontSize: 14px
  button-primary-hover:
    backgroundColor: "{colors.accent-muted}"
    textColor: "{colors.on-accent}"
  button-ghost:
    backgroundColor: transparent
    textColor: "{colors.text-primary}"
    borderColor: "{colors.border}"
    borderWidth: 1px
    rounded: "{rounded.md}"
    height: 40px
    padding: 0 20px
  button-ghost-hover:
    backgroundColor: "{colors.surface-hover}"
    textColor: "{colors.accent}"
    borderColor: "{colors.accent}"
  input-field:
    backgroundColor: "{colors.surface-raised}"
    textColor: "{colors.text-primary}"
    placeholderColor: "{colors.text-muted}"
    borderColor: "{colors.border}"
    borderWidth: 1px
    rounded: "{rounded.md}"
    height: 40px
    padding: 0 12px
    fontFamily: "ui-sans-serif, system-ui, sans-serif"
    fontSize: 14px
  input-field-focus:
    borderColor: "{colors.accent}"
    boxShadow: "0 0 0 2px rgba(232, 181, 101, 0.15)"
  code-block:
    backgroundColor: "{colors.code-bg}"
    textColor: "{colors.code-text}"
    rounded: "{rounded.md}"
    padding: "{spacing.lg}"
    fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace"
    fontSize: 13px
    lineHeight: 20px
  playground-panel:
    backgroundColor: "{colors.surface-raised}"
    borderColor: "{colors.border-strong}"
    borderWidth: 1px
    rounded: "{rounded.DEFAULT}"
  label-badge:
    backgroundColor: "{colors.surface-hover}"
    textColor: "{colors.accent}"
    rounded: "{rounded.sm}"
    padding: 2px 8px
    fontSize: 11px
    fontWeight: "500"
    letterSpacing: 0.06em
    textTransform: uppercase
---

## Brand & Style

MockForge is a high-precision mock API platform built for developers — people building apps, running tests, and evaluating API shapes in a terminal-adjacent context. The design should feel like a crafted instrument, not a startup product. The brand mantra is **precise · inevitable · forged**: every element earns its place, nothing is decorative, and the amber accent carries the heat of the forge itself.

The aesthetic is dark-first, editorially typographic, and asymmetric. Oversized Bricolage Grotesque headings act as visual anchors. Amber is the only accent and is used sparingly — on active states, labels, the cursor blink, a single rule line. It is never gradient. The UI avoids every "AI slop" tell: no gradient text, no glassmorphism, no icon-in-rounded-squares, no radial glow blobs, no centered-everything card grids.

## Colors

The palette is warm near-black — not cold blue-gray like most dev tools. All surface and text values carry a hue of 65° (warm amber bias at low chroma), keeping the dark UI from feeling sterile or clinical.

**Dark mode (default):**
- `background` / `surface` (#141413) — Forged Iron. The base canvas. Near-black with a breath of warmth.
- `surface-raised` (#1c1c1b) — one tonal step up; used for cards, panels, and code areas.
- `surface-hover` (#2a2a28) — hover and selected state backgrounds throughout UI chrome.
- `border` (#32322f) — default dividers and panel edges.
- `border-strong` (#4a4845) — reinforced panel borders for the playground, where dark-mode contrast demands harder edges.
- `accent` (#e8b565) — Forge Amber. The only accent in the system. Active states, badge text, cursor blink. Never gradient, never overused.
- `accent-muted` (#c49645) — pressed and hover state for amber interactive elements.
- `on-accent` (#141413) — text placed directly on amber fills; near-black for contrast.
- `text-primary` (#f2f1ef) — main body and heading text; nearly white with warm undertone.
- `text-muted` (#8f8d87) — secondary labels, metadata, placeholder text.
- `code-bg` (#0d0d0c) — deeper-than-surface backdrop for terminal blocks and inline code regions.
- `code-text` (#e3e2df) — warm off-white on code backgrounds; slightly softer than `text-primary`.

**Light mode** (class-toggled): Surfaces flip to warm parchment tones (`surface-lm` #f9f9f7); amber deepens to `accent-lm` (#b8832a). The warm hue bias is preserved across both modes — the brand character stays consistent regardless of system preference.

## Typography

Bricolage Grotesque is the display and heading typeface — a variable-weight grotesque with editorial personality and strong geometric bones. It carries the visual weight of the MockForge brand at every heading level. All levels from `headline-sm` up use it with negative tracking, pulled progressively tighter as size increases.

System sans-serif (`ui-sans-serif, system-ui`) handles body copy and UI chrome. Deliberately unobtrusive — the user's OS font renders clearly at any size without an additional download, keeping the reading experience fast and platform-native.

Monospace (`ui-monospace, SFMono-Regular, Menlo`) is used exclusively for code: request URLs, response bodies, JSON previews, endpoint paths. 13px / 20px provides comfortable reading at terminal density.

Type scale roles:
- `display-lg` / `display-md` — hero headlines and major landing-page anchors. Maximum weight, tightest tracking.
- `headline-lg` — section leads, feature titles, large panel headers.
- `headline-md` — subsection headings, dialog titles, tab group labels.
- `headline-sm` — card titles, sidebar section labels, feature callout heads.
- `body-lg` — primary reading text, feature descriptions.
- `body-md` — UI labels, form instructions, dense content areas.
- `label-sm` — uppercase-tracked microtext: status badges, method labels (GET / POST), protocol identifiers. The 0.06em letter-spacing is a deliberate visual anchor that breaks up dense UI without requiring color.
- `mono` — all code, endpoint paths, JSON keys, shell commands.

## Layout & Spacing

The base unit is 8px. All spacing tokens are multiples: xs(4), sm(8), md(16), lg(24), xl(40), 2xl(64). Container padding is 24px — tight enough to feel intentional on smaller viewports, spacious at desktop widths. `section-margin` of 80px provides clear breathing room between major landing sections without appearing padded.

Layouts are **asymmetric by default** — two-column heroes, left-aligned headings with right-side code samples, anchors that break the grid with intent. Symmetric grid layouts should be reserved for content that is genuinely equivalent in weight (e.g., a protocol comparison grid). Grid layout for its own sake is an anti-pattern in this system.

The playground uses `panel-gap: 1px` — panels are separated by a single pixel rendered against the base background, creating hairline dividers without an explicit border. This gives the IDE a tight, monolithic feel.

## Elevation & Depth

Depth is expressed through **tonal layering**, not box shadows. The surface hierarchy (`background` → `surface-raised` → `surface-hover`) creates perceived elevation through lightness alone — each step is approximately 4–6 OKLCH lightness units apart, subtle enough not to fragment the palette but distinct enough to read at a glance.

In the playground, `border-strong` provides additional visual separation between panels when tonal contrast alone is insufficient (dark-mode scope override). Shadows are reserved for truly floating UI — dropdowns, tooltips, command palettes — where a soft `rgba(0, 0, 0, 0.5)` drop shadow conveys real float above the canvas. There is no glassmorphism. Blur-based depth conflicts with the "forged, solid, precise" character of the brand.

## Shapes

Corner radii are minimal — this is a precision tool, not a consumer app. The scale peaks at `xl` (1rem) and that ceiling is rarely reached in practice.

- `sm` (0.25rem / 4px) — inline code chips, small badges, tight UI atoms.
- `DEFAULT` (0.375rem / 6px) — playground panel rounding, compact interactive elements.
- `md` (0.5rem / 8px) — standard buttons, input fields, standard content cards.
- `lg` (0.75rem / 12px) — primary content cards, dialog containers.
- `xl` (1rem / 16px) — large feature cards on the landing page.
- `full` (9999px) — pill badges, HTTP method labels (GET/POST/PUT/DELETE), fully circular icon buttons.

Sharp but not harsh — the corners carry just enough radius to feel crafted without appearing consumer or rounded-for-rounded's-sake.

## Components

**`card-standard`** — The default content container. `surface-raised` background with a 1px `border` edge and `lg` rounding. On hover (`card-hover`), the background lifts to `surface-hover` and the border gains an amber tint — a quiet acknowledgment without animation noise.

**`button-primary`** — Amber fill (`accent`), dark text (`on-accent`), 40px height, `md` rounding. Bricolage Grotesque at 14px/600 for label weight. The only button that uses the accent fill; reserved for the single primary CTA per view. Never stacked alongside other amber elements.

**`button-ghost`** — Transparent with a `border` edge. On hover: background lifts to `surface-hover` and text + border shift to amber. This is the workhorse for secondary actions throughout the playground, dashboard, and navigation.

**`input-field`** — `surface-raised` background, 40px height, `md` rounding. On focus: border shifts to `accent` with a soft amber glow ring at 2px spread. Never uses a filled or heavily shadow-based focus state — the amber ring is sufficient.

**`code-block`** — Deepest surface (`code-bg`), warm off-white text (`code-text`), `md` rounding, `lg` padding. Monospace font at 13px/20px. Used for request/response bodies, JSON previews, snippet displays, and terminal output sections.

**`playground-panel`** — `surface-raised` background with `border-strong` edges and minimal `DEFAULT` rounding. Panels are separated by 1px gaps rendered in the base background color, creating hairline dividers without explicit border elements. Focus rings inside the playground scope use a 2px surface offset + 2px amber ring.

**`label-badge`** — `surface-hover` background, amber text, uppercase small tracking (0.06em). Used for HTTP method labels (GET, POST, PUT, DELETE), protocol indicators (REST, GraphQL, Socket.IO), and status tags. Pill variant via `full` rounding for method chips; `sm` rounding for rectangular status badges.
