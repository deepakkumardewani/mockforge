import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useRef } from "react";
import { mockMatchMedia } from "./landing-test-helpers";

describe("useHeroTyping", () => {
  const snippets = [
    { label: "REST", code: "GET /api/products" },
    { label: "GraphQL", code: "POST /graphql" },
  ] as const;

  beforeEach(() => {
    vi.useFakeTimers();
    mockMatchMedia(true);
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.clearAllMocks();
  });

  it("starts with empty displayed code and first snippet index", async () => {
    const { useHeroTyping } = await import("@/components/landing/useHeroTyping");
    const { result } = renderHook(() => useHeroTyping(snippets));
    expect(result.current.snippetIndex).toBe(0);
    expect(result.current.displayedCode).toBe("");
  });

  it("shows full snippet immediately when reduced motion is preferred", async () => {
    const { useHeroTyping } = await import("@/components/landing/useHeroTyping");
    const { result } = renderHook(() => useHeroTyping(snippets));

    act(() => {
      vi.advanceTimersByTime(700);
    });

    expect(result.current.displayedCode).toBe(snippets[0].code);
  });

  it("selectSnippet switches index and clears displayed code", async () => {
    const { useHeroTyping } = await import("@/components/landing/useHeroTyping");
    const { result } = renderHook(() => useHeroTyping(snippets));

    act(() => {
      vi.advanceTimersByTime(700);
    });
    expect(result.current.displayedCode).toBe(snippets[0].code);

    act(() => {
      result.current.selectSnippet(1);
    });

    expect(result.current.snippetIndex).toBe(1);
    expect(result.current.displayedCode).toBe(snippets[1].code);
  });

  it("accepts an optional target ref without throwing", async () => {
    const { useHeroTyping } = await import("@/components/landing/useHeroTyping");
    const { result } = renderHook(() => {
      const ref = useRef<HTMLDivElement>(null);
      const typing = useHeroTyping(snippets, ref);
      return { ref, typing };
    });

    expect(result.current.typing.snippetIndex).toBe(0);
  });
});
