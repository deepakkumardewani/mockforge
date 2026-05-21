import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ResponseViewer } from "@/components/playground/shared/ResponseViewer";
import { BodyEditor } from "@/components/playground/rest/BodyEditor";

describe("Playground REST — ResponseViewer", () => {
  it("renders Response heading when response is present", () => {
    const mockResponse = {
      status: 200,
      statusText: "OK",
      timeMs: 45,
      headers: { "content-type": "application/json" },
      body: { data: [{ id: 1 }] },
    };

    render(<ResponseViewer response={mockResponse} />);

    const heading = screen.getByRole("heading", { name: "Response", level: 2 });
    expect(heading).toBeInTheDocument();
  });

  it("does not render Response heading when no response", () => {
    render(<ResponseViewer response={null} />);

    const heading = screen.queryByRole("heading", { name: "Response" });
    expect(heading).not.toBeInTheDocument();
  });

  it("renders Body section heading", () => {
    const mockResponse = {
      status: 200,
      statusText: "OK",
      timeMs: 45,
      headers: {},
      body: { data: [] },
    };

    render(<ResponseViewer response={mockResponse} />);

    const bodyHeading = screen.getByText("Body");
    expect(bodyHeading).toBeInTheDocument();
  });
});

describe("Playground REST — BodyEditor", () => {
  it("renders Body heading and Format button", () => {
    const mockOnChange = vi.fn();
    const mockOnValidityChange = vi.fn();

    render(
      <BodyEditor value="" onChange={mockOnChange} onValidityChange={mockOnValidityChange} />,
    );

    expect(screen.getByText("Body")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Format JSON" })).toBeInTheDocument();
  });

  it("Format button pretty-prints valid JSON with 2-space indent", async () => {
    const user = userEvent.setup();
    const mockOnChange = vi.fn();
    const mockOnValidityChange = vi.fn();

    const minifiedJson = '{"name":"test","value":123}';

    render(
      <BodyEditor
        value={minifiedJson}
        onChange={mockOnChange}
        onValidityChange={mockOnValidityChange}
      />,
    );

    await user.click(screen.getByRole("button", { name: "Format JSON" }));

    expect(mockOnChange).toHaveBeenCalledWith(
      JSON.stringify(JSON.parse(minifiedJson), null, 2),
    );
    expect(mockOnChange).toHaveBeenCalledWith(
      '{\n  "name": "test",\n  "value": 123\n}',
    );
  });

  it("Format button does nothing on invalid JSON", async () => {
    const user = userEvent.setup();
    const mockOnChange = vi.fn();
    const mockOnValidityChange = vi.fn();

    const invalidJson = '{"name": "test", "value": }';

    render(
      <BodyEditor
        value={invalidJson}
        onChange={mockOnChange}
        onValidityChange={mockOnValidityChange}
      />,
    );

    await user.click(screen.getByRole("button", { name: "Format JSON" }));

    expect(mockOnChange).not.toHaveBeenCalled();
  });

  it("Format button does nothing on empty string", async () => {
    const user = userEvent.setup();
    const mockOnChange = vi.fn();
    const mockOnValidityChange = vi.fn();

    render(
      <BodyEditor value="" onChange={mockOnChange} onValidityChange={mockOnValidityChange} />,
    );

    await user.click(screen.getByRole("button", { name: "Format JSON" }));

    expect(mockOnChange).not.toHaveBeenCalled();
  });

  it("keeps existing validity messaging intact", () => {
    const mockOnChange = vi.fn();
    const mockOnValidityChange = vi.fn();

    const invalidJson = "{invalid}";

    render(
      <BodyEditor
        value={invalidJson}
        onChange={mockOnChange}
        onValidityChange={mockOnValidityChange}
      />,
    );

    expect(screen.getByText("Invalid JSON — fix syntax or clear the body before sending.")).toBeInTheDocument();
  });

  it("does not show error message for valid JSON", () => {
    const mockOnChange = vi.fn();
    const mockOnValidityChange = vi.fn();

    const validJson = '{"name": "test"}';

    render(
      <BodyEditor
        value={validJson}
        onChange={mockOnChange}
        onValidityChange={mockOnValidityChange}
      />,
    );

    expect(screen.queryByText("Invalid JSON — fix syntax or clear the body before sending.")).not.toBeInTheDocument();
  });
});
