import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";

vi.mock("gsap", () => ({
  default: {
    registerPlugin: vi.fn(),
    context: vi.fn(() => ({ revert: vi.fn() })),
    timeline: vi.fn(() => ({
      fromTo: vi.fn().mockReturnThis(),
    })),
    fromTo: vi.fn(),
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

beforeEach(() => {
  vi.clearAllMocks();
});

describe("Hero", () => {
  it("renders headline and CTAs", async () => {
    const { Hero } = await import("@/components/landing/Hero");
    render(<Hero />);
    expect(screen.getByText("MockForge")).toBeInTheDocument();
    expect(screen.getByLabelText("Fake Data. Real Power.")).toBeInTheDocument();
    expect(screen.getByText("Fake")).toBeInTheDocument();
    expect(screen.getByText("Power.")).toBeInTheDocument();
    expect(screen.getByText("Explore Docs")).toBeInTheDocument();
    expect(screen.getByText("Try the Builder")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Try the playground →" })).toHaveAttribute(
      "href",
      "/playground",
    );
  });
});

describe("ProtocolShowcase", () => {
  it("renders all four protocol cards", async () => {
    const { ProtocolShowcase } = await import("@/components/landing/ProtocolShowcase");
    render(<ProtocolShowcase />);
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
    expect(screen.getByText("Requests served")).toBeInTheDocument();
    expect(screen.getByText("Live via WebSocket")).toBeInTheDocument();
  });
});

describe("DXHighlights", () => {
  it("renders all three tabs", async () => {
    const { DXHighlights } = await import("@/components/landing/DXHighlights");
    render(<DXHighlights />);
    expect(screen.getByText("JavaScript")).toBeInTheDocument();
    expect(screen.getByText("Python")).toBeInTheDocument();
    expect(screen.getByText("cURL")).toBeInTheDocument();
    expect(screen.getByText("Copy, paste, build")).toBeInTheDocument();
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
