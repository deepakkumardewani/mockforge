import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Playground } from "@/components/playground/Playground";
import { ProtocolRail } from "@/components/playground/ProtocolRail";
import { JsonView } from "@/components/playground/shared/JsonView";
import { ResponseViewer } from "@/components/playground/shared/ResponseViewer";
import {
  PLAYGROUND_PANEL_GRID,
  GRAPHQL_PANEL_GRID,
} from "@/components/playground/shared/panel-layout";

vi.mock("@/hooks/use-mf-id", () => ({
  useMfId: () => null,
}));

function renderPlayground() {
  return render(
    <QueryClientProvider
      client={new QueryClient({ defaultOptions: { mutations: { retry: false } } })}
    >
      <Playground />
    </QueryClientProvider>,
  );
}

describe("Playground layout — panel grid", () => {
  it("uses minmax(0,1fr) columns to prevent content-driven width expansion", () => {
    expect(PLAYGROUND_PANEL_GRID).toContain("minmax(0,1fr)");
    expect(PLAYGROUND_PANEL_GRID).toContain("overflow-hidden");
  });

  it("GRAPHQL_PANEL_GRID uses 3-column layout with 220px schema column", () => {
    expect(GRAPHQL_PANEL_GRID).toContain("220px");
    expect(GRAPHQL_PANEL_GRID).toContain("minmax(0,1fr)");
    expect(GRAPHQL_PANEL_GRID).toContain("overflow-hidden");
  });
});

describe("Playground layout — JsonView", () => {
  it("wraps long strings with break-all to prevent column expansion", () => {
    const longUrl = "https://example.com/" + "a".repeat(200);
    const { container } = render(<JsonView value={{ url: longUrl }} />);

    const pre = container.querySelector("pre");
    expect(pre?.className).toContain("break-all");
    expect(pre?.className).toContain("overflow-auto");
  });

  it("defers scrolling to parent when embedded (empty maxHeightClassName)", () => {
    const { container } = render(<JsonView value={{ ok: true }} maxHeightClassName="" />);

    const pre = container.querySelector("pre");
    expect(pre?.className).not.toContain("overflow-auto");
    expect(pre?.className).toContain("min-w-0");
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

describe("Playground layout — ProtocolRail", () => {
  it("renders 4 protocol buttons with correct labels", () => {
    render(<ProtocolRail active="rest" onChange={() => {}} />);
    expect(screen.getByRole("button", { name: "REST" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "GraphQL" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "WebSocket" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Socket.IO" })).toBeInTheDocument();
  });

  it("marks the active protocol as pressed", () => {
    render(<ProtocolRail active="graphql" onChange={() => {}} />);
    expect(screen.getByRole("button", { name: "GraphQL" })).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByRole("button", { name: "REST" })).toHaveAttribute("aria-pressed", "false");
  });

  it("calls onChange when a protocol button is clicked", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<ProtocolRail active="rest" onChange={onChange} />);

    await user.click(screen.getByRole("button", { name: "GraphQL" }));
    expect(onChange).toHaveBeenCalledWith("graphql");
  });
});

describe("Playground layout — Playground shell", () => {
  it("renders ProtocolRail with 4 protocol buttons", () => {
    renderPlayground();
    expect(screen.getByRole("navigation", { name: "Protocol selector" })).toBeInTheDocument();
    expect(
      screen.getAllByRole("button", { name: /REST|GraphQL|WebSocket|Socket\.IO/u }).length,
    ).toBeGreaterThanOrEqual(4);
  });

  it("switches panel when a protocol is clicked", async () => {
    const user = userEvent.setup();
    renderPlayground();

    // REST panel loads by default (has "Send" button in request bar)
    expect(screen.getByRole("button", { name: "Send" })).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "GraphQL" }));
    // GraphQL panel also has a Send button
    expect(screen.getByRole("button", { name: "Send" })).toBeInTheDocument();
    // GraphQL endpoint URL is present
    expect(screen.getByRole("textbox", { name: "GraphQL endpoint URL" })).toBeInTheDocument();
  });
});
