import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";

vi.mock("gsap", () => ({
  default: {
    registerPlugin: vi.fn(),
    context: vi.fn((fn: () => void) => {
      fn();
      return { revert: vi.fn() };
    }),
    fromTo: vi.fn(),
  },
}));

vi.mock("gsap/ScrollTrigger", () => ({
  ScrollTrigger: { refresh: vi.fn() },
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

describe("useRevealOnScroll", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
    mockMatchMedia(false);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("returns a ref object for the scroll container", async () => {
    const { useRevealOnScroll } = await import("@/components/landing/useRevealOnScroll");
    const { result } = renderHook(() => useRevealOnScroll({ selector: ".reveal" }));
    expect(result.current).toHaveProperty("current", null);
  });

  it("registers gsap animations when motion is allowed", async () => {
    const gsap = (await import("gsap")).default;
    const { useRevealOnScroll } = await import("@/components/landing/useRevealOnScroll");
    renderHook(() => useRevealOnScroll({ selector: ".reveal" }));
    expect(gsap.context).toHaveBeenCalled();
  });

  it("skips gsap setup when prefers-reduced-motion is enabled", async () => {
    mockMatchMedia(true);
    const gsap = (await import("gsap")).default;
    const { useRevealOnScroll } = await import("@/components/landing/useRevealOnScroll");
    renderHook(() => useRevealOnScroll({ selector: ".reveal" }));
    expect(gsap.context).not.toHaveBeenCalled();
  });

  it("schedules ScrollTrigger refresh and reverts on unmount", async () => {
    const { ScrollTrigger } = await import("gsap/ScrollTrigger");
    const gsap = (await import("gsap")).default;
    const revert = vi.fn();
    vi.mocked(gsap.context).mockReturnValue({ revert } as unknown as gsap.Context);

    const { useRevealOnScroll } = await import("@/components/landing/useRevealOnScroll");
    const { unmount } = renderHook(() => useRevealOnScroll({ selector: ".item" }));

    act(() => {
      vi.advanceTimersByTime(50);
    });
    expect(vi.mocked(ScrollTrigger).refresh).toHaveBeenCalled();

    unmount();
    expect(revert).toHaveBeenCalled();
  });

  it("accepts multiple reveal targets in one hook call", async () => {
    const gsap = (await import("gsap")).default;
    const { useRevealOnScroll } = await import("@/components/landing/useRevealOnScroll");
    renderHook(() =>
      useRevealOnScroll([{ selector: ".heading" }, { selector: ".card", stagger: 0.1 }]),
    );
    expect(gsap.context).toHaveBeenCalled();
  });
});
