import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { SchemaRecoveryDialog } from "@/components/builder/SchemaRecoveryDialog";
import { DestructiveIconButton } from "@/components/builder/DestructiveIconButton";

const restoreMfId = vi.fn();

vi.mock("@/hooks/use-mf-id", () => ({
  restoreMfId: (raw: string) => restoreMfId(raw),
}));

vi.mock("@/store/mf-id", () => ({
  useMfIdStore: vi.fn((selector: (s: { mfId: string | null }) => unknown) =>
    selector({ mfId: "550e8400-e29b-41d4-a716-446655440000" }),
  ),
}));

function polyfillDialog() {
  HTMLDialogElement.prototype.showModal = function showModal() {
    this.setAttribute("open", "");
  };
  HTMLDialogElement.prototype.close = function close() {
    this.removeAttribute("open");
    this.dispatchEvent(new Event("close"));
  };
}

describe("SchemaRecoveryDialog", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    polyfillDialog();
    Object.defineProperty(navigator, "clipboard", {
      configurable: true,
      value: {
        writeText: vi.fn().mockResolvedValue(undefined),
        readText: vi.fn().mockResolvedValue("11111111-1111-4111-8111-111111111111"),
      },
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("keeps the dialog closed when open is false", () => {
    render(<SchemaRecoveryDialog open={false} onClose={vi.fn()} />);
    const dialog = document.querySelector("dialog");
    expect(dialog).toBeInTheDocument();
    expect(dialog).not.toHaveAttribute("open");
  });

  it("opens as a modal and labels the recovery heading", () => {
    render(<SchemaRecoveryDialog open onClose={vi.fn()} />);
    const dialog = document.querySelector("dialog");
    expect(dialog).toHaveAttribute("open");
    expect(dialog).toHaveAttribute("aria-labelledby", "recovery-key-heading");
    expect(screen.getByRole("heading", { name: /recovery key/i })).toBeInTheDocument();
    expect(screen.getByText("550e8400-e29b-41d4-a716-446655440000")).toBeInTheDocument();
  });

  it("closes when open flips from true to false", () => {
    const onClose = vi.fn();
    const { rerender } = render(<SchemaRecoveryDialog open onClose={onClose} />);
    expect(document.querySelector("dialog")).toHaveAttribute("open");

    rerender(<SchemaRecoveryDialog open={false} onClose={onClose} />);
    expect(document.querySelector("dialog")).not.toHaveAttribute("open");
    expect(onClose).toHaveBeenCalled();
  });

  it("calls onClose when Dismiss is clicked", async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    render(<SchemaRecoveryDialog open onClose={onClose} />);

    await user.click(screen.getByRole("button", { name: "Dismiss" }));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("calls onClose when the dialog is cancelled", () => {
    const onClose = vi.fn();
    render(<SchemaRecoveryDialog open onClose={onClose} />);

    document.querySelector("dialog")?.dispatchEvent(new Event("cancel", { bubbles: true }));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("pastes a recovery key from the clipboard", async () => {
    const user = userEvent.setup();
    Object.defineProperty(navigator, "clipboard", {
      configurable: true,
      value: {
        writeText: vi.fn().mockResolvedValue(undefined),
        readText: vi.fn().mockResolvedValue("11111111-1111-4111-8111-111111111111"),
      },
    });
    render(<SchemaRecoveryDialog open onClose={vi.fn()} />);

    await user.click(screen.getByRole("button", { name: "Paste" }));
    expect(await screen.findByRole("status")).toHaveTextContent(/pasted recovery key/i);
    expect(screen.getByLabelText(/restore from a recovery key/i)).toHaveValue(
      "11111111-1111-4111-8111-111111111111",
    );
  });

  it("restores a typed recovery key on confirm", async () => {
    const user = userEvent.setup();
    restoreMfId.mockReturnValue({ ok: true, mfId: "11111111-1111-4111-8111-111111111111" });
    render(<SchemaRecoveryDialog open onClose={vi.fn()} />);

    await user.type(
      screen.getByLabelText(/restore from a recovery key/i),
      "11111111-1111-4111-8111-111111111111",
    );
    await user.click(screen.getByRole("button", { name: "Restore" }));
    expect(restoreMfId).toHaveBeenCalledWith("11111111-1111-4111-8111-111111111111");
    expect(screen.getByRole("status")).toHaveTextContent(/recovery key restored/i);
  });

  it("shows an empty-state error when restore is confirmed with no key", async () => {
    const user = userEvent.setup();
    restoreMfId.mockReturnValue({ ok: false, error: "empty" });
    render(<SchemaRecoveryDialog open onClose={vi.fn()} />);

    await user.click(screen.getByRole("button", { name: "Restore" }));
    expect(restoreMfId).toHaveBeenCalledWith("");
    expect(screen.getByRole("alert")).toHaveTextContent(/paste a recovery key to restore/i);
  });

  it("shows an invalid-key error when restore is rejected", async () => {
    const user = userEvent.setup();
    restoreMfId.mockReturnValue({ ok: false, error: "invalid" });
    render(<SchemaRecoveryDialog open onClose={vi.fn()} />);

    await user.type(screen.getByLabelText(/restore from a recovery key/i), "not-a-uuid");
    await user.click(screen.getByRole("button", { name: "Restore" }));
    expect(screen.getByRole("alert")).toHaveTextContent(/enter a valid uuid recovery key/i);
  });

  it("copies the displayed recovery key", async () => {
    const user = userEvent.setup();
    render(<SchemaRecoveryDialog open onClose={vi.fn()} />);

    await user.click(screen.getByRole("button", { name: "Copy recovery key" }));
    expect(
      screen.getByRole("button", { name: "Copied recovery key to clipboard" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("status")).toHaveTextContent(/recovery key copied to clipboard/i);
  });
});

describe("DestructiveIconButton", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("exposes the label as the accessible name and title", () => {
    render(<DestructiveIconButton label="Delete schema" onClick={vi.fn()} />);
    const button = screen.getByRole("button", { name: "Delete schema" });
    expect(button).toHaveAttribute("title", "Delete schema");
    expect(button).toBeEnabled();
  });

  it("calls onClick when pressed", async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(<DestructiveIconButton label="Delete field" onClick={onClick} />);

    await user.click(screen.getByRole("button", { name: "Delete field" }));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("does not fire onClick when disabled", async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(<DestructiveIconButton label="Delete field" onClick={onClick} disabled />);

    const button = screen.getByRole("button", { name: "Delete field" });
    expect(button).toBeDisabled();
    await user.click(button);
    expect(onClick).not.toHaveBeenCalled();
  });

  it("can be hidden from the layout", () => {
    const { container } = render(
      <DestructiveIconButton label="Delete field" onClick={vi.fn()} hidden />,
    );
    const button = container.querySelector('button[aria-label="Delete field"]');
    expect(button).toHaveAttribute("hidden");
  });
});
