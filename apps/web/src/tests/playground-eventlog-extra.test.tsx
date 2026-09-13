import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { EventLog } from "@/components/playground/shared/EventLog";
import type { WsConsoleEvent } from "@/hooks/use-ws-console";

function ev(overrides: Partial<WsConsoleEvent> & Pick<WsConsoleEvent, "id">): WsConsoleEvent {
  return {
    direction: "in",
    message: "hello",
    at: new Date(2026, 0, 2, 3, 4, 5, 67).getTime(),
    ...overrides,
  };
}

describe("Playground EventLog — extra coverage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("shows the default empty hint when there are no events", () => {
    render(<EventLog events={[]} />);

    expect(screen.getByText("Connect to see messages.")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Collapse all" })).not.toBeInTheDocument();
  });

  it("shows a custom empty hint", () => {
    render(<EventLog events={[]} emptyHint="Waiting for emits." />);

    expect(screen.getByText("Waiting for emits.")).toBeInTheDocument();
  });

  it("calls onClear when Clear is clicked", async () => {
    const user = userEvent.setup();
    const onClear = vi.fn();
    render(<EventLog events={[ev({ id: "1" })]} onClear={onClear} />);

    await user.click(screen.getByRole("button", { name: "Clear" }));

    expect(onClear).toHaveBeenCalledTimes(1);
  });

  it("hides Clear when onClear is not provided", () => {
    render(<EventLog events={[ev({ id: "1" })]} />);

    expect(screen.queryByRole("button", { name: "Clear" })).not.toBeInTheDocument();
  });

  it("parses Socket.IO name(payload) and expands formatted JSON", async () => {
    const user = userEvent.setup();
    render(
      <EventLog
        events={[
          ev({
            id: "chat",
            message: `chat(${JSON.stringify({ hello: "world" })})`,
          }),
        ]}
      />,
    );

    expect(screen.getByText("chat")).toBeInTheDocument();
    expect(screen.getByText(/\{"hello":"world"\}/)).toBeInTheDocument();

    const row = screen.getByRole("button", { expanded: false });
    await user.click(row);

    expect(row).toHaveAttribute("aria-expanded", "true");
    expect(screen.getByText('"hello"')).toBeInTheDocument();
    expect(screen.getByText('"world"')).toBeInTheDocument();
  });

  it("collapses an expanded row via Collapse all", async () => {
    const user = userEvent.setup();
    render(
      <EventLog
        events={[
          ev({
            id: "chat",
            message: `chat(${JSON.stringify({ hello: "world" })})`,
          }),
        ]}
      />,
    );

    await user.click(screen.getByRole("button", { expanded: false }));
    expect(screen.getByRole("button", { expanded: true })).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Collapse all" }));

    expect(screen.getByRole("button", { expanded: false })).toBeInTheDocument();
  });

  it("toggles a row closed on a second click", async () => {
    const user = userEvent.setup();
    render(<EventLog events={[ev({ id: "1", message: "inbound text" })]} />);

    const row = screen.getByRole("button", { name: /inbound text/ });
    await user.click(row);
    expect(row).toHaveAttribute("aria-expanded", "true");

    await user.click(row);
    expect(row).toHaveAttribute("aria-expanded", "false");
  });

  it("shows No payload for an empty Socket.IO event", async () => {
    const user = userEvent.setup();
    render(<EventLog events={[ev({ id: "ping", message: "ping()" })]} />);

    await user.click(screen.getByRole("button", { name: /ping/ }));

    expect(screen.getByText("No payload")).toBeInTheDocument();
  });

  it("renders a raw payload when the body is not JSON", async () => {
    const user = userEvent.setup();
    render(<EventLog events={[ev({ id: "note", message: "note(not-json-payload)" })]} />);

    await user.click(screen.getByRole("button", { name: /note/ }));

    expect(document.querySelector("pre")?.textContent).toBe("not-json-payload");
  });

  it("treats whitespace-only payloads as non-JSON", async () => {
    const user = userEvent.setup();
    render(<EventLog events={[ev({ id: "blank", message: "evt(   )" })]} />);

    await user.click(screen.getByRole("button", { name: /evt/ }));

    const pre = document.querySelector("pre");
    expect(pre).toBeTruthy();
    expect(pre?.textContent).toBe("   ");
  });

  it("unwraps a JSON string payload in the preview", () => {
    render(
      <EventLog events={[ev({ id: "s", message: `msg(${JSON.stringify("plain string")})` })]} />,
    );

    expect(screen.getByText("plain string")).toBeInTheDocument();
  });

  it("truncates long previews with an ellipsis", () => {
    const long = "x".repeat(200);
    render(<EventLog events={[ev({ id: "long", message: long })]} />);

    expect(document.body.textContent).toContain("…");
  });

  it("shows system and error markers from lifecycle tags", () => {
    render(
      <EventLog
        events={[
          ev({ id: "sys", message: "[connected] ready" }),
          ev({ id: "err", message: "[error] boom" }),
        ]}
      />,
    );

    expect(screen.getByText("Sys")).toBeInTheDocument();
    expect(screen.getByText("[connected] ready")).toBeInTheDocument();
    expect(screen.getByText("Err")).toBeInTheDocument();
    expect(screen.getByText("[error] boom")).toBeInTheDocument();
  });

  it("pauses autoscroll on scroll-away and jumps back to latest", async () => {
    const user = userEvent.setup();
    const { container } = render(<EventLog events={[ev({ id: "1" })]} />);
    const scroll = container.querySelector('[role="log"]') as HTMLDivElement;

    Object.defineProperty(scroll, "scrollHeight", {
      configurable: true,
      value: 1000,
    });
    Object.defineProperty(scroll, "clientHeight", {
      configurable: true,
      value: 200,
    });
    scroll.scrollTop = 0;

    fireEvent.scroll(scroll);

    expect(screen.getByText("Autoscroll paused")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Jump to latest" }));

    expect(scroll.scrollTop).toBe(1000);
    expect(screen.queryByText("Autoscroll paused")).not.toBeInTheDocument();
  });
});
