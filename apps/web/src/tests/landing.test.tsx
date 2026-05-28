import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";

vi.mock("gsap", () => ({
  default: {
    registerPlugin: vi.fn(),
    context: vi.fn(() => ({ revert: vi.fn() })),
    timeline: vi.fn(() => ({
      fromTo: vi.fn().mockReturnThis(),
    })),
    fromTo: vi.fn(),
    to: vi.fn((_target, vars) => {
      vars?.onComplete?.();
    }),
    getProperty: vi.fn(() => 0),
  },
}));

vi.mock("gsap/ScrollTrigger", () => ({
  ScrollTrigger: {},
  default: {},
}));

vi.mock("next/link", () => ({
  default: ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  ),
}));

vi.mock("@/hooks/use-ws-stats", () => ({
  useWsStats: () => null,
}));

beforeEach(() => {
  vi.clearAllMocks();
});

describe("Hero", () => {
  it("renders headline and CTAs", async () => {
    const { Hero } = await import("@/components/landing/Hero");
    render(<Hero />);
    expect(screen.getByLabelText("Fake Data. Real Power.")).toBeInTheDocument();
    expect(screen.getByText("Fake")).toBeInTheDocument();
    expect(screen.getByText("Power.")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Open Playground" })).toHaveAttribute(
      "href",
      "/playground",
    );
    expect(screen.getByRole("link", { name: "Read the Docs" })).toHaveAttribute("href", "/docs");
  });

  it("has exactly two CTAs with no builder link", async () => {
    const { Hero } = await import("@/components/landing/Hero");
    render(<Hero />);
    expect(screen.queryByRole("link", { name: /builder/i })).not.toBeInTheDocument();
    expect(screen.getAllByRole("link")).toHaveLength(2);
  });
});

describe("ProtocolShowcase", () => {
  it("renders all four protocol cards", async () => {
    const { ProtocolShowcase } = await import("@/components/landing/ProtocolShowcase");
    render(<ProtocolShowcase />);
    expect(
      screen.getByRole("heading", { name: "Pick your wire format", level: 2 }),
    ).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "REST", level: 3 })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "GraphQL", level: 3 })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "WebSocket", level: 3 })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Socket.io", level: 3 })).toBeInTheDocument();
  });
});

describe("EntityBrowser", () => {
  it("renders all 14 entity cards", async () => {
    const { EntityBrowser } = await import("@/components/landing/EntityBrowser");
    render(<EntityBrowser />);
    expect(
      screen.getByRole("heading", { name: "14 typed resources", level: 2 }),
    ).toBeInTheDocument();
    expect(screen.getByText("User")).toBeInTheDocument();
    expect(screen.getByText("Product")).toBeInTheDocument();
    expect(screen.getByText("Post")).toBeInTheDocument();
    expect(screen.getByText("Comment")).toBeInTheDocument();
    expect(screen.getByText("Todo")).toBeInTheDocument();
    expect(screen.getByText("Cart")).toBeInTheDocument();
    expect(screen.getByText("Message")).toBeInTheDocument();
    expect(screen.getByText("Notification")).toBeInTheDocument();
    expect(screen.getByText("Quote")).toBeInTheDocument();
    expect(screen.getByText("Recipe")).toBeInTheDocument();
    expect(screen.getByText("Country")).toBeInTheDocument();
    expect(screen.getByText("Company")).toBeInTheDocument();
    expect(screen.getByText("Stock")).toBeInTheDocument();
    expect(screen.getByText("Event")).toBeInTheDocument();
  });
});

describe("LiveCounter", () => {
  it("renders counter text", async () => {
    const { LiveCounter } = await import("@/components/landing/LiveCounter");
    render(<LiveCounter />);
    expect(screen.getByText("Live stats")).toBeInTheDocument();
  });
});

describe("DXHighlights", () => {
  it("renders all three tabs", async () => {
    const { DXHighlights } = await import("@/components/landing/DXHighlights");
    render(<DXHighlights />);
    expect(screen.getByText("JavaScript")).toBeInTheDocument();
    expect(screen.getByText("Python")).toBeInTheDocument();
    expect(screen.getByText("cURL")).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "Wire it in minutes", level: 2 }),
    ).toBeInTheDocument();
  });

  it("switches tabs and shows distinct code sample", async () => {
    const { DXHighlights } = await import("@/components/landing/DXHighlights");
    render(<DXHighlights />);
    expect(screen.getByText(/Create a user via REST/i)).toBeInTheDocument();
    fireEvent.click(screen.getByRole("tab", { name: "Python" }));
    expect(screen.getByText(/import requests/i)).toBeInTheDocument();
  });
});

describe("FinalCTA", () => {
  it("renders closing CTA with playground link", async () => {
    const { FinalCTA } = await import("@/components/landing/FinalCTA");
    render(<FinalCTA />);
    expect(screen.getByRole("heading", { name: /stop stubbing/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /open the playground/i })).toHaveAttribute(
      "href",
      "/playground",
    );
  });
});

describe("Footer", () => {
  it("renders links", async () => {
    const { Footer } = await import("@/components/landing/Footer");
    render(<Footer />);
    expect(screen.getByRole("link", { name: "Documentation" })).toBeInTheDocument();
    expect(screen.getByText("GitHub")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Schema Builder" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Playground" })).toHaveAttribute("href", "/playground");
  });
});

describe("Nav", () => {
  it("renders the brand mark", async () => {
    const { Nav } = await import("@/components/landing/Nav");
    render(<Nav />);
    expect(screen.getByText("MockForge")).toBeInTheDocument();
  });

  it("renders all navigation links with correct hrefs", async () => {
    const { Nav } = await import("@/components/landing/Nav");
    render(<Nav />);
    // getAllByRole because links appear in both desktop and mobile menus
    const docsLinks = screen.getAllByRole("link", { name: "Docs" });
    expect(docsLinks[0]).toHaveAttribute("href", "/docs");
    const playgroundLinks = screen.getAllByRole("link", { name: "Playground" });
    expect(playgroundLinks[0]).toHaveAttribute("href", "/playground");
    const builderLinks = screen.getAllByRole("link", { name: "Builder" });
    expect(builderLinks[0]).toHaveAttribute("href", "/builder");
  });

  it("does not render a Get Started CTA", async () => {
    const { Nav } = await import("@/components/landing/Nav");
    render(<Nav />);
    expect(screen.queryByRole("link", { name: /get started/i })).not.toBeInTheDocument();
  });

  it("toggles mobile menu on hamburger click", async () => {
    const { Nav } = await import("@/components/landing/Nav");
    render(<Nav />);
    const hamburger = screen.getByRole("button", { name: /toggle navigation menu/i });
    expect(hamburger).toBeInTheDocument();
    // Mobile menu items exist in DOM but may be hidden via CSS — verify toggle behavior
    fireEvent.click(hamburger);
    expect(hamburger).toHaveAttribute("aria-expanded", "true");
    fireEvent.click(hamburger);
    expect(hamburger).toHaveAttribute("aria-expanded", "false");
  });
});

describe("landing copy deduplication", () => {
  const VALUE_PROP_PHRASES = [
    "no signup",
    "no api keys",
    "zero setup",
    "no setup",
    "no tokens",
    "real-shaped",
    "open the playground and point",
  ] as const;

  async function collectSectionText(
    importFn: () => Promise<{ [key: string]: React.ComponentType }>,
    exportName: string,
  ): Promise<string> {
    const mod = await importFn();
    const Component = mod[exportName];
    const { container } = render(<Component />);
    return container.textContent ?? "";
  }

  it("does not repeat value-prop phrases across marketing sections", async () => {
    const sections = await Promise.all([
      collectSectionText(() => import("@/components/landing/Hero"), "Hero"),
      collectSectionText(() => import("@/components/landing/LiveDemo"), "LiveDemo"),
      collectSectionText(() => import("@/components/landing/ProtocolShowcase"), "ProtocolShowcase"),
      collectSectionText(() => import("@/components/landing/EntityBrowser"), "EntityBrowser"),
      collectSectionText(() => import("@/components/landing/LiveCounter"), "LiveCounter"),
      collectSectionText(() => import("@/components/landing/DXHighlights"), "DXHighlights"),
      collectSectionText(() => import("@/components/landing/FinalCTA"), "FinalCTA"),
      collectSectionText(() => import("@/components/landing/Footer"), "Footer"),
    ]);

    for (const phrase of VALUE_PROP_PHRASES) {
      const matches = sections.filter((text) => text.toLowerCase().includes(phrase));
      expect(matches.length).toBeLessThanOrEqual(1);
    }
  });
});

describe("page metadata", () => {
  it("has updated title, description, and OG tags", async () => {
    const { siteMetadata } = await import("@/lib/site-metadata");
    expect(siteMetadata.title).toBe("MockForge — Fake Data API for Local Dev");
    expect(siteMetadata.description).toMatch(/14 typed resources/i);
    expect(siteMetadata.openGraph?.title).toBe("MockForge — Fake Data API for Local Dev");
    expect(siteMetadata.twitter?.title).toBe("MockForge — Fake Data API for Local Dev");
  });
});
