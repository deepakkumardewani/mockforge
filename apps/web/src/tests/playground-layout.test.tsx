import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { PlaygroundTabs } from "@/components/playground/PlaygroundTabs";
import { JsonView } from "@/components/playground/shared/JsonView";
import { ResponseViewer } from "@/components/playground/shared/ResponseViewer";

vi.mock("@/hooks/use-mf-id", () => ({
  useMfId: () => null,
}));

const TAB_CONTENT_CLASS =
  "mt-4 flex min-h-0 flex-1 flex-col overflow-hidden pb-4 outline-none";

function renderTabs() {
  return render(
    <QueryClientProvider
      client={new QueryClient({ defaultOptions: { mutations: { retry: false } } })}
    >
      <PlaygroundTabs />
    </QueryClientProvider>,
  );
}

describe("Playground layout — JsonView", () => {
  it("wraps long strings with break-all to prevent column expansion", () => {
    const longUrl = "https://example.com/" + "a".repeat(200);
    const { container } = render(<JsonView value={{ url: longUrl }} />);

    const pre = container.querySelector("pre");
    expect(pre?.className).toContain("break-all");
    expect(pre?.className).toContain("overflow-auto");
  });
});

describe("Playground layout — ResponseViewer", () => {
  it("contains overflow on the section wrapper", () => {
    const mockResponse = {
      status: 200,
      statusText: "OK",
      timeMs: 12,
      headers: {},
      body: { url: "x".repeat(300) },
    };

    render(<ResponseViewer response={mockResponse} />);

    const section = screen.getByRole("region", { name: "HTTP response" });
    expect(section.className).toContain("overflow-hidden");
    expect(section.className).toContain("min-w-0");
  });
});

describe("Playground layout — PlaygroundTabs", () => {
  it("uses identical Tabs.Content classes for all four protocol tabs", () => {
    const { container } = renderTabs();

    const tabPanels = container.querySelectorAll('[role="tabpanel"]');
    expect(tabPanels.length).toBe(4);

    tabPanels.forEach((panel) => {
      expect(panel.className).toBe(TAB_CONTENT_CLASS);
    });
  });
});
