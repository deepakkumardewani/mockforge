import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

vi.mock("@/lib/api-client", () => ({
  apiClient: vi.fn(),
  ApiError: class extends Error {
    constructor(_s: number, m: string) {
      super(m);
      this.name = "ApiError";
    }
  },
  API_BASE: "http://localhost:4000",
}));

vi.mock("@/hooks/use-mf-id", () => ({
  useMfId: () => "test-mf-id",
}));

vi.mock("@/store/mf-id", () => ({
  useMfIdStore: vi.fn((selector: (s: { mfId: string | null }) => unknown) =>
    selector({ mfId: "test-mf-id" }),
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

function renderBuilderShell() {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={client}>
      <BuilderShell />
    </QueryClientProvider>,
  );
}

let BuilderShell: typeof import("@/components/builder/BuilderShell").BuilderShell;

describe("BuilderShell", () => {
  beforeEach(async () => {
    vi.clearAllMocks();
    polyfillDialog();
    const { apiClient } = await import("@/lib/api-client");
    vi.mocked(apiClient).mockResolvedValue({ data: [] });
    const mod = await import("@/components/builder/BuilderShell");
    BuilderShell = mod.BuilderShell;
  });

  it("renders the builder page header and schema section", async () => {
    renderBuilderShell();
    expect(screen.getByRole("heading", { name: /build a mock api/i })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Schema definition" })).toBeInTheDocument();
    expect(await screen.findByText("No saved schemas yet.")).toBeInTheDocument();
  });

  it("switches between Form and JSON editor modes", async () => {
    const user = userEvent.setup();
    renderBuilderShell();
    expect(screen.getByPlaceholderText("e.g. Flight, Product, User")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "JSON" }));
    expect(screen.getByRole("button", { name: /apply and return to form/i })).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Form" }));
    expect(screen.getByPlaceholderText("e.g. Flight, Product, User")).toBeInTheDocument();
  });

  it("prefills the Product starter example from an empty form", async () => {
    const user = userEvent.setup();
    renderBuilderShell();
    await user.click(screen.getByRole("button", { name: /prefill a product example/i }));
    expect(screen.getByDisplayValue("Product")).toBeInTheDocument();
    expect(screen.getByDisplayValue("name")).toBeInTheDocument();
  });

  it("toggles endpoint persistence between persistent and ephemeral", async () => {
    const user = userEvent.setup();
    renderBuilderShell();
    const persistent = screen.getByRole("button", { name: "Persistent" });
    const ephemeral = screen.getByRole("button", { name: "Ephemeral" });
    expect(persistent).toHaveAttribute("aria-pressed", "true");
    await user.click(ephemeral);
    expect(ephemeral).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByText(/temporary get endpoint/i)).toBeInTheDocument();
  });

  it("opens the recovery key dialog from the sidebar", async () => {
    const user = userEvent.setup();
    renderBuilderShell();
    await user.click(screen.getByRole("button", { name: "Recovery key" }));
    expect(screen.getByRole("heading", { name: /recovery key/i })).toBeInTheDocument();
  });

  it("creates an endpoint and shows the saved URL", async () => {
    const user = userEvent.setup();
    const { apiClient } = await import("@/lib/api-client");
    vi.mocked(apiClient).mockImplementation(async (path, init) => {
      if (path === "/api/schemas" && init?.method === "POST") {
        return { slug: "product-1", endpoint: "/api/custom/product-1" };
      }
      return { data: [] };
    });

    renderBuilderShell();
    await user.click(screen.getByRole("button", { name: /prefill a product example/i }));
    await user.click(screen.getByRole("button", { name: /create endpoint/i }));

    await waitFor(() => {
      expect(screen.getByText("Endpoint ready")).toBeInTheDocument();
    });
    expect(screen.getByText("http://localhost:4000/api/custom/product-1")).toBeInTheDocument();
  });
});
