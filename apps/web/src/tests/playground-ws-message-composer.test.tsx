import { describe, it, expect, vi, beforeEach } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MessageComposer } from "@/components/playground/ws/MessageComposer";

describe("MessageComposer", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders a message JSON field and Send control", () => {
    render(<MessageComposer value='{"type":"ping"}' onChange={vi.fn()} onSend={vi.fn()} canSend />);
    expect(screen.getByLabelText("Message")).toHaveValue('{"type":"ping"}');
    expect(screen.getByRole("button", { name: /send/i })).toBeInTheDocument();
  });

  it("disables Send when canSend is false", () => {
    render(
      <MessageComposer
        value='{"type":"ping"}'
        onChange={vi.fn()}
        onSend={vi.fn()}
        canSend={false}
      />,
    );
    expect(screen.getByRole("button", { name: /send/i })).toBeDisabled();
  });

  it("disables Send when the message is whitespace only", () => {
    render(<MessageComposer value="   " onChange={vi.fn()} onSend={vi.fn()} canSend />);
    expect(screen.getByRole("button", { name: /send/i })).toBeDisabled();
  });

  it("calls onSend when Send is clicked with a non-empty message", async () => {
    const user = userEvent.setup();
    const onSend = vi.fn();
    render(<MessageComposer value='{"type":"ping"}' onChange={vi.fn()} onSend={onSend} canSend />);

    await user.click(screen.getByRole("button", { name: /send/i }));
    expect(onSend).toHaveBeenCalledTimes(1);
  });

  it("calls onChange when the message text changes", async () => {
    const onChange = vi.fn();
    render(<MessageComposer value="" onChange={onChange} onSend={vi.fn()} canSend />);

    fireEvent.change(screen.getByLabelText("Message"), {
      target: { value: '{"type":"ping"}' },
    });
    expect(onChange).toHaveBeenCalledWith('{"type":"ping"}');
  });
});
