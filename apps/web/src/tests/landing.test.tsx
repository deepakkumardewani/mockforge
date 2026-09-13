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

vi.mock("next/navigation", () => ({
  usePathname: () => "/",
}));

beforeEach(() => {
  vi.clearAllMocks();
});

describe("Hero", () => {
  it("renders headline and CTAs", async () => {
    const { Hero } = await import("@/components/landing/Hero");
    render(<Hero />);
    expect(
      screen.getByLabelText("Build your app before the backend is ready."),
    ).toBeInTheDocument();
    expect(screen.getByText("Build")).toBeInTheDocument();
    expect(screen.getByText("ready.")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Explore in Playground" })).toHaveAttribute(
      "href",
      "/playground",
    );
    expect(screen.getByRole("link", { name: "Use the API" })).toHaveAttribute(
      "href",
      "#integration",
    );
  });

  it("renders truthful social proof line and proof strip", async () => {
    const { Hero } = await import("@/components/landing/Hero");
    render(<Hero />);
    expect(screen.getByText(/15 typed resources/i)).toBeInTheDocument();
    expect(screen.getByText(/one typed schema/i)).toBeInTheDocument();
    expect(screen.queryByText(/open source/i)).not.toBeInTheDocument();
    expect(screen.getByText(/no signup/i)).toBeInTheDocument();
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
      screen.getByRole("heading", { name: "One Product resource, four wire formats", level: 2 }),
    ).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: /REST/ })).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: /GraphQL/ })).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: /WebSocket/ })).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: /Socket\.io/ })).toBeInTheDocument();
  });

  it("uses truthful REST query wording", async () => {
    const { ProtocolShowcase } = await import("@/components/landing/ProtocolShowcase");
    render(<ProtocolShowcase />);
    expect(screen.getByText(/limit\/skip pagination, search, and sort/i)).toBeInTheDocument();
    expect(screen.queryByText(/filtering/i)).not.toBeInTheDocument();
  });
});

describe("EntityBrowser", () => {
  it("renders all 15 entity cards including Custom", async () => {
    const { EntityBrowser } = await import("@/components/landing/EntityBrowser");
    render(<EntityBrowser />);
    expect(
      screen.getByRole("heading", { name: "14 built-in resources, plus custom schemas", level: 2 }),
    ).toBeInTheDocument();
    expect(screen.getByText(/pagination and search/i)).toBeInTheDocument();
    expect(screen.queryByText(/filters/i)).not.toBeInTheDocument();
    expect(screen.getByText("User")).toBeInTheDocument();
    expect(screen.getByText("Product")).toBeInTheDocument();
    expect(screen.getByText("Post")).toBeInTheDocument();
    expect(screen.getByText("Todo")).toBeInTheDocument();
    expect(screen.getByText("Notification")).toBeInTheDocument();
    expect(screen.getByText("Event")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: /show 8 more resources/i }));
    expect(screen.getByText("Comment")).toBeInTheDocument();
    expect(screen.getByText("Cart")).toBeInTheDocument();
    expect(screen.getByText("Message")).toBeInTheDocument();
    expect(screen.getByText("Quote")).toBeInTheDocument();
    expect(screen.getByText("Recipe")).toBeInTheDocument();
    expect(screen.getByText("Country")).toBeInTheDocument();
    expect(screen.getByText("Company")).toBeInTheDocument();
    expect(screen.getByText("Stock")).toBeInTheDocument();
    expect(screen.getByText("Custom schema")).toBeInTheDocument();
  });
});

describe("LiveCounter", () => {
  it("renders counter text and protocol context", async () => {
    const { LiveCounter } = await import("@/components/landing/LiveCounter");
    render(<LiveCounter initialTotal={12345} />);
    expect(screen.getByText("Requests served")).toBeInTheDocument();
    expect(
      screen.getByText(/running total of every request the hosted API has handled so far/i),
    ).toBeInTheDocument();
    expect(screen.getByText("12,345")).toBeInTheDocument();
  });
});

describe("LiveDemo", () => {
  it("renders teaching idle state with sample shape", async () => {
    const { LiveDemo } = await import("@/components/landing/LiveDemo");
    render(<LiveDemo />);
    expect(screen.getByText(/sample shape/i)).toBeInTheDocument();
    expect(screen.getByText("Products")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /run request/i })).toBeInTheDocument();
  });
});

describe("Capabilities", () => {
  it("renders verified capability claims only", async () => {
    const { Capabilities } = await import("@/components/landing/Capabilities");
    render(<Capabilities />);
    expect(
      screen.getByRole("heading", { name: "Replace fixtures with a typed hosted API", level: 2 }),
    ).toBeInTheDocument();
    expect(screen.getByText(/one typed schema/i)).toBeInTheDocument();
    expect(screen.getByText(/pagination, search, and sort/i)).toBeInTheDocument();
    expect(screen.queryByText(/latency/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/error injection/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/filtering/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/persistence/i)).not.toBeInTheDocument();
  });
});

describe("WhyMockForge", () => {
  it("renders factual strengths without competitor claims", async () => {
    const { WhyMockForge } = await import("@/components/landing/WhyMockForge");
    render(<WhyMockForge />);
    expect(
      screen.getByRole("heading", { name: /replace fixtures with a typed hosted api/i, level: 2 }),
    ).toBeInTheDocument();
    expect(screen.queryByText(/MSW/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/Mockoon/i)).not.toBeInTheDocument();
  });
});

describe("UseCasesTrust", () => {
  it("renders use cases and trust signals", async () => {
    const { UseCasesTrust } = await import("@/components/landing/UseCasesTrust");
    render(<UseCasesTrust />);
    expect(screen.getByText("Frontend development")).toBeInTheDocument();
    expect(screen.getByText("Integration tests")).toBeInTheDocument();
    expect(screen.getByText(/same origin and resource/i)).toBeInTheDocument();
    expect(screen.getByText("Product demos")).toBeInTheDocument();
    expect(screen.queryByText(/open source/i)).not.toBeInTheDocument();
  });
});

describe("Quickstart", () => {
  it("renders web-native quickstart with playground CTA", async () => {
    const { Quickstart } = await import("@/components/landing/Quickstart");
    render(<Quickstart />);
    expect(
      screen.getByRole("heading", { name: /connect your app to the mockforge api/i, level: 2 }),
    ).toBeInTheDocument();
    expect(screen.queryByText(/bunx/i)).not.toBeInTheDocument();
    expect(screen.getByRole("link", { name: /explore in playground/i })).toHaveAttribute(
      "href",
      "/playground",
    );
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
      screen.getByRole("heading", { name: "Connect your app to the MockForge API", level: 2 }),
    ).toBeInTheDocument();
  });

  it("switches tabs and shows distinct code sample", async () => {
    const { DXHighlights } = await import("@/components/landing/DXHighlights");
    render(<DXHighlights />);
    expect(screen.getAllByText(/\/api\/users/i).length).toBeGreaterThan(0);
    fireEvent.click(screen.getByRole("tab", { name: "Python" }));
    expect(screen.getByText(/import requests/i)).toBeInTheDocument();
  });
});

describe("FinalCTA", () => {
  it("renders closing CTA with playground link", async () => {
    const { FinalCTA } = await import("@/components/landing/FinalCTA");
    render(<FinalCTA />);
    expect(
      screen.getByRole("heading", { name: /point your app at the hosted api/i }),
    ).toBeInTheDocument();
    expect(screen.getByText(/no account and no api key/i)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /explore in playground/i })).toHaveAttribute(
      "href",
      "/playground",
    );
  });
});

describe("Footer", () => {
  it("renders product links and the public GitHub repo", async () => {
    const { Footer } = await import("@/components/landing/Footer");
    render(<Footer />);
    expect(screen.getByRole("link", { name: "Documentation" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "GitHub" })).toHaveAttribute(
      "href",
      "https://github.com/deepakkumardewani/mockforge",
    );
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
      collectSectionText(() => import("@/components/landing/Capabilities"), "Capabilities"),
      collectSectionText(() => import("@/components/landing/EntityBrowser"), "EntityBrowser"),
      collectSectionText(() => import("@/components/landing/LiveCounter"), "LiveCounter"),
      collectSectionText(() => import("@/components/landing/WhyMockForge"), "WhyMockForge"),
      collectSectionText(() => import("@/components/landing/DXHighlights"), "DXHighlights"),
      collectSectionText(() => import("@/components/landing/UseCasesTrust"), "UseCasesTrust"),
      collectSectionText(() => import("@/components/landing/Quickstart"), "Quickstart"),
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
    expect(siteMetadata.title).toBe("MockForge — Hosted Mock API for Apps");
    expect(siteMetadata.description).toMatch(/15 typed resources/i);
    expect(siteMetadata.openGraph?.title).toBe("MockForge — Hosted Mock API for Apps");
    expect(siteMetadata.twitter?.title).toBe("MockForge — Hosted Mock API for Apps");
  });
});
