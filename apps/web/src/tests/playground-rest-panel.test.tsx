import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { RestPanel } from "@/components/playground/rest/RestPanel";

vi.mock("@/hooks/use-mf-id", () => ({
  useMfId: () => null,
}));

describe("Playground REST — RestPanel", () => {
  beforeEach(() => {
    vi.stubGlobal("fetch", vi.fn());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it("preset populates inputs without calling fetch until Send", async () => {
    const user = userEvent.setup();
    vi.mocked(fetch).mockResolvedValue(
      new Response(JSON.stringify([{ id: 1 }]), { status: 200, statusText: "OK" }),
    );

    render(
      <QueryClientProvider
        client={new QueryClient({ defaultOptions: { mutations: { retry: false } } })}
      >
        <RestPanel />
      </QueryClientProvider>,
    );

    await user.click(screen.getByRole("button", { name: "List users" }));

    expect(screen.getByRole("textbox", { name: "Request URL" })).toHaveValue("/api/users");
    expect(vi.mocked(fetch)).not.toHaveBeenCalled();

    await user.click(screen.getByRole("button", { name: "Send" }));

    await waitFor(() => expect(vi.mocked(fetch)).toHaveBeenCalledTimes(1));
    expect(await screen.findByText("200")).toBeInTheDocument();
  });
});
