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

beforeEach(() => {
  vi.clearAllMocks();
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
    expect(screen.queryByText(/filtering/i)).not.toBeInTheDocument();
  });
});
