import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, waitFor, act } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { WsPanel } from "@/components/playground/ws/WsPanel";
import { PLAYGROUND_WS_URL } from "@/components/playground/ws/playground-ws-url";

function mockWebSocket() {
  const instances: MockWebSocket[] = [];

  class MockWebSocket {
    static readonly CONNECTING = 0;
    static readonly OPEN = 1;
    static readonly CLOSING = 2;
    static readonly CLOSED = 3;

    url: string;
    readyState = MockWebSocket.CONNECTING;
    onopen: (() => void) | null = null;
    onclose: (() => void) | null = null;
    onerror: (() => void) | null = null;
    onmessage: ((ev: { data: string }) => void) | null = null;

    constructor(url: string) {
      this.url = url;
      instances.push(this);
    }

    send = vi.fn();
    close = vi.fn(() => {
      this.readyState = MockWebSocket.CLOSED;
      this.onclose?.();
    });

    simulateOpen() {
      this.readyState = MockWebSocket.OPEN;
      this.onopen?.();
    }
  }

  return { MockWebSocket, instances };
}

describe("Playground WebSocket — WsPanel", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it("Connect shows connected; Send appends outgoing line; unmount closes socket", async () => {
    const user = userEvent.setup();
    const { MockWebSocket, instances } = mockWebSocket();
    vi.stubGlobal("WebSocket", MockWebSocket as unknown as typeof WebSocket);

    const { unmount } = render(<WsPanel />);

    expect(screen.getByTitle(PLAYGROUND_WS_URL)).toHaveTextContent(PLAYGROUND_WS_URL);

    await user.click(screen.getByRole("button", { name: "Connect" }));

    await waitFor(() => expect(instances.length).toBeGreaterThan(0));
    const ws = instances[0];
    expect(ws).toBeDefined();
    expect(ws?.url).toBe(PLAYGROUND_WS_URL);

    act(() => {
      ws?.simulateOpen();
    });

    await waitFor(() => expect(screen.getByText("Connected")).toBeInTheDocument());

    const messageBox = screen.getByRole("textbox", { name: "Message" });
    await waitFor(() => expect(messageBox).not.toBeDisabled());

    await user.type(messageBox, "hello-panel");
    await user.click(screen.getByRole("button", { name: "Send" }));

    await waitFor(() => {
      const log = screen.getByRole("log");
      expect(log.textContent).toContain("hello-panel");
      expect(log.textContent).toContain("→ Out");
    });

    unmount();
    expect(ws?.close).toHaveBeenCalled();
  });
});
