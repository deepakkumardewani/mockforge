import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";

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

describe("EntityBrowser", () => {
  it("lists core entities and expands to show the rest", async () => {
    const { EntityBrowser } = await import("@/components/landing/EntityBrowser");
    render(<EntityBrowser />);
    expect(
      screen.getByRole("heading", { name: "14 built-in resources, plus custom schemas", level: 2 }),
    ).toBeInTheDocument();
    expect(screen.getByText("User")).toBeInTheDocument();
    expect(screen.getByText("Product")).toBeInTheDocument();
    expect(screen.queryByText("Comment")).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /show 8 more resources/i }));
    expect(screen.getByText("Comment")).toBeInTheDocument();
    expect(screen.getByText("Custom schema")).toBeInTheDocument();
  });
});
