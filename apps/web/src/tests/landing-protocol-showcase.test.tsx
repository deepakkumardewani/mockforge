import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { mockMatchMedia } from "./landing-test-helpers";

vi.mock("gsap", () => ({
  default: {
    registerPlugin: vi.fn(),
    context: vi.fn(() => ({ revert: vi.fn() })),
    fromTo: vi.fn(),
  },
}));

vi.mock("gsap/ScrollTrigger", () => ({
  ScrollTrigger: {},
}));

vi.mock("next/link", () => ({
  default: ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  ),
}));

beforeEach(() => {
  vi.clearAllMocks();
  mockMatchMedia(false);
});

describe("ProtocolShowcase", () => {
  it("renders wire-format tabs with REST selected", async () => {
    const { ProtocolShowcase } = await import("@/components/landing/ProtocolShowcase");
    render(<ProtocolShowcase />);
    expect(screen.getByRole("tablist", { name: "Wire formats" })).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: /REST/ })).toHaveAttribute("aria-selected", "true");
  });

  it("updates sample summary when GraphQL tab is selected", async () => {
    const user = userEvent.setup();
    const { ProtocolShowcase } = await import("@/components/landing/ProtocolShowcase");
    render(<ProtocolShowcase />);
    await user.click(screen.getByRole("tab", { name: /GraphQL/ }));
    expect(screen.getByText(/select the same product fields/i)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /read graphql docs/i })).toHaveAttribute(
      "href",
      "/docs/graphql",
    );
  });

  it("links to playground from the active protocol panel", async () => {
    const { ProtocolShowcase } = await import("@/components/landing/ProtocolShowcase");
    render(<ProtocolShowcase />);
    expect(screen.getByRole("link", { name: /explore in playground/i })).toHaveAttribute(
      "href",
      "/playground",
    );
  });
});
