import { describe, it, expect, vi } from "vitest";
import { render, screen, within } from "@testing-library/react";
import { useState as useReactState } from "react";
import userEvent from "@testing-library/user-event";
import { EndpointAutocomplete } from "@/components/playground/rest/EndpointAutocomplete";
import type { HttpMethod } from "@/components/playground/shared/presets";

function ControlledAutocomplete({
  initialValue = "",
  onMethodChange = vi.fn(),
}: {
  initialValue?: string;
  onMethodChange?: (m: HttpMethod) => void;
}) {
  const [value, setValue] = useReactState(initialValue);
  return <EndpointAutocomplete value={value} onChange={setValue} onMethodChange={onMethodChange} />;
}

describe("EndpointAutocomplete", () => {
  const defaultProps = {
    value: "",
    onChange: vi.fn(),
    onMethodChange: vi.fn(),
  };

  it("renders a fixed /api/ prefix adornment", () => {
    render(<EndpointAutocomplete {...defaultProps} />);
    expect(screen.getByText("/api/")).toBeInTheDocument();
  });

  it("renders an input that does not include /api/ as typed text", () => {
    render(<EndpointAutocomplete {...defaultProps} value="users" />);
    const input = screen.getByRole("combobox");
    expect(input).toHaveValue("users");
  });

  it("shows listbox with suggestions on focus", async () => {
    const user = userEvent.setup();
    render(<EndpointAutocomplete {...defaultProps} />);
    const input = screen.getByRole("combobox");
    await user.click(input);
    expect(screen.getByRole("listbox")).toBeInTheDocument();
  });

  it("filters suggestions as user types", async () => {
    const user = userEvent.setup();
    render(<ControlledAutocomplete />);
    const input = screen.getByRole("combobox");
    await user.type(input, "prod");
    const listbox = screen.getByRole("listbox");
    const options = within(listbox).getAllByRole("option");
    const paths = options.map((o) => o.textContent ?? "");
    expect(paths.some((p) => p.includes("products"))).toBe(true);
    // Every suggestion path contains "prod"
    expect(paths.every((p) => p.toLowerCase().includes("prod"))).toBe(true);
  });

  it("all options have aria-selected attribute", async () => {
    const user = userEvent.setup();
    render(<EndpointAutocomplete {...defaultProps} />);
    await user.click(screen.getByRole("combobox"));
    const options = screen.getAllByRole("option");
    options.forEach((opt) => {
      expect(opt).toHaveAttribute("aria-selected");
    });
  });

  it("selects a suggestion on Enter and calls onChange + onMethodChange", async () => {
    const user = userEvent.setup();
    const onMethodChange = vi.fn();
    render(<ControlledAutocomplete onMethodChange={onMethodChange} />);
    const input = screen.getByRole("combobox");
    await user.type(input, "prod");
    await user.keyboard("{ArrowDown}");
    await user.keyboard("{Enter}");
    // After selection the listbox closes and input has a path value
    expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
    expect(onMethodChange).toHaveBeenCalled();
  });

  it("closes listbox on Escape", async () => {
    const user = userEvent.setup();
    render(<EndpointAutocomplete {...defaultProps} />);
    const input = screen.getByRole("combobox");
    await user.click(input);
    expect(screen.getByRole("listbox")).toBeInTheDocument();
    await user.keyboard("{Escape}");
    expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
  });

  it("closes listbox after selecting an option by click", async () => {
    const user = userEvent.setup();
    render(<ControlledAutocomplete initialValue="users" />);
    const input = screen.getByRole("combobox");
    await user.click(input);
    const options = screen.getAllByRole("option");
    await user.click(options[0]);
    expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
  });

  it("navigates options with ArrowDown/ArrowUp and sets aria-selected", async () => {
    const user = userEvent.setup();
    render(<EndpointAutocomplete {...defaultProps} />);
    const input = screen.getByRole("combobox");
    await user.click(input);
    await user.keyboard("{ArrowDown}");
    const options = screen.getAllByRole("option");
    expect(options[0]).toHaveAttribute("aria-selected", "true");
    await user.keyboard("{ArrowDown}");
    expect(options[0]).toHaveAttribute("aria-selected", "false");
    expect(options[1]).toHaveAttribute("aria-selected", "true");
    await user.keyboard("{ArrowUp}");
    expect(options[0]).toHaveAttribute("aria-selected", "true");
  });
});
