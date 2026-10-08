import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { mockMatchMedia } from "./landing-test-helpers";

vi.mock("gsap", () => ({
  default: {
    registerPlugin: vi.fn(),
    context: vi.fn(() => ({ revert: vi.fn() })),
    fromTo: vi.fn(),
    getProperty: vi.fn(() => 0),
  },
}));

vi.mock("gsap/ScrollTrigger", () => ({
  ScrollTrigger: {},
}));

beforeEach(() => {
  vi.clearAllMocks();
  mockMatchMedia(true);
});

describe("LiveCounter", () => {
  it("formats the initial total with grouping separators", async () => {
    const { LiveCounter } = await import("@/components/landing/LiveCounter");
    render(<LiveCounter initialTotal={12345} />);
    expect(screen.getByText("12,345")).toBeInTheDocument();
    expect(screen.getByText(/total api requests served/i)).toBeInTheDocument();
  });

  it("marks the counter as busy while total is null", async () => {
    const { LiveCounter } = await import("@/components/landing/LiveCounter");
    render(<LiveCounter initialTotal={null} />);
    const liveRegion = screen.getByText(/total api requests served/i).closest("[aria-live]");
    expect(liveRegion).toHaveAttribute("aria-busy", "true");
    expect(screen.queryByText(/\d/)).not.toBeInTheDocument();
  });

  it("labels the section via Requests served heading", async () => {
    const { LiveCounter } = await import("@/components/landing/LiveCounter");
    render(<LiveCounter initialTotal={100} />);
    expect(screen.getByText("Requests served")).toHaveAttribute("id", "live-counter-heading");
    expect(screen.getByRole("region")).toHaveAttribute("aria-labelledby", "live-counter-heading");
  });
});
