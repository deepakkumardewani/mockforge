import { describe, it, expect, vi, beforeEach } from "vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { VariablesEditor } from "@/components/playground/graphql/VariablesEditor";

describe("VariablesEditor", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders the variables JSON field inside a labeled region", () => {
    render(<VariablesEditor value="{}" onChange={vi.fn()} onValidityChange={vi.fn()} />);
    expect(screen.getByRole("region", { name: "GraphQL variables" })).toBeInTheDocument();
    expect(screen.getByLabelText("GraphQL variables JSON")).toHaveValue("{}");
  });

  it("reports valid JSON to onValidityChange", async () => {
    const onValidityChange = vi.fn();
    render(<VariablesEditor value="{}" onChange={vi.fn()} onValidityChange={onValidityChange} />);
    await waitFor(() => expect(onValidityChange).toHaveBeenCalledWith(true));
  });

  it("shows an alert when JSON is invalid", async () => {
    const onValidityChange = vi.fn();
    render(<VariablesEditor value="{bad" onChange={vi.fn()} onValidityChange={onValidityChange} />);
    expect(screen.getByRole("alert")).toHaveTextContent(/invalid json/i);
    await waitFor(() => expect(onValidityChange).toHaveBeenCalledWith(false));
  });

  it("calls onChange when the user edits variables", async () => {
    const onChange = vi.fn();
    render(<VariablesEditor value="" onChange={onChange} onValidityChange={vi.fn()} />);

    fireEvent.change(screen.getByLabelText("GraphQL variables JSON"), {
      target: { value: '{"id":1}' },
    });
    expect(onChange).toHaveBeenCalledWith('{"id":1}');
  });
});
