import { useState } from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { BodyEditor } from "@/components/playground/rest/BodyEditor";
import { HeadersEditor, createEmptyHeaderRow } from "@/components/playground/rest/HeadersEditor";
import { MethodUrlBar } from "@/components/playground/rest/MethodUrlBar";

describe("Playground REST — BodyEditor", () => {
  function BodyHarness({ initial = "" }: { initial?: string }) {
    const [value, setValue] = useState(initial);
    const [valid, setValid] = useState(true);
    return (
      <>
        <BodyEditor value={value} onChange={setValue} onValidityChange={setValid} />
        <p data-testid="valid-flag">{valid ? "valid" : "invalid"}</p>
      </>
    );
  }

  it("reports invalid JSON when body is non-empty and malformed", async () => {
    const user = userEvent.setup();
    render(<BodyHarness />);

    await user.type(screen.getByRole("textbox", { name: /JSON request body/u }), "{{oops");

    expect(await screen.findByTestId("valid-flag")).toHaveTextContent("invalid");
    expect(screen.getByRole("alert")).toHaveTextContent("Invalid JSON");
  });
});

describe("Playground REST — HeadersEditor", () => {
  function HeaderHarness() {
    const [rows, setRows] = useState(() => [createEmptyHeaderRow()]);
    return (
      <>
        <HeadersEditor rows={rows} onChange={setRows} />
        <span data-testid="row-count">{rows.length}</span>
      </>
    );
  }

  it("adds rows when clicking Add header", async () => {
    const user = userEvent.setup();
    render(<HeaderHarness />);

    expect(screen.getByTestId("row-count")).toHaveTextContent("1");
    await user.click(screen.getByRole("button", { name: "Add header" }));
    expect(screen.getByTestId("row-count")).toHaveTextContent("2");
  });
});

describe("Playground REST — MethodUrlBar", () => {
  it("disables Send while loading", () => {
    const handleSend = vi.fn();
    const { rerender } = render(
      <MethodUrlBar
        method="GET"
        url="/api/ping"
        onMethodChange={() => {}}
        onUrlChange={() => {}}
        onSend={handleSend}
        isLoading={false}
        canSend
      />,
    );
    expect(screen.getByRole("button", { name: "Send" })).toBeEnabled();

    rerender(
      <MethodUrlBar
        method="GET"
        url="/api/ping"
        onMethodChange={() => {}}
        onUrlChange={() => {}}
        onSend={handleSend}
        isLoading
        canSend
      />,
    );
    expect(screen.getByRole("button", { name: /Sending/u })).toBeDisabled();
  });
});
