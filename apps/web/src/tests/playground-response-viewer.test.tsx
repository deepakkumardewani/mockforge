import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ResponseViewer } from "@/components/playground/shared/ResponseViewer";
import type { HttpResponseData } from "@/components/playground/hooks/timed-fetch";

const jsonResponse: HttpResponseData = {
  status: 200,
  statusText: "OK",
  timeMs: 12,
  headers: { "content-type": "application/json", "x-test": "1" },
  body: { ok: true, count: 2 },
};

const writeText = vi.fn().mockResolvedValue(undefined);

describe("Playground ResponseViewer", () => {
  beforeEach(() => {
    writeText.mockReset();
    writeText.mockResolvedValue(undefined);
    Object.defineProperty(navigator, "clipboard", {
      configurable: true,
      value: { writeText },
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("shows the empty state when no response has arrived", () => {
    render(<ResponseViewer response={null} />);

    expect(screen.getByText("Send a request to see the response")).toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: "Response" })).not.toBeInTheDocument();
  });

  it("shows Empty body when the payload is null", () => {
    render(
      <ResponseViewer
        response={{
          status: 204,
          statusText: "No Content",
          timeMs: 8,
          headers: {},
          body: null,
        }}
      />,
    );

    expect(screen.getByText("Empty body")).toBeInTheDocument();
    expect(screen.getByText(/B$/)).toBeInTheDocument();
  });

  it("renders formatted JSON and a transport error alert", () => {
    render(<ResponseViewer response={jsonResponse} transportError="Network failed" />);

    expect(screen.getByRole("heading", { name: "Response" })).toBeInTheDocument();
    expect(screen.getByText('"ok"')).toBeInTheDocument();
    expect(screen.getByText("true")).toBeInTheDocument();
    expect(screen.getByRole("alert")).toHaveTextContent("Network failed");
    expect(screen.getByText(/12/)).toBeInTheDocument();
    expect(screen.getByText("OK")).toBeInTheDocument();
  });

  it("formats large string bodies in kilobytes", () => {
    const large = "a".repeat(2048);
    render(
      <ResponseViewer
        response={{
          status: 200,
          statusText: "OK",
          timeMs: 3,
          headers: {},
          body: large,
        }}
      />,
    );

    expect(screen.getByText(/KB$/)).toBeInTheDocument();
  });

  it("copies pretty-printed JSON to the clipboard", async () => {
    render(<ResponseViewer response={jsonResponse} />);

    fireEvent.click(screen.getByRole("button", { name: "Copy JSON" }));
    await act(async () => {
      await Promise.resolve();
    });

    expect(writeText).toHaveBeenCalledWith(JSON.stringify(jsonResponse.body, null, 2));
    expect(screen.getByRole("button", { name: "Copied" })).toBeInTheDocument();
  });

  it("copies a curl command when restRequest is provided", async () => {
    render(
      <ResponseViewer
        response={jsonResponse}
        restRequest={{
          method: "POST",
          url: "https://api.example.test/users",
          headers: { "content-type": "application/json" },
          body: '{"name":"Ada"}',
        }}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Copy as curl" }));
    await act(async () => {
      await Promise.resolve();
    });

    expect(writeText).toHaveBeenCalledTimes(1);
    const copied = writeText.mock.calls[0][0];
    expect(copied).toContain("curl");
    expect(copied).toContain("https://api.example.test/users");
    expect(copied).toContain("POST");
  });

  it("surfaces a copy failure from the clipboard API", async () => {
    writeText.mockRejectedValueOnce(new Error("denied"));
    render(<ResponseViewer response={jsonResponse} />);

    fireEvent.click(screen.getByRole("button", { name: "Copy JSON" }));
    await act(async () => {
      await Promise.resolve();
    });

    expect(screen.getByRole("alert")).toHaveTextContent("denied");
  });

  it("surfaces a generic copy failure for non-Error rejections", async () => {
    writeText.mockRejectedValueOnce("blocked");
    render(<ResponseViewer response={jsonResponse} />);

    fireEvent.click(screen.getByRole("button", { name: "Copy JSON" }));
    await act(async () => {
      await Promise.resolve();
    });

    expect(screen.getByRole("alert")).toHaveTextContent("Copy failed");
  });

  it("reveals response headers in the details panel", async () => {
    const user = userEvent.setup();
    render(<ResponseViewer response={jsonResponse} />);

    await user.click(screen.getByText("Response headers"));

    await waitFor(() => {
      expect(screen.getByText('"x-test"')).toBeInTheDocument();
    });
  });
});
