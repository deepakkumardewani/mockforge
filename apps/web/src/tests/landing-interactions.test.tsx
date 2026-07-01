import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";

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
  default: ({
    children,
    href,
    className,
  }: {
    children: React.ReactNode;
    href: string;
    className?: string;
  }) => (
    <a href={href} className={className}>
      {children}
    </a>
  ),
}));

beforeEach(() => {
  vi.clearAllMocks();
  vi.stubGlobal(
    "matchMedia",
    vi.fn().mockImplementation((query: string) => ({
      matches: query === "(prefers-reduced-motion: reduce)",
      media: query,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      addListener: vi.fn(),
      removeListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  );
});

describe("landing micro-interactions", () => {
  it("LiveDemo tabs expose tabpanel wiring for keyboard/screen readers", async () => {
    const { LiveDemo } = await import("@/components/landing/LiveDemo");
    render(<LiveDemo />);

    const productsTab = screen.getByRole("tab", { name: "Products" });
    expect(productsTab).toHaveAttribute("aria-controls", "livedemo-response-panel");
    expect(screen.getByRole("tabpanel")).toHaveAttribute(
      "aria-labelledby",
      "livedemo-tab-products",
    );

    fireEvent.click(screen.getByRole("tab", { name: "Users" }));
    expect(screen.getByRole("tab", { name: "Users" })).toHaveAttribute("aria-selected", "true");
  });

  it("LiveDemo run button uses primary press feedback class", async () => {
    const { LiveDemo } = await import("@/components/landing/LiveDemo");
    render(<LiveDemo />);
    expect(screen.getByRole("button", { name: /run request/i })).toHaveClass("landing-btn-primary");
  });

  it("DXHighlights copy announces confirmation to screen readers", async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    vi.stubGlobal("navigator", { clipboard: { writeText } });

    const { DXHighlights } = await import("@/components/landing/DXHighlights");
    render(<DXHighlights />);

    fireEvent.click(screen.getByRole("button", { name: /copy code sample/i }));
    await waitFor(() => {
      expect(screen.getByText("Code copied to clipboard")).toBeInTheDocument();
    });
    expect(screen.getByRole("button", { name: /copied to clipboard/i })).toBeInTheDocument();
  });

  it("Hero CTAs use shared press-feedback classes", async () => {
    const { Hero } = await import("@/components/landing/Hero");
    render(<Hero />);
    expect(screen.getByRole("link", { name: "Open Playground" })).toHaveClass(
      "landing-btn-primary",
    );
    expect(screen.getByRole("link", { name: "Read the Docs" })).toHaveClass(
      "landing-btn-secondary",
    );
  });
});

describe("landing claim audit", () => {
  const FABRICATED_PATTERNS = [
    /open source/i,
    /\bfiltering\b/i,
    /error injection/i,
    /\blatency\b/i,
    /\bpersistence\b/i,
    /github\.com\/mockforge\/mockforge/i,
    /\bMSW\b/,
    /\bMockoon\b/,
    /\bbunx\b/i,
  ] as const;

  const SECTIONS = [
    () => import("@/components/landing/Hero"),
    () => import("@/components/landing/LiveDemo"),
    () => import("@/components/landing/ProtocolShowcase"),
    () => import("@/components/landing/Capabilities"),
    () => import("@/components/landing/EntityBrowser"),
    () => import("@/components/landing/LiveCounter"),
    () => import("@/components/landing/WhyMockForge"),
    () => import("@/components/landing/DXHighlights"),
    () => import("@/components/landing/UseCasesTrust"),
    () => import("@/components/landing/Quickstart"),
    () => import("@/components/landing/FinalCTA"),
    () => import("@/components/landing/Footer"),
  ] as const;

  it("does not contain fabricated or unverified claims", async () => {
    for (const importFn of SECTIONS) {
      const mod = await importFn();
      const Component = Object.values(mod)[0] as React.ComponentType;
      const { container } = render(<Component />);
      const text = container.textContent ?? "";

      for (const pattern of FABRICATED_PATTERNS) {
        expect(text).not.toMatch(pattern);
      }
    }
  });
});
