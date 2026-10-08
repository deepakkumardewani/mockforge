import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { builderFormValuesSchema } from "@/components/builder/types";
import type { BuilderFormValues } from "@/components/builder/types";

describe("FieldEditor", () => {
  let FieldEditor: typeof import("@/components/builder/FieldEditor").FieldEditor;

  beforeEach(async () => {
    vi.clearAllMocks();
    const mod = await import("@/components/builder/FieldEditor");
    FieldEditor = mod.FieldEditor;
  });

  function renderFieldEditor(defaultValues?: Partial<BuilderFormValues>) {
    function TestHarness() {
      const form = useForm<BuilderFormValues>({
        resolver: zodResolver(builderFormValuesSchema),
        defaultValues: (defaultValues ?? {
          name: "Test",
          fields: [{ name: "email", type: "string" }],
        }) as BuilderFormValues,
      });
      const { fields, append, remove } = useFieldArray({ control: form.control, name: "fields" });

      return (
        <form>
          <FieldEditor
            control={form.control}
            register={form.register}
            fields={fields}
            onAddField={() => append({ name: "", type: "string" })}
            onRemoveField={(i) => {
              if (fields.length > 1) remove(i);
            }}
            errors={form.formState.errors as unknown as Record<string, { message?: string }>}
          />
        </form>
      );
    }

    return render(<TestHarness />);
  }

  it("renders schema name and field inputs", () => {
    renderFieldEditor();
    expect(screen.getByLabelText("Schema name")).toBeInTheDocument();
    expect(screen.getByLabelText("Field name")).toBeInTheDocument();
    expect(screen.getByLabelText("Type")).toBeInTheDocument();
  });

  it("shows enum values when the field type is enum", () => {
    renderFieldEditor({
      name: "Order",
      fields: [{ name: "status", type: "enum", values: "draft, active" }],
    });
    expect(screen.getByPlaceholderText("draft, active, archived")).toBeInTheDocument();
  });

  it("adds another field row when Add field is clicked", async () => {
    const user = userEvent.setup();
    renderFieldEditor();
    await user.click(screen.getByRole("button", { name: /add field/i }));
    await waitFor(() => {
      expect(screen.getAllByLabelText("Field name").length).toBeGreaterThanOrEqual(2);
    });
  });
});
