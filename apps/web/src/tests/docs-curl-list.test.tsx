import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { act, fireEvent, render, screen } from "@testing-library/react";
import { DocsBaseUrl, DocsCurlList } from "@/components/docs/DocsCurlList";

vi.mock("@/lib/api-client", () => ({
  API_BASE: "http://localhost:4000",
}));

describe("DocsCurlList", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
    Object.defineProperty(navigator, "clipboard", {
      configurable: true,
      value: { writeText: vi.fn().mockResolvedValue(undefined) },
    });
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it("renders nothing when paths and templates are empty", () => {
    const { container } = render(<DocsCurlList />);
    expect(container).toBeEmptyDOMElement();
  });

  it("renders nothing for empty arrays", () => {
    const { container } = render(<DocsCurlList paths={[]} templates={[]} />);
    expect(container).toBeEmptyDOMElement();
  });

  it("renders a curl command for each path", () => {
    render(<DocsCurlList paths={["/users", "/posts"]} />);
    expect(screen.getByText('curl "http://localhost:4000/users"')).toBeInTheDocument();
    expect(screen.getByText('curl "http://localhost:4000/posts"')).toBeInTheDocument();
    expect(screen.getAllByRole("button", { name: "Copy command" })).toHaveLength(2);
  });

  it("expands {base} and {ws} placeholders in templates", () => {
    render(<DocsCurlList templates={["wscat -c {ws}/ws/ticker", "curl {base}/health"]} />);
    expect(screen.getByText("wscat -c ws://localhost:4000/ws/ticker")).toBeInTheDocument();
    expect(screen.getByText("curl http://localhost:4000/health")).toBeInTheDocument();
  });

  it("lists path commands before template commands", () => {
    render(<DocsCurlList paths={["/users"]} templates={["curl {base}/health"]} />);
    const commands = screen.getAllByText(/curl /).map((node) => node.textContent);
    expect(commands).toEqual([
      'curl "http://localhost:4000/users"',
      "curl http://localhost:4000/health",
    ]);
  });

  it("copies a command and resets the copied label", async () => {
    render(<DocsCurlList paths={["/users"]} />);

    fireEvent.click(screen.getByRole("button", { name: "Copy command" }));
    await act(async () => {
      await Promise.resolve();
    });
    expect(screen.getByRole("button", { name: "Copied" })).toBeInTheDocument();

    await act(async () => {
      vi.advanceTimersByTime(1600);
    });
    expect(screen.getByRole("button", { name: "Copy command" })).toBeInTheDocument();
  });
});

describe("DocsBaseUrl", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    Object.defineProperty(navigator, "clipboard", {
      configurable: true,
      value: { writeText: vi.fn().mockResolvedValue(undefined) },
    });
  });

  it("renders the API base URL when no path is given", () => {
    render(<DocsBaseUrl />);
    expect(screen.getByText("http://localhost:4000")).toBeInTheDocument();
  });

  it("appends the path prop to the base URL", () => {
    render(<DocsBaseUrl path="/users" />);
    expect(screen.getByText("http://localhost:4000/users")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Copy command" })).toBeInTheDocument();
  });
});
