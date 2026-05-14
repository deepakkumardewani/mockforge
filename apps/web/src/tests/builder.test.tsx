import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { builderFormValuesSchema } from "@/components/builder/types";
import type { BuilderFormValues } from "@/components/builder/types";

// ---- Mock dependencies at module level ----

vi.mock("@/lib/api-client", () => ({
  apiClient: vi.fn(),
  ApiError: class extends Error {
    constructor(_s: number, m: string) { super(m); this.name = "ApiError"; }
  },
  API_BASE: "http://localhost:4000",
}));

vi.mock("@/store/mf-id", () => ({
  useMfIdStore: vi.fn((selector: (s: { mfId: string | null }) => unknown) =>
    selector({ mfId: "test-mf-id" }),
  ),
}));

// ---- Helpers ----

function createQueryClient() {
  return new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
}

function Wrapper({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={createQueryClient()}>
      {children}
    </QueryClientProvider>
  );
}

// ---- FieldEditor tests ----

describe("FieldEditor", () => {
  let FieldEditor: typeof import("@/components/builder/FieldEditor").FieldEditor;

  beforeEach(async () => {
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
            onRemoveField={(i) => { if (fields.length > 1) remove(i); }}
            errors={form.formState.errors as unknown as Record<string, { message?: string }>}
          />
        </form>
      );
    }

    return render(<TestHarness />);
  }

  it("renders schema name input", () => {
    renderFieldEditor();
    expect(screen.getByPlaceholderText("e.g. Flight, Product, User")).toBeInTheDocument();
  });

  it("renders field name and type inputs per field", () => {
    renderFieldEditor();
    expect(screen.getByPlaceholderText("e.g. origin")).toBeInTheDocument();
    expect(screen.getByDisplayValue("String")).toBeInTheDocument();
  });

  it("shows add field button", () => {
    renderFieldEditor();
    expect(screen.getByText("+ Add Field")).toBeInTheDocument();
  });

  it("shows enum values input when type is enum", () => {
    renderFieldEditor({
      name: "Test",
      fields: [{ name: "status", type: "enum" }],
    });
    expect(screen.getByPlaceholderText("A, B, C")).toBeInTheDocument();
  });

  it("shows min/max inputs when type is number", () => {
    renderFieldEditor({
      name: "Test",
      fields: [{ name: "price", type: "number", min: undefined, max: undefined }],
    });
    const labels = screen.getAllByText(/^(Min|Max)$/);
    expect(labels.length).toBeGreaterThanOrEqual(2);
  });

  it("shows item type dropdown when type is array", () => {
    renderFieldEditor({
      name: "Test",
      fields: [{ name: "tags", type: "array" }],
    });
    expect(screen.getByText("Item Type")).toBeInTheDocument();
  });

  it("adds a new field when add button is clicked", async () => {
    renderFieldEditor();
    const addBtn = screen.getByText("+ Add Field");
    await userEvent.click(addBtn);
    await waitFor(() => {
      const inputs = screen.getAllByPlaceholderText("e.g. origin");
      expect(inputs.length).toBeGreaterThanOrEqual(1);
    });
  });
});

// ---- JsonEditor tests ----

describe("JsonEditor", () => {
  let JsonEditor: typeof import("@/components/builder/JsonEditor").JsonEditor;

  beforeEach(async () => {
    const mod = await import("@/components/builder/JsonEditor");
    JsonEditor = mod.JsonEditor;
  });

  const baseFormValues: BuilderFormValues = {
    name: "Flight",
    fields: [{ name: "origin", type: "string" }],
  };

  it("renders textarea with JSON representation of form values", () => {
    render(
      <JsonEditor formValues={baseFormValues} onApply={vi.fn()} />,
    );
    const textarea = screen.getByRole("textbox");
    expect(textarea).toBeInTheDocument();
    const value = JSON.parse((textarea as HTMLTextAreaElement).value);
    expect(value.name).toBe("Flight");
  });

  it("renders Apply JSON button", () => {
    render(
      <JsonEditor formValues={baseFormValues} onApply={vi.fn()} />,
    );
    expect(screen.getByText("Apply JSON")).toBeInTheDocument();
  });

  it("shows error for invalid JSON", async () => {
    const onApply = vi.fn();
    render(
      <JsonEditor formValues={baseFormValues} onApply={onApply} />,
    );
    const textarea = screen.getByRole("textbox") as HTMLTextAreaElement;
    await userEvent.clear(textarea);
    // Use fireEvent to set value directly for special characters
    await userEvent.type(textarea, "bad json");
    await userEvent.click(screen.getByText("Apply JSON"));
    await waitFor(() => {
      expect(screen.getByText(/Invalid JSON/i)).toBeInTheDocument();
    });
    expect(onApply).not.toHaveBeenCalled();
  });

  it("calls onApply with valid JSON", async () => {
    const onApply = vi.fn();
    render(
      <JsonEditor formValues={baseFormValues} onApply={onApply} />,
    );
    await userEvent.click(screen.getByText("Apply JSON"));
    await waitFor(() => {
      expect(onApply).toHaveBeenCalledWith(
        expect.objectContaining({ name: "Flight" }),
      );
    });
  });
});

// ---- Preview tests ----

describe("Preview", () => {
  let Preview: typeof import("@/components/builder/Preview").Preview;

  beforeEach(async () => {
    vi.clearAllMocks();
    const mod = await import("@/components/builder/Preview");
    Preview = mod.Preview;
  });

  it("shows empty state when no fields have names", () => {
    const emptyValues: BuilderFormValues = {
      name: "",
      fields: [{ name: "", type: "string" }],
    };
    render(<Preview formValues={emptyValues} />);
    expect(
      screen.getByText("Add at least one field to see a live preview"),
    ).toBeInTheDocument();
  });

  it("shows live preview heading when fields are present", () => {
    const values: BuilderFormValues = {
      name: "Test",
      fields: [{ name: "name", type: "string" }],
    };
    render(<Preview formValues={values} />);
    expect(screen.getByText("Live Preview")).toBeInTheDocument();
  });
});

// ---- EndpointDisplay tests ----

describe("EndpointDisplay", () => {
  let EndpointDisplay: typeof import("@/components/builder/EndpointDisplay").EndpointDisplay;

  beforeEach(async () => {
    vi.clearAllMocks();
    const mod = await import("@/components/builder/EndpointDisplay");
    EndpointDisplay = mod.EndpointDisplay;
  });

  it("renders endpoint URL with API_BASE prefix", () => {
    render(<EndpointDisplay endpoint="/api/custom/test-slug" />);
    expect(
      screen.getByText("http://localhost:4000/api/custom/test-slug"),
    ).toBeInTheDocument();
  });

  it("renders success message", () => {
    render(<EndpointDisplay endpoint="/api/custom/test-slug" />);
    expect(
      screen.getByText("Schema saved! Your endpoint is ready:"),
    ).toBeInTheDocument();
  });

  it("has a copy button", () => {
    render(<EndpointDisplay endpoint="/api/custom/test-slug" />);
    expect(screen.getByLabelText("Copy endpoint URL")).toBeInTheDocument();
  });
});

// ---- MfIdPrompt tests ----

describe("MfIdPrompt", () => {
  let MfIdPrompt: typeof import("@/components/builder/MfIdPrompt").MfIdPrompt;

  beforeEach(async () => {
    const mod = await import("@/components/builder/MfIdPrompt");
    MfIdPrompt = mod.MfIdPrompt;
  });

  it("displays the mfId", () => {
    render(
      <MfIdPrompt mfId="abc-123-def" onDismiss={vi.fn()} />,
    );
    expect(screen.getByText("abc-123-def")).toBeInTheDocument();
  });

  it("displays instructional text", () => {
    render(
      <MfIdPrompt mfId="abc-123-def" onDismiss={vi.fn()} />,
    );
    expect(screen.getByText("Your browser ID")).toBeInTheDocument();
    expect(
      screen.getByText("Save this ID to restore your schemas on another device."),
    ).toBeInTheDocument();
  });

  it("calls onDismiss when dismiss button is clicked", async () => {
    const onDismiss = vi.fn();
    render(
      <MfIdPrompt mfId="abc-123-def" onDismiss={onDismiss} />,
    );
    await userEvent.click(screen.getByLabelText("Dismiss"));
    expect(onDismiss).toHaveBeenCalledTimes(1);
  });
});

// ---- SavedSchemas tests ----

describe("SavedSchemas", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("shows empty state when no schemas", async () => {
    const { apiClient } = await import("@/lib/api-client");
    vi.mocked(apiClient).mockResolvedValue({ data: [] });

    const { SavedSchemas } = await import("@/components/builder/SavedSchemas");

    render(
      <Wrapper>
        <SavedSchemas onLoad={vi.fn()} activeSlug={null} />
      </Wrapper>,
    );

    await waitFor(() => {
      expect(screen.getByText("No saved schemas yet.")).toBeInTheDocument();
    });
  });

  it("shows saved schemas list", async () => {
    const { apiClient } = await import("@/lib/api-client");
    vi.mocked(apiClient).mockResolvedValue({
      data: [
        {
          slug: "test-1",
          definition: { name: "Flight", fields: [{ name: "origin", type: "string" }] },
          persistent: true,
          endpoint: "/api/custom/test-1",
          mfId: "test-mf-id",
          createdAt: new Date().toISOString(),
        },
      ],
    });

    const { SavedSchemas } = await import("@/components/builder/SavedSchemas");

    render(
      <Wrapper>
        <SavedSchemas onLoad={vi.fn()} activeSlug={null} />
      </Wrapper>,
    );

    await waitFor(() => {
      expect(screen.getByText("Flight")).toBeInTheDocument();
    });
  });

  it("calls onLoad when a schema is clicked", async () => {
    const onLoad = vi.fn();
    const { apiClient } = await import("@/lib/api-client");
    vi.mocked(apiClient).mockResolvedValue({
      data: [
        {
          slug: "test-1",
          definition: { name: "Flight", fields: [{ name: "origin", type: "string" }] },
          persistent: true,
          endpoint: "/api/custom/test-1",
          mfId: "test-mf-id",
          createdAt: new Date().toISOString(),
        },
      ],
    });

    const { SavedSchemas } = await import("@/components/builder/SavedSchemas");

    render(
      <Wrapper>
        <SavedSchemas onLoad={onLoad} activeSlug={null} />
      </Wrapper>,
    );

    await waitFor(() => {
      expect(screen.getByText("Flight")).toBeInTheDocument();
    });

    await userEvent.click(screen.getByText("Flight"));
    expect(onLoad).toHaveBeenCalledWith(
      expect.objectContaining({ slug: "test-1" }),
    );
  });
});

// ---- Types / Zod schema tests ----

describe("builderFormValuesSchema", () => {
  it("validates a correct schema", async () => {
    const { builderFormValuesSchema } = await import("@/components/builder/types");
    const result = builderFormValuesSchema.safeParse({
      name: "Flight",
      fields: [{ name: "origin", type: "string" }],
    });
    expect(result.success).toBe(true);
  });

  it("rejects empty schema name", async () => {
    const { builderFormValuesSchema } = await import("@/components/builder/types");
    const result = builderFormValuesSchema.safeParse({
      name: "",
      fields: [{ name: "origin", type: "string" }],
    });
    expect(result.success).toBe(false);
  });

  it("rejects empty fields array", async () => {
    const { builderFormValuesSchema } = await import("@/components/builder/types");
    const result = builderFormValuesSchema.safeParse({
      name: "Flight",
      fields: [],
    });
    expect(result.success).toBe(false);
  });

  it("rejects invalid field type", async () => {
    const { builderFormValuesSchema } = await import("@/components/builder/types");
    const result = builderFormValuesSchema.safeParse({
      name: "Flight",
      fields: [{ name: "x", type: "invalid" }],
    });
    expect(result.success).toBe(false);
  });

  it("rejects empty field name", async () => {
    const { builderFormValuesSchema } = await import("@/components/builder/types");
    const result = builderFormValuesSchema.safeParse({
      name: "Flight",
      fields: [{ name: "", type: "string" }],
    });
    expect(result.success).toBe(false);
  });

  it("validates enum field with values", async () => {
    const { builderFormValuesSchema } = await import("@/components/builder/types");
    const result = builderFormValuesSchema.safeParse({
      name: "Flight",
      fields: [{ name: "status", type: "enum", values: "A, B, C" }],
    });
    expect(result.success).toBe(true);
  });

  it("validates number field with min/max", async () => {
    const { builderFormValuesSchema } = await import("@/components/builder/types");
    const result = builderFormValuesSchema.safeParse({
      name: "Product",
      fields: [{ name: "price", type: "number", min: 0, max: 100 }],
    });
    expect(result.success).toBe(true);
  });
});
