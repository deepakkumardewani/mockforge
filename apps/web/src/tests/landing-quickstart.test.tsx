import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { mockMatchMedia } from "./landing-test-helpers";

vi.mock("gsap", () => ({
  default: {
    registerPlugin: vi.fn(),
    context: vi.fn(() => ({ revert: vi.fn() })),
    fromTo: vi.fn(),
    to: vi.fn((_target: unknown, vars?: { onComplete?: () => void }) => {
      vars?.onComplete?.();
    }),
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
  mockMatchMedia(true);
});

describe("Quickstart", () => {
  it("renders integration heading and step list", async () => {
    const { Quickstart } = await import("@/components/landing/Quickstart");
    render(<Quickstart />);
    expect(
      screen.getByRole("heading", { name: /connect your app to the mockforge api/i, level: 2 }),
    ).toBeInTheDocument();
    expect(screen.getByText("Use the API origin")).toBeInTheDocument();
    expect(screen.getByText("Start with a GET")).toBeInTheDocument();
  });

  it("switches client example tab to Python", async () => {
    const user = userEvent.setup();
    const { Quickstart } = await import("@/components/landing/Quickstart");
    render(<Quickstart />);
    await user.click(screen.getByRole("tab", { name: "Python" }));
    expect(screen.getByRole("tab", { name: "Python" })).toHaveAttribute("aria-selected", "true");
    expect(screen.getByText(/import requests/i)).toBeInTheDocument();
  });

  it("copies the active code sample to the clipboard", async () => {
    const user = userEvent.setup();
    const writeText = vi.fn().mockResolvedValue(undefined);
    vi.stubGlobal("navigator", { clipboard: { writeText } });

    const { Quickstart } = await import("@/components/landing/Quickstart");
    render(<Quickstart />);
    await user.click(screen.getByRole("button", { name: /copy code sample/i }));

    await waitFor(() => {
      expect(writeText).toHaveBeenCalledWith(expect.stringContaining("fetch("));
    });
    expect(screen.getByRole("button", { name: /copied to clipboard/i })).toBeInTheDocument();
  });

  it("exposes integration anchor id on the section", async () => {
    const { Quickstart } = await import("@/components/landing/Quickstart");
    render(<Quickstart />);
    expect(document.getElementById("integration")).toBeInTheDocument();
  });
});
