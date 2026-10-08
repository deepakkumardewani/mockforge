import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { mockMatchMedia } from "./landing-test-helpers";

vi.mock("gsap", () => ({
  default: {
    registerPlugin: vi.fn(),
    context: vi.fn(() => ({ revert: vi.fn() })),
    fromTo: vi.fn(),
  },
}));

vi.mock("gsap/ScrollTrigger", () => ({
  ScrollTrigger: {},
}));

const fetchMock = vi.fn();

beforeEach(() => {
  vi.clearAllMocks();
  mockMatchMedia(false);
  vi.stubGlobal("fetch", fetchMock);
});

describe("LiveDemo", () => {
  it("shows idle sample shape for the default Products tab", async () => {
    const { LiveDemo } = await import("@/components/landing/LiveDemo");
    render(<LiveDemo />);
    expect(screen.getByText(/sample shape/i)).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: "Products" })).toHaveAttribute("aria-selected", "true");
  });

  it("switches endpoint tab and updates tabpanel labeling", async () => {
    const user = userEvent.setup();
    const { LiveDemo } = await import("@/components/landing/LiveDemo");
    render(<LiveDemo />);
    await user.click(screen.getByRole("tab", { name: "Users" }));
    expect(screen.getByRole("tab", { name: "Users" })).toHaveAttribute("aria-selected", "true");
    expect(screen.getByRole("tabpanel")).toHaveAttribute("aria-labelledby", "livedemo-tab-users");
  });

  it("runs a live request and shows success status", async () => {
    const user = userEvent.setup();
    fetchMock.mockResolvedValueOnce({
      status: 200,
      json: async () => ({ data: [{ id: 1 }], total: 1, limit: 3, skip: 0 }),
    });

    const { LiveDemo } = await import("@/components/landing/LiveDemo");
    render(<LiveDemo />);
    await user.click(screen.getByRole("button", { name: /run request/i }));

    expect(await screen.findByText(/live response/i)).toBeInTheDocument();
    expect(fetchMock).toHaveBeenCalled();
  });

  it("shows an error alert when fetch fails", async () => {
    const user = userEvent.setup();
    fetchMock.mockRejectedValueOnce(new Error("offline"));

    const { LiveDemo } = await import("@/components/landing/LiveDemo");
    render(<LiveDemo />);
    await user.click(screen.getByRole("button", { name: /run request/i }));

    expect(await screen.findByRole("alert")).toHaveTextContent(/could not reach the mock api/i);
  });

  it("shows requests served count when prop is provided", async () => {
    const { LiveDemo } = await import("@/components/landing/LiveDemo");
    render(<LiveDemo requestsServed={9876} />);
    expect(screen.getByText(/requests served: 9,876/i)).toBeInTheDocument();
  });

  it("copies JSON after a successful response", async () => {
    const user = userEvent.setup();
    const writeText = vi.fn().mockResolvedValue(undefined);
    vi.stubGlobal("navigator", { clipboard: { writeText } });

    fetchMock.mockResolvedValueOnce({
      status: 200,
      json: async () => ({ ok: true }),
    });

    const { LiveDemo } = await import("@/components/landing/LiveDemo");
    render(<LiveDemo />);
    await user.click(screen.getByRole("button", { name: /run request/i }));
    await screen.findByText(/live response/i);
    await user.click(screen.getByRole("button", { name: /copy json/i }));

    await waitFor(() => {
      expect(writeText).toHaveBeenCalledWith(expect.stringContaining('"ok": true'));
    });
    expect(screen.getByText("Copied")).toBeInTheDocument();
  });
});
