import { describe, it, expect, vi, beforeEach } from "vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { EndpointDisplay } from "@/components/builder/EndpointDisplay";

vi.mock("@/lib/api-client", () => ({
  API_BASE: "http://localhost:4000",
}));

describe("EndpointDisplay copy and empty endpoints", () => {
  const writeText = vi.fn();

  beforeEach(() => {
    writeText.mockReset();
    writeText.mockResolvedValue(undefined);
    Object.defineProperty(navigator, "clipboard", {
      configurable: true,
      value: { writeText },
    });
  });

  it("copies a relative endpoint as an absolute URL", async () => {
    render(<EndpointDisplay endpoint="/api/custom/demo" />);

    fireEvent.click(screen.getByRole("button", { name: "Copy endpoint URL" }));

    await waitFor(() => {
      expect(writeText).toHaveBeenCalledWith("http://localhost:4000/api/custom/demo");
    });
    expect(await screen.findByRole("button", { name: "Endpoint URL copied" })).toBeInTheDocument();
  });

  it("copies the curl sample and leaves an empty endpoint as the API base", async () => {
    render(<EndpointDisplay endpoint="" />);

    expect(screen.getByText("http://localhost:4000")).toBeInTheDocument();
    expect(screen.getByText('curl "http://localhost:4000?limit=5&skip=0"')).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Copy curl example" }));
    await waitFor(() => {
      expect(writeText).toHaveBeenCalledWith('curl "http://localhost:4000?limit=5&skip=0"');
    });
    expect(await screen.findByRole("button", { name: "Curl example copied" })).toBeInTheDocument();
  });

  it("renders an already-absolute endpoint without prefixing API_BASE", () => {
    render(<EndpointDisplay endpoint="https://mocks.example/api/custom/demo" />);
    expect(screen.getByText("https://mocks.example/api/custom/demo")).toBeInTheDocument();
    expect(screen.queryByText(/http:\/\/localhost:4000/)).not.toBeInTheDocument();
  });

  it("shows an alert when clipboard write fails", async () => {
    writeText.mockRejectedValue(new Error("Permission denied"));
    render(<EndpointDisplay endpoint="/api/custom/demo" />);

    fireEvent.click(screen.getByRole("button", { name: "Copy endpoint URL" }));
    expect(await screen.findByRole("alert")).toHaveTextContent("Permission denied");
  });

  it("shows a generic copy failure when the rejection is not an Error", async () => {
    writeText.mockRejectedValue("blocked");
    render(<EndpointDisplay endpoint="/api/custom/demo" />);

    fireEvent.click(screen.getByRole("button", { name: "Copy endpoint URL" }));
    expect(await screen.findByRole("alert")).toHaveTextContent("Copy failed");
  });
});
