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

describe("UseCasesTrust", () => {
  it("renders the scenarios heading", async () => {
    const { UseCasesTrust } = await import("@/components/landing/UseCasesTrust");
    render(<UseCasesTrust />);
    expect(
      screen.getByRole("heading", {
        name: /where teams call the api from an existing app/i,
        level: 2,
      }),
    ).toBeInTheDocument();
  });

  it("lists all four scenario titles", async () => {
    const { UseCasesTrust } = await import("@/components/landing/UseCasesTrust");
    render(<UseCasesTrust />);
    expect(screen.getByText("Frontend development")).toBeInTheDocument();
    expect(screen.getByText("Integration tests")).toBeInTheDocument();
    expect(screen.getByText("Protocol comparison")).toBeInTheDocument();
    expect(screen.getByText("Product demos")).toBeInTheDocument();
  });

  it("describes shared origin and resource paths", async () => {
    const { UseCasesTrust } = await import("@/components/landing/UseCasesTrust");
    render(<UseCasesTrust />);
    expect(screen.getByText(/same origin and resource/i)).toBeInTheDocument();
  });
});
