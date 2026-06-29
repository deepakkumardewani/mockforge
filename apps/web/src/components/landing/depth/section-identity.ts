/**
 * Per-section background identity variants.
 * Rule: no two consecutive landing sections may share the same `identity` value.
 *
 * Usage: pass `identity` to Section via className, e.g. `className={SECTION_IDENTITY.hero}`.
 */
export const SECTION_IDENTITY = {
  /** Default surface — Hero */
  hero: "section-identity-base",
  /** Raised tonal panel — Live Demo */
  liveDemo: "section-identity-raised",
  /** Dot texture overlay — Protocols */
  protocols: "section-identity-textured-dot",
  /** Grid texture — Capabilities */
  capabilities: "section-identity-textured-grid",
  /** Trailing accent glow — Entity Browser */
  entityBrowser: "section-identity-glow-trailing",
  /** Inset tonal panel — Live Counter */
  liveCounter: "section-identity-panel-inset",
  /** Raised tonal panel — Why MockForge */
  whyMockForge: "section-identity-raised",
  /** Dot texture — DX Highlights */
  dxHighlights: "section-identity-textured-dot",
  /** Grid texture — Use cases */
  useCases: "section-identity-textured-grid",
  /** Leading accent glow — Quickstart */
  quickstart: "section-identity-glow-leading",
  /** Base with trailing glow — Final CTA */
  finalCta: "section-identity-glow-trailing",
  /** Raised, no texture — Footer-adjacent sections */
  footerBand: "section-identity-raised",
} as const;

export type SectionIdentity = (typeof SECTION_IDENTITY)[keyof typeof SECTION_IDENTITY];

/** Ordered list for page.tsx — documents the no-adjacent-duplicates rule. */
export const LANDING_SECTION_IDENTITY_SEQUENCE: SectionIdentity[] = [
  SECTION_IDENTITY.hero,
  SECTION_IDENTITY.liveDemo,
  SECTION_IDENTITY.protocols,
  SECTION_IDENTITY.capabilities,
  SECTION_IDENTITY.entityBrowser,
  SECTION_IDENTITY.liveCounter,
  SECTION_IDENTITY.whyMockForge,
  SECTION_IDENTITY.dxHighlights,
  SECTION_IDENTITY.useCases,
  SECTION_IDENTITY.quickstart,
  SECTION_IDENTITY.finalCta,
];
