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
  default: ({
    children,
    href,
  }: {
    children: React.ReactNode;
    href: string;
  }) => <a href={href}>{children}</a>,
}));

beforeEach(() => {
  vi.clearAllMocks();
});

describe("Hero", () => {
  it("renders headline and CTAs", async () => {
    const { Hero } = await import("@/components/landing/Hero");
    render(<Hero />);
    expect(screen.getByText("MockForge")).toBeInTheDocument();
    expect(screen.getByText("Fake Data, Real Power")).toBeInTheDocument();
    expect(screen.getByText("Explore Docs")).toBeInTheDocument();
    expect(screen.getByText("Try the Builder")).toBeInTheDocument();
  });
});

describe("ProtocolShowcase", () => {
  it("renders all four protocol cards", async () => {
    const { ProtocolShowcase } = await import(
      "@/components/landing/ProtocolShowcase"
    );
    render(<ProtocolShowcase />);
    expect(screen.getByText("REST")).toBeInTheDocument();
    expect(screen.getByText("GraphQL")).toBeInTheDocument();
    expect(screen.getByText("WebSocket")).toBeInTheDocument();
    expect(screen.getByText("Socket.io")).toBeInTheDocument();
  });
});

describe("EntityBrowser", () => {
  it("renders all 14 entity cards", async () => {
    const { EntityBrowser } = await import(
      "@/components/landing/EntityBrowser"
    );
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
    const { LiveCounter } = await import(
      "@/components/landing/LiveCounter"
    );
    render(<LiveCounter />);
    expect(
      screen.getByText("API requests served and counting"),
    ).toBeInTheDocument();
    expect(screen.getByText("Live via WebSocket")).toBeInTheDocument();
  });
});

describe("DXHighlights", () => {
  it("renders all three tabs", async () => {
    const { DXHighlights } = await import(
      "@/components/landing/DXHighlights"
    );
    render(<DXHighlights />);
    expect(screen.getByText("JavaScript")).toBeInTheDocument();
    expect(screen.getByText("Python")).toBeInTheDocument();
    expect(screen.getByText("cURL")).toBeInTheDocument();
    expect(screen.getByText("Copy, Paste, Build")).toBeInTheDocument();
  });
});

describe("Footer", () => {
  it("renders links", async () => {
    const { Footer } = await import("@/components/landing/Footer");
    render(<Footer />);
    expect(screen.getByText("Docs")).toBeInTheDocument();
    expect(screen.getByText("GitHub")).toBeInTheDocument();
    expect(screen.getByText("Schema Builder")).toBeInTheDocument();
  });
});
