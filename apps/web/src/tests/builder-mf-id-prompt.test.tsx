import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MfIdPrompt } from "@/components/builder/MfIdPrompt";

describe("MfIdPrompt", () => {
  it("shows the recovery key and guidance", () => {
    render(<MfIdPrompt mfId="abc-123-def" onDismiss={vi.fn()} />);
    expect(screen.getByText("abc-123-def")).toBeInTheDocument();
    expect(screen.getByText("Recovery key")).toBeInTheDocument();
    expect(screen.getByText(/keep this key private/i)).toBeInTheDocument();
  });

  it("calls onDismiss when the dismiss control is activated", async () => {
    const user = userEvent.setup();
    const onDismiss = vi.fn();
    render(<MfIdPrompt mfId="abc-123-def" onDismiss={onDismiss} />);
    await user.click(screen.getByLabelText("Dismiss"));
    expect(onDismiss).toHaveBeenCalledTimes(1);
  });
});
