import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

vi.mock("gsap", () => ({
  default: {
    registerPlugin: vi.fn(),
    context: vi.fn(() => ({ revert: vi.fn() })),
    timeline: vi.fn(() => ({ fromTo: vi.fn().mockReturnThis() })),
    fromTo: vi.fn(),
    to: vi.fn((_target, vars) => {
      vars?.onComplete?.();
    }),
    getProperty: vi.fn(() => 0),
  },
}));

vi.mock("gsap/ScrollTrigger", () => ({ ScrollTrigger: {}, default: {} }));

beforeEach(() => {
  vi.clearAllMocks();
});

describe("DXHighlights", () => {
  it("renders language tabs and the section heading", async () => {
    const { DXHighlights } = await import("@/components/landing/DXHighlights");
    render(<DXHighlights />);
    expect(screen.getByRole("tab", { name: "JavaScript" })).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: "Python" })).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: "cURL" })).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "Connect your app to the MockForge API", level: 2 }),
    ).toBeInTheDocument();
  });

  it("switches to the Python sample when its tab is selected", async () => {
    const { DXHighlights } = await import("@/components/landing/DXHighlights");
    render(<DXHighlights />);
    const user = userEvent.setup();
    await user.click(screen.getByRole("tab", { name: "Python" }));
    await waitFor(() => {
      expect(screen.getByText(/import requests/i)).toBeInTheDocument();
    });
  });
});
