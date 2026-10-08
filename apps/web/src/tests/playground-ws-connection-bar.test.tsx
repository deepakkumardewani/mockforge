import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ConnectionBar } from "@/components/playground/ws/ConnectionBar";

describe("ConnectionBar", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("shows the WebSocket URL and Connect when idle", () => {
    render(
      <ConnectionBar
        endpointUrl="wss://api.mockforge.dev/ws"
        status="idle"
        onConnect={vi.fn()}
        onDisconnect={vi.fn()}
      />,
    );

    expect(screen.getByText("wss://api.mockforge.dev/ws")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Connect" })).toBeInTheDocument();
  });

  it("calls onConnect from the shared connection controls", async () => {
    const user = userEvent.setup();
    const onConnect = vi.fn();
    render(
      <ConnectionBar
        endpointUrl="wss://api.mockforge.dev/ws"
        status="idle"
        onConnect={onConnect}
        onDisconnect={vi.fn()}
      />,
    );

    await user.click(screen.getByRole("button", { name: "Connect" }));
    expect(onConnect).toHaveBeenCalledTimes(1);
  });

  it("calls onDisconnect when connected", async () => {
    const user = userEvent.setup();
    const onDisconnect = vi.fn();
    render(
      <ConnectionBar
        endpointUrl="wss://api.mockforge.dev/ws"
        status="connected"
        onConnect={vi.fn()}
        onDisconnect={onDisconnect}
      />,
    );

    await user.click(screen.getByRole("button", { name: "Disconnect" }));
    expect(onDisconnect).toHaveBeenCalledTimes(1);
  });
});
