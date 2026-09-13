import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ConnectionControls } from "@/components/playground/shared/ConnectionControls";
import { ConnectionUrlBar } from "@/components/playground/shared/ConnectionUrlBar";
import { NamespaceBar } from "@/components/playground/socketio/NamespaceBar";
import { EmitComposer } from "@/components/playground/socketio/EmitComposer";

beforeEach(() => {
  vi.clearAllMocks();
});

describe("ConnectionControls", () => {
  it("shows Connect when idle and calls onConnect", async () => {
    const user = userEvent.setup();
    const onConnect = vi.fn();
    const onDisconnect = vi.fn();
    render(<ConnectionControls status="idle" onConnect={onConnect} onDisconnect={onDisconnect} />);

    await user.click(screen.getByRole("button", { name: "Connect" }));
    expect(onConnect).toHaveBeenCalledTimes(1);
    expect(onDisconnect).not.toHaveBeenCalled();
  });

  it("shows Cancel when connecting and calls onDisconnect", async () => {
    const user = userEvent.setup();
    const onConnect = vi.fn();
    const onDisconnect = vi.fn();
    render(
      <ConnectionControls status="connecting" onConnect={onConnect} onDisconnect={onDisconnect} />,
    );

    await user.click(screen.getByRole("button", { name: "Cancel" }));
    expect(onDisconnect).toHaveBeenCalledTimes(1);
    expect(onConnect).not.toHaveBeenCalled();
  });

  it("shows Disconnect when connected and calls onDisconnect", async () => {
    const user = userEvent.setup();
    const onConnect = vi.fn();
    const onDisconnect = vi.fn();
    render(
      <ConnectionControls status="connected" onConnect={onConnect} onDisconnect={onDisconnect} />,
    );

    await user.click(screen.getByRole("button", { name: "Disconnect" }));
    expect(onDisconnect).toHaveBeenCalledTimes(1);
    expect(onConnect).not.toHaveBeenCalled();
  });

  it("shows Retry when errored and calls onConnect", async () => {
    const user = userEvent.setup();
    const onConnect = vi.fn();
    const onDisconnect = vi.fn();
    render(<ConnectionControls status="error" onConnect={onConnect} onDisconnect={onDisconnect} />);

    await user.click(screen.getByRole("button", { name: "Retry" }));
    expect(onConnect).toHaveBeenCalledTimes(1);
    expect(onDisconnect).not.toHaveBeenCalled();
  });
});

describe("ConnectionUrlBar", () => {
  it("renders the Connect to label and URL", () => {
    render(
      <ConnectionUrlBar
        url="wss://api.mockforge.dev/ws"
        status="idle"
        onConnect={vi.fn()}
        onDisconnect={vi.fn()}
      />,
    );

    expect(screen.getByText("Connect to")).toBeInTheDocument();
    expect(screen.getByText("wss://api.mockforge.dev/ws")).toBeInTheDocument();
  });

  it("renders optional meta under the URL", () => {
    render(
      <ConnectionUrlBar
        url="wss://api.mockforge.dev/ws"
        status="idle"
        onConnect={vi.fn()}
        onDisconnect={vi.fn()}
        meta="Listening for tick"
      />,
    );

    expect(screen.getByText("Listening for tick")).toBeInTheDocument();
  });

  it("omits the meta line when meta is not provided", () => {
    render(
      <ConnectionUrlBar
        url="wss://api.mockforge.dev/ws"
        status="idle"
        onConnect={vi.fn()}
        onDisconnect={vi.fn()}
      />,
    );

    expect(screen.queryByText(/Listening/)).not.toBeInTheDocument();
  });

  it("connects from the trailing controls", async () => {
    const user = userEvent.setup();
    const onConnect = vi.fn();
    render(
      <ConnectionUrlBar
        url="wss://api.mockforge.dev/ws"
        status="idle"
        onConnect={onConnect}
        onDisconnect={vi.fn()}
      />,
    );

    await user.click(screen.getByRole("button", { name: "Connect" }));
    expect(onConnect).toHaveBeenCalledTimes(1);
  });

  it("disconnects when already connected", async () => {
    const user = userEvent.setup();
    const onDisconnect = vi.fn();
    render(
      <ConnectionUrlBar
        url="wss://api.mockforge.dev/ws"
        status="connected"
        onConnect={vi.fn()}
        onDisconnect={onDisconnect}
      />,
    );

    await user.click(screen.getByRole("button", { name: "Disconnect" }));
    expect(onDisconnect).toHaveBeenCalledTimes(1);
  });
});

describe("NamespaceBar", () => {
  it("builds the endpoint from origin and namespace", () => {
    render(
      <NamespaceBar
        baseUrl="https://api.mockforge.dev/"
        namespace="chat"
        listenEvent="message"
        status="idle"
        onConnect={vi.fn()}
        onDisconnect={vi.fn()}
      />,
    );

    expect(screen.getByText("Connect to")).toBeInTheDocument();
    expect(screen.getByTitle("https://api.mockforge.dev/chat")).toHaveTextContent(
      "https://api.mockforge.dev/chat",
    );
    expect(screen.getByText("Listening for “message”")).toBeInTheDocument();
  });

  it("shows connection details including the default Engine.IO path", async () => {
    const user = userEvent.setup();
    render(
      <NamespaceBar
        baseUrl="https://api.mockforge.dev"
        namespace="/alerts"
        listenEvent="tick"
        status="idle"
        onConnect={vi.fn()}
        onDisconnect={vi.fn()}
      />,
    );

    await user.click(screen.getByText("Connection details"));
    expect(screen.getByText("Server origin")).toBeInTheDocument();
    expect(screen.getByText("https://api.mockforge.dev")).toBeInTheDocument();
    expect(screen.getByText("Namespace")).toBeInTheDocument();
    expect(screen.getByText("/alerts")).toBeInTheDocument();
    expect(screen.getByText("Engine.IO path")).toBeInTheDocument();
    expect(screen.getByText("/socket.io")).toBeInTheDocument();
  });

  it("falls back to the default Engine.IO path when the custom path is blank", async () => {
    const user = userEvent.setup();
    render(
      <NamespaceBar
        baseUrl="https://api.mockforge.dev"
        namespace="/alerts"
        listenEvent="tick"
        status="idle"
        enginePath="   "
        onConnect={vi.fn()}
        onDisconnect={vi.fn()}
      />,
    );

    await user.click(screen.getByText("Connection details"));
    expect(screen.getByText("/socket.io")).toBeInTheDocument();
  });

  it("renders a custom Engine.IO path", async () => {
    const user = userEvent.setup();
    render(
      <NamespaceBar
        baseUrl="https://api.mockforge.dev"
        namespace="/alerts"
        listenEvent="tick"
        status="idle"
        enginePath="/engine.io"
        onConnect={vi.fn()}
        onDisconnect={vi.fn()}
      />,
    );

    await user.click(screen.getByText("Connection details"));
    expect(screen.getByText("/engine.io")).toBeInTheDocument();
  });

  it("connects and disconnects through the status controls", async () => {
    const user = userEvent.setup();
    const onConnect = vi.fn();
    const onDisconnect = vi.fn();
    const { rerender } = render(
      <NamespaceBar
        baseUrl="https://api.mockforge.dev"
        namespace="/chat"
        listenEvent="message"
        status="idle"
        onConnect={onConnect}
        onDisconnect={onDisconnect}
      />,
    );

    await user.click(screen.getByRole("button", { name: "Connect" }));
    expect(onConnect).toHaveBeenCalledTimes(1);

    rerender(
      <NamespaceBar
        baseUrl="https://api.mockforge.dev"
        namespace="/chat"
        listenEvent="message"
        status="connected"
        onConnect={onConnect}
        onDisconnect={onDisconnect}
      />,
    );

    await user.click(screen.getByRole("button", { name: "Disconnect" }));
    expect(onDisconnect).toHaveBeenCalledTimes(1);
  });
});

describe("EmitComposer", () => {
  it("renders labels and the emit shortcut hint", () => {
    render(
      <EmitComposer
        eventName="subscribe"
        payloadJson="{}"
        canEmit
        emitError={null}
        onEventNameChange={vi.fn()}
        onPayloadChange={vi.fn()}
        onEmit={vi.fn()}
      />,
    );

    expect(screen.getByLabelText("Emit event name")).toBeInTheDocument();
    expect(screen.getByLabelText("Payload (JSON, optional)")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Emit/ })).toBeInTheDocument();
    expect(screen.getByText("⌘↵")).toBeInTheDocument();
  });

  it("notifies when the event name changes", async () => {
    const user = userEvent.setup();
    const onEventNameChange = vi.fn();
    render(
      <EmitComposer
        eventName=""
        payloadJson="{}"
        canEmit
        emitError={null}
        onEventNameChange={onEventNameChange}
        onPayloadChange={vi.fn()}
        onEmit={vi.fn()}
      />,
    );

    await user.type(screen.getByLabelText("Emit event name"), "join");
    expect(onEventNameChange).toHaveBeenCalled();
    expect(onEventNameChange).toHaveBeenCalledWith("j");
  });

  it("notifies when the payload changes", async () => {
    const user = userEvent.setup();
    const onPayloadChange = vi.fn();
    render(
      <EmitComposer
        eventName="subscribe"
        payloadJson=""
        canEmit
        emitError={null}
        onEventNameChange={vi.fn()}
        onPayloadChange={onPayloadChange}
        onEmit={vi.fn()}
      />,
    );

    await user.type(screen.getByLabelText("Payload (JSON, optional)"), "x");
    expect(onPayloadChange).toHaveBeenCalledWith("x");
  });

  it("emits when connected and the event name is present", async () => {
    const user = userEvent.setup();
    const onEmit = vi.fn();
    render(
      <EmitComposer
        eventName="subscribe"
        payloadJson="{}"
        canEmit
        emitError={null}
        onEventNameChange={vi.fn()}
        onPayloadChange={vi.fn()}
        onEmit={onEmit}
      />,
    );

    await user.click(screen.getByRole("button", { name: /Emit/ }));
    expect(onEmit).toHaveBeenCalledTimes(1);
  });

  it("disables emit and the event field when canEmit is false", () => {
    render(
      <EmitComposer
        eventName="subscribe"
        payloadJson="{}"
        canEmit={false}
        emitError={null}
        onEventNameChange={vi.fn()}
        onPayloadChange={vi.fn()}
        onEmit={vi.fn()}
      />,
    );

    expect(screen.getByLabelText("Emit event name")).toBeDisabled();
    expect(screen.getByRole("button", { name: /Emit/ })).toBeDisabled();
  });

  it("disables emit when the event name is only whitespace", () => {
    render(
      <EmitComposer
        eventName="   "
        payloadJson="{}"
        canEmit
        emitError={null}
        onEventNameChange={vi.fn()}
        onPayloadChange={vi.fn()}
        onEmit={vi.fn()}
      />,
    );

    expect(screen.getByRole("button", { name: /Emit/ })).toBeDisabled();
  });

  it("surfaces emit errors", () => {
    render(
      <EmitComposer
        eventName="subscribe"
        payloadJson="{"
        canEmit
        emitError="Payload must be valid JSON"
        onEventNameChange={vi.fn()}
        onPayloadChange={vi.fn()}
        onEmit={vi.fn()}
      />,
    );

    expect(screen.getByRole("alert")).toHaveTextContent("Payload must be valid JSON");
  });
});
