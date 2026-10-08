import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, act } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { BuilderPreviewPane } from "@/components/builder/BuilderPreviewPane";
import { builderFormValuesSchema } from "@/components/builder/types";
import type { BuilderFormValues } from "@/components/builder/types";

function PreviewHarness({ defaults }: { defaults?: Partial<BuilderFormValues> }) {
  const form = useForm<BuilderFormValues>({
    resolver: zodResolver(builderFormValuesSchema),
    defaultValues: (defaults ?? {
      name: "Product",
      fields: [{ name: "", type: "string" }],
    }) as BuilderFormValues,
  });

  return (
    <form>
      <label htmlFor="field-name">Field name</label>
      <input id="field-name" {...form.register("fields.0.name")} aria-label="Field name" />
      <BuilderPreviewPane control={form.control} />
    </form>
  );
}

describe("BuilderPreviewPane", () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("shows the preview empty state before any field names exist", () => {
    render(<PreviewHarness />);
    expect(screen.getByText("Your sample response will appear here")).toBeInTheDocument();
  });

  it("updates the preview after debounced field input", async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    render(<PreviewHarness />);

    await user.type(screen.getByLabelText("Field name"), "sku");
    expect(screen.getByText("Your sample response will appear here")).toBeInTheDocument();

    await act(async () => {
      vi.advanceTimersByTime(160);
    });

    expect(screen.getByText(/sample record/i)).toBeInTheDocument();
    expect(screen.getByText(/"sku"/)).toBeInTheDocument();
  });
});
