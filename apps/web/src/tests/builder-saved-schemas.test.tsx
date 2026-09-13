import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { SavedSchema } from "@/components/builder/types";

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

vi.mock("@/store/mf-id", () => ({
  useMfIdStore: vi.fn((selector: (s: { mfId: string | null }) => unknown) =>
    selector({ mfId: "test-mf-id" }),
  ),
}));

function createQueryClient() {
  return new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
}

function Wrapper({ children }: { children: React.ReactNode }) {
  return <QueryClientProvider client={createQueryClient()}>{children}</QueryClientProvider>;
}

const flightSchema: SavedSchema = {
  slug: "test-1",
  definition: { name: "Flight", fields: [{ name: "origin", type: "string" }] },
  persistent: true,
  endpoint: "/api/custom/test-1",
  mfId: "test-mf-id",
  createdAt: new Date().toISOString(),
};

const notesSchema: SavedSchema = {
  slug: "notes",
  definition: {
    name: "Notes",
    fields: [
      { name: "title", type: "string" },
      { name: "body", type: "string" },
    ],
  },
  persistent: false,
  endpoint: "/api/custom/notes",
  mfId: "test-mf-id",
  createdAt: new Date().toISOString(),
};

describe("SavedSchemas interactions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("shows empty state when the list is empty", async () => {
    const { apiClient } = await import("@/lib/api-client");
    vi.mocked(apiClient).mockResolvedValue({ data: [] });
    const { SavedSchemas } = await import("@/components/builder/SavedSchemas");

    render(
      <Wrapper>
        <SavedSchemas onLoad={vi.fn()} activeSlug={null} />
      </Wrapper>,
    );

    expect(await screen.findByText("No saved schemas yet.")).toBeInTheDocument();
  });

  it("shows empty state when the list request fails", async () => {
    const { apiClient } = await import("@/lib/api-client");
    vi.mocked(apiClient).mockRejectedValue(new Error("schemas unavailable"));
    const { SavedSchemas } = await import("@/components/builder/SavedSchemas");

    render(
      <Wrapper>
        <SavedSchemas onLoad={vi.fn()} activeSlug={null} />
      </Wrapper>,
    );

    expect(await screen.findByText("No saved schemas yet.")).toBeInTheDocument();
  });

  it("loads a schema and marks the active row", async () => {
    const onLoad = vi.fn();
    const { apiClient } = await import("@/lib/api-client");
    vi.mocked(apiClient).mockResolvedValue({ data: [flightSchema] });
    const { SavedSchemas } = await import("@/components/builder/SavedSchemas");

    render(
      <Wrapper>
        <SavedSchemas onLoad={onLoad} activeSlug="test-1" />
      </Wrapper>,
    );

    await userEvent.click(await screen.findByRole("button", { name: "Load Flight" }));
    expect(onLoad).toHaveBeenCalledWith(expect.objectContaining({ slug: "test-1" }));
    expect(screen.getByRole("button", { name: "Load Flight" })).toHaveAttribute(
      "aria-current",
      "true",
    );
    expect(screen.getByText(/1 field · persistent/)).toBeInTheDocument();
  });

  it("calls onNew when the new schema button is clicked", async () => {
    const onNew = vi.fn();
    const { apiClient } = await import("@/lib/api-client");
    vi.mocked(apiClient).mockResolvedValue({ data: [] });
    const { SavedSchemas } = await import("@/components/builder/SavedSchemas");

    render(
      <Wrapper>
        <SavedSchemas onLoad={vi.fn()} onNew={onNew} activeSlug={null} />
      </Wrapper>,
    );

    await userEvent.click(await screen.findByRole("button", { name: "+ New" }));
    expect(onNew).toHaveBeenCalledTimes(1);
  });

  it("cancels a pending delete confirmation", async () => {
    const { apiClient } = await import("@/lib/api-client");
    vi.mocked(apiClient).mockResolvedValue({ data: [notesSchema] });
    const { SavedSchemas } = await import("@/components/builder/SavedSchemas");

    render(
      <Wrapper>
        <SavedSchemas onLoad={vi.fn()} activeSlug={null} />
      </Wrapper>,
    );

    await userEvent.click(await screen.findByRole("button", { name: "Delete Notes" }));
    expect(screen.getByRole("group", { name: "Confirm delete Notes" })).toBeInTheDocument();
    expect(screen.getByText(/2 fields · ephemeral/)).toBeInTheDocument();

    await userEvent.click(screen.getByRole("button", { name: "Cancel" }));
    expect(screen.queryByRole("group", { name: "Confirm delete Notes" })).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Delete Notes" })).toBeInTheDocument();
  });

  it("confirms delete, notifies, and refetches the list", async () => {
    const onDeleted = vi.fn();
    const { apiClient } = await import("@/lib/api-client");
    vi.mocked(apiClient).mockImplementation(async (_path, init) => {
      if (init?.method === "DELETE") {
        return { deleted: true };
      }
      return { data: [flightSchema] };
    });
    const { SavedSchemas } = await import("@/components/builder/SavedSchemas");

    render(
      <Wrapper>
        <SavedSchemas onLoad={vi.fn()} activeSlug={null} onDeleted={onDeleted} />
      </Wrapper>,
    );

    await userEvent.click(await screen.findByRole("button", { name: "Delete Flight" }));
    await userEvent.click(screen.getByRole("button", { name: "Confirm delete" }));

    await waitFor(() => {
      expect(onDeleted).toHaveBeenCalledWith("test-1");
    });
    expect(apiClient).toHaveBeenCalledWith(
      "/api/schemas/test-1",
      { method: "DELETE" },
      "test-mf-id",
    );
    await waitFor(() => {
      expect(
        vi.mocked(apiClient).mock.calls.filter(([path]) => path === "/api/schemas").length,
      ).toBeGreaterThan(1);
    });
  });
});
