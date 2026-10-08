import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { mockMatchMedia } from "./landing-test-helpers";

vi.mock("gsap", () => ({
  default: {
    registerPlugin: vi.fn(),
    context: vi.fn(() => ({ revert: vi.fn() })),
    timeline: vi.fn(() => ({
      fromTo: vi.fn().mockReturnThis(),
    })),
    fromTo: vi.fn(),
    to: vi.fn(),
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
  mockMatchMedia(true);
});

describe("Hero", () => {
  it("renders headline aria label and primary CTAs", async () => {
    const { Hero } = await import("@/components/landing/Hero");
    render(<Hero />);
    expect(
      screen.getByLabelText("Build your app before the backend is ready."),
    ).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Use the API" })).toHaveAttribute(
      "href",
      "#integration",
    );
    expect(screen.getByRole("link", { name: "Explore in Playground" })).toHaveAttribute(
      "href",
      "/playground",
    );
  });

  it("exposes terminal snippet tabs with REST selected by default", async () => {
    const { Hero } = await import("@/components/landing/Hero");
    render(<Hero />);
    const restTab = screen.getByRole("button", { name: /show REST request sample/i });
    const graphqlTab = screen.getByRole("button", { name: /show GraphQL request sample/i });
    expect(restTab).toHaveAttribute("aria-pressed", "true");
    expect(graphqlTab).toHaveAttribute("aria-pressed", "false");
  });

  it("switches terminal snippet when a tab is clicked", async () => {
    const user = userEvent.setup();
    const { Hero } = await import("@/components/landing/Hero");
    render(<Hero />);
    const graphqlTab = screen.getByRole("button", { name: /show GraphQL request sample/i });
    await user.click(graphqlTab);
    expect(graphqlTab).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByRole("button", { name: /show REST request sample/i })).toHaveAttribute(
      "aria-pressed",
      "false",
    );
  });
});
