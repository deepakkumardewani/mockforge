import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { GraphqlRequestBar } from "@/components/playground/graphql/GraphqlRequestBar";

describe("GraphqlRequestBar", () => {
  const defaultProps = {
    endpointUrl: "https://api.mockforge.dev/graphql",
    onSend: vi.fn(),
    isLoading: false,
    schemaOpen: false,
    onToggleSchema: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("shows POST and the read-only endpoint URL", () => {
    render(<GraphqlRequestBar {...defaultProps} />);
    expect(screen.getByText("POST")).toBeInTheDocument();
    expect(screen.getByLabelText("GraphQL endpoint URL")).toHaveValue(
      "https://api.mockforge.dev/graphql",
    );
  });

  it("calls onSend when Send is clicked", async () => {
    const user = userEvent.setup();
    const onSend = vi.fn();
    render(<GraphqlRequestBar {...defaultProps} onSend={onSend} />);

    await user.click(screen.getByRole("button", { name: /send/i }));
    expect(onSend).toHaveBeenCalledTimes(1);
  });

  it("disables Send while loading and shows Sending…", () => {
    render(<GraphqlRequestBar {...defaultProps} isLoading />);
    const send = screen.getByRole("button", { name: /sending/i });
    expect(send).toBeDisabled();
    expect(screen.queryByText("⌘↵")).not.toBeInTheDocument();
  });

  it("disables Send when canSend is false", () => {
    render(<GraphqlRequestBar {...defaultProps} canSend={false} />);
    expect(screen.getByRole("button", { name: /send/i })).toBeDisabled();
  });

  it("toggles schema sidebar and reflects pressed state", async () => {
    const user = userEvent.setup();
    const onToggleSchema = vi.fn();
    const { rerender } = render(
      <GraphqlRequestBar {...defaultProps} onToggleSchema={onToggleSchema} schemaOpen={false} />,
    );

    const schemaBtn = screen.getByRole("button", { name: "Toggle schema sidebar" });
    expect(schemaBtn).toHaveAttribute("aria-pressed", "false");

    await user.click(schemaBtn);
    expect(onToggleSchema).toHaveBeenCalledTimes(1);

    rerender(
      <GraphqlRequestBar {...defaultProps} onToggleSchema={onToggleSchema} schemaOpen={true} />,
    );
    expect(screen.getByRole("button", { name: "Toggle schema sidebar" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
  });
});
