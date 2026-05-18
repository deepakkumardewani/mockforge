import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { StatusPill } from "@/components/playground/shared/StatusPill";
import { PresetPicker } from "@/components/playground/shared/PresetPicker";
import { REST_PRESETS } from "@/components/playground/shared/presets";

describe("Playground foundation — StatusPill", () => {
  it("renders idle connection state without throwing", () => {
    const { rerender } = render(<StatusPill connectionState="idle" />);
    expect(screen.getByText("Idle")).toBeInTheDocument();

    rerender(<StatusPill connectionState="connecting" />);
    expect(screen.getByText("Connecting…")).toBeInTheDocument();

    rerender(<StatusPill connectionState="connected" />);
    expect(screen.getByText("Connected")).toBeInTheDocument();

    rerender(<StatusPill connectionState="error" />);
    expect(screen.getByText("Error")).toBeInTheDocument();
  });

  it("renders HTTP status codes", () => {
    const { rerender } = render(<StatusPill httpStatus={200} />);
    expect(screen.getByText("200")).toBeInTheDocument();

    rerender(<StatusPill httpStatus={404} />);
    expect(screen.getByText("404")).toBeInTheDocument();

    rerender(<StatusPill httpStatus={500} />);
    expect(screen.getByText("500")).toBeInTheDocument();
  });
});

describe("Playground foundation — PresetPicker", () => {
  it("calls onSelect when a chip is activated", async () => {
    const user = userEvent.setup();
    const handleSelect = vi.fn();
    render(<PresetPicker presets={REST_PRESETS} onSelect={handleSelect} />);

    await user.click(screen.getByRole("button", { name: "List users" }));
    expect(handleSelect).toHaveBeenCalledTimes(1);
    expect(handleSelect).toHaveBeenCalledWith(
      expect.objectContaining({ id: "rest-users", method: "GET" }),
    );
  });

  it("renders preset labels", () => {
    render(<PresetPicker presets={REST_PRESETS.slice(0, 2)} onSelect={() => {}} />);
    expect(screen.getByRole("button", { name: "List users" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Single user" })).toBeInTheDocument();
  });
});
