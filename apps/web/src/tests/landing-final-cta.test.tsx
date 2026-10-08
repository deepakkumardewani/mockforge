import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";

vi.mock("gsap", () => ({
  default: {
    registerPlugin: vi.fn(),
    context: vi.fn(() => ({ revert: vi.fn() })),
    timeline: vi.fn(() => ({ fromTo: vi.fn().mockReturnThis() })),
    fromTo: vi.fn(),
    to: vi.fn(),
    getProperty: vi.fn(() => 0),
  },
}));

vi.mock("gsap/ScrollTrigger", () => ({ ScrollTrigger: {}, default: {} }));

vi.mock("next/link", () => ({
  default: ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  ),
}));

beforeEach(() => {
  vi.clearAllMocks();
});

describe("FinalCTA", () => {
  it("renders the closing headline and playground link", async () => {
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
