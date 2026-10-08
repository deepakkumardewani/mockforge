import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Tooltip } from "@/components/playground/shared/Tooltip";

class ResizeObserverMock {
  observe() {}
  unobserve() {}
  disconnect() {}
}

describe("Tooltip", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubGlobal("ResizeObserver", ResizeObserverMock);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("renders the trigger child", () => {
    render(
      <Tooltip label="Schema">
        <button type="button">Open schema</button>
      </Tooltip>,
    );
    expect(screen.getByRole("button", { name: "Open schema" })).toBeInTheDocument();
  });

  it("shows the label in a tooltip on hover", async () => {
    const user = userEvent.setup();
    render(
      <Tooltip label="Schema">
        <button type="button">Open schema</button>
      </Tooltip>,
    );

    await user.hover(screen.getByRole("button", { name: "Open schema" }));
    expect(await screen.findByRole("tooltip")).toHaveTextContent("Schema");
  });

  it("renders the label inside the tooltip bubble when open", async () => {
    const user = userEvent.setup();
    render(
      <Tooltip label="Schema">
        <button type="button">Toggle</button>
      </Tooltip>,
    );

    await user.hover(screen.getByRole("button", { name: "Toggle" }));
    const tooltip = await screen.findByRole("tooltip");
    expect(tooltip).toHaveTextContent("Schema");
  });
});
