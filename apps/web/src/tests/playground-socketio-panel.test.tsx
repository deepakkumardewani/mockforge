import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, waitFor, act, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { SocketIoPanel } from "@/components/playground/socketio/SocketIoPanel";

const ioMock = vi.fn();

vi.mock("@/lib/socket-io-client", () => ({
  io: (...args: unknown[]) => ioMock(...args),
}));

function mockIo() {
  const listeners: Record<string, Array<(...args: unknown[]) => void>> = {};
  const socket = {
    connected: false,
    on: vi.fn((ev: string, fn: (...args: unknown[]) => void) => {
      (listeners[ev] ??= []).push(fn);
    }),
    emit: vi.fn(),
    disconnect: vi.fn(() => {
      socket.connected = false;
      for (const fn of listeners.disconnect ?? []) fn("io disconnect");
    }),
    simulateConnect() {
      socket.connected = true;
      for (const fn of listeners.connect ?? []) fn();
    },
  };
  ioMock.mockReturnValue(socket);
  return socket;
}

describe("Playground Socket.IO — SocketIoPanel", () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it("Connect reaches connected; Emit calls socket.emit with parsed payload; unmount disconnects", async () => {
    const user = userEvent.setup();
    const socket = mockIo();

    const { unmount } = render(<SocketIoPanel />);

    await user.click(screen.getByRole("button", { name: "Connect" }));

    await waitFor(() => expect(ioMock).toHaveBeenCalledTimes(1));

    act(() => {
      socket.simulateConnect();
    });

    await waitFor(() => expect(screen.getByText("Connected")).toBeInTheDocument());

    await user.type(screen.getByLabelText("Emit event name"), "ping");
    fireEvent.change(screen.getByLabelText(/Payload \(JSON/), {
      target: { value: '{"k":true}' },
    });

    await user.click(screen.getByRole("button", { name: "Emit" }));

    await waitFor(() => {
      expect(socket.emit).toHaveBeenCalledWith("ping", { k: true });
    });

    unmount();
    expect(socket.disconnect).toHaveBeenCalled();
  });
});
