import { describe, it, expect, vi } from "vitest";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { JsonEditor } from "@/components/builder/JsonEditor";
import type { BuilderFormValues } from "@/components/builder/types";

const baseFormValues: BuilderFormValues = {
  name: "Flight",
  fields: [{ name: "origin", type: "string" }],
};

describe("JsonEditor", () => {
  it("shows the current form values as JSON in the textarea", () => {
    render(<JsonEditor formValues={baseFormValues} onApply={vi.fn()} />);
    const textarea = screen.getByRole("textbox") as HTMLTextAreaElement;
    expect(JSON.parse(textarea.value).name).toBe("Flight");
  });

  it("shows an error and skips onApply for invalid JSON", async () => {
    const user = userEvent.setup();
    const onApply = vi.fn();
    render(<JsonEditor formValues={baseFormValues} onApply={onApply} />);
    const textarea = screen.getByRole("textbox") as HTMLTextAreaElement;
    fireEvent.change(textarea, { target: { value: "{not json" } });
    await user.click(screen.getByRole("button", { name: /apply and return to form/i }));
    await waitFor(() => {
      expect(screen.getByText(/Invalid JSON/i)).toBeInTheDocument();
    });
    expect(onApply).not.toHaveBeenCalled();
  });

  it("calls onApply with parsed values for valid JSON", async () => {
    const user = userEvent.setup();
    const onApply = vi.fn();
    render(<JsonEditor formValues={baseFormValues} onApply={onApply} />);
    await user.click(screen.getByRole("button", { name: /apply and return to form/i }));
    await waitFor(() => {
      expect(onApply).toHaveBeenCalledWith(expect.objectContaining({ name: "Flight" }));
    });
  });
});
