import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, renderHook } from "@testing-library/react";
import React from "react";

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

function mockMatchMedia(prefersReduced: boolean) {
  Object.defineProperty(window, "matchMedia", {
    writable: true,
    value: (query: string) => ({
      matches: query === "(prefers-reduced-motion: reduce)" ? prefersReduced : false,
      media: query,
      onchange: null,
      addListener: () => {},
      removeListener: () => {},
      addEventListener: () => {},
      removeEventListener: () => {},
      dispatchEvent: () => false,
    }),
  });
}

beforeEach(() => {
  vi.clearAllMocks();
  mockMatchMedia(false);
});

describe("useRevealOnScroll", () => {
  it("returns a container ref object", async () => {
    const { useRevealOnScroll } = await import("@/components/landing/useRevealOnScroll");
    const { result } = renderHook(() => useRevealOnScroll({ selector: ".reveal" }));
    expect(result.current).toBeDefined();
    expect(result.current).toHaveProperty("current");
  });

  it("calls gsap.context when motion is allowed", async () => {
    const gsap = (await import("gsap")).default;
    const { useRevealOnScroll } = await import("@/components/landing/useRevealOnScroll");
    renderHook(() => useRevealOnScroll({ selector: ".reveal" }));
    expect(gsap.context).toHaveBeenCalled();
  });

  it("does not call gsap.context when prefers-reduced-motion is set", async () => {
    mockMatchMedia(true);
    const gsap = (await import("gsap")).default;
    const { useRevealOnScroll } = await import("@/components/landing/useRevealOnScroll");
    renderHook(() => useRevealOnScroll({ selector: ".reveal" }));
    expect(gsap.context).not.toHaveBeenCalled();
  });

  it("accepts an array of targets", async () => {
    const gsap = (await import("gsap")).default;
    const { useRevealOnScroll } = await import("@/components/landing/useRevealOnScroll");
    renderHook(() =>
      useRevealOnScroll([{ selector: ".heading" }, { selector: ".card", stagger: 0.1 }]),
    );
    expect(gsap.context).toHaveBeenCalled();
  });
});

describe("Section", () => {
  it("renders children", async () => {
    const { Section } = await import("@/components/landing/Section");
    render(<Section>Hello World</Section>);
    expect(screen.getByText("Hello World")).toBeInTheDocument();
  });

  it("renders a <section> element with standard padding classes", async () => {
    const { Section } = await import("@/components/landing/Section");
    const { container } = render(<Section>content</Section>);
    const section = container.querySelector("section");
    expect(section).toBeInTheDocument();
    expect(section?.className).toMatch(/px-6/);
    expect(section?.className).toMatch(/py-28/);
  });

  it("wraps children in a max-width container div", async () => {
    const { Section } = await import("@/components/landing/Section");
    const { container } = render(<Section>content</Section>);
    const inner = container.querySelector(".max-w-7xl");
    expect(inner).toBeInTheDocument();
  });

  it("applies extra className to the outer section", async () => {
    const { Section } = await import("@/components/landing/Section");
    const { container } = render(<Section className="extra-class">content</Section>);
    const section = container.querySelector("section");
    expect(section?.className).toMatch(/extra-class/);
  });

  it("forwards ref to the outer section element", async () => {
    const { Section } = await import("@/components/landing/Section");
    const ref = React.createRef<HTMLElement>();
    render(<Section ref={ref}>content</Section>);
    expect(ref.current).toBeInstanceOf(HTMLElement);
    expect(ref.current?.tagName).toBe("SECTION");
  });
});
