import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
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

beforeEach(() => {
  vi.clearAllMocks();
  mockMatchMedia(false);
});

describe("WhyMockForge", () => {
  it("renders differentiation heading and why anchor", async () => {
    const { WhyMockForge } = await import("@/components/landing/WhyMockForge");
    render(<WhyMockForge />);
    expect(
      screen.getByRole("heading", {
        name: /replace fixtures with a typed hosted api/i,
        level: 2,
      }),
    ).toBeInTheDocument();
    expect(document.getElementById("why")).toBeInTheDocument();
  });

  it("renders comparison table with both approaches", async () => {
    const { WhyMockForge } = await import("@/components/landing/WhyMockForge");
    render(<WhyMockForge />);
    expect(screen.getByRole("table")).toBeInTheDocument();
    expect(screen.getByRole("columnheader", { name: "Approach" })).toBeInTheDocument();
    expect(
      screen.getByRole("rowheader", { name: /hand-maintained fixtures/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("rowheader", { name: /generic placeholder json apis/i }),
    ).toBeInTheDocument();
  });

  it("states typed resources in the comparison copy", async () => {
    const { WhyMockForge } = await import("@/components/landing/WhyMockForge");
    render(<WhyMockForge />);
    expect(screen.getByText(/15 typed resources with limit\/skip pagination/i)).toBeInTheDocument();
  });
});
