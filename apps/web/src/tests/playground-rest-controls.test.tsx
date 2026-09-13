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
        <pre data-testid="rows-json">
          {JSON.stringify(rows.map(({ key, value }) => ({ key, value })))}
        </pre>
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

  it("updates header key and value on an empty row", async () => {
    const user = userEvent.setup();
    render(<HeaderHarness />);

    await user.type(screen.getByRole("textbox", { name: "Header key" }), "Authorization");
    await user.type(
      screen.getByRole("textbox", { name: "Value for header Authorization" }),
      "Bearer token",
    );

    expect(screen.getByTestId("rows-json")).toHaveTextContent(
      JSON.stringify([{ key: "Authorization", value: "Bearer token" }]),
    );
  });

  it("replaces the last row with an empty row when removed", async () => {
    const user = userEvent.setup();
    render(<HeaderHarness />);

    await user.type(screen.getByRole("textbox", { name: "Header key" }), "X-Trace");
    await user.click(screen.getByRole("button", { name: "Remove header row" }));

    expect(screen.getByTestId("row-count")).toHaveTextContent("1");
    expect(screen.getByRole("textbox", { name: "Header key" })).toHaveValue("");
    expect(screen.getByRole("textbox", { name: "Value for header blank" })).toHaveValue("");
  });

  it("removes one of multiple header rows", async () => {
    const user = userEvent.setup();
    render(<HeaderHarness />);

    await user.type(screen.getByRole("textbox", { name: "Header key" }), "Accept");
    await user.click(screen.getByRole("button", { name: "Add header" }));

    const keys = screen.getAllByRole("textbox", { name: "Header key" });
    await user.type(keys[1]!, "Content-Type");
    expect(screen.getByTestId("row-count")).toHaveTextContent("2");

    await user.click(screen.getAllByRole("button", { name: "Remove header row" })[0]!);
    expect(screen.getByTestId("row-count")).toHaveTextContent("1");
    expect(screen.getByRole("textbox", { name: "Header key" })).toHaveValue("Content-Type");
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

  it("notifies method and URL suffix changes", async () => {
    const user = userEvent.setup();
    const onMethodChange = vi.fn();
    const onUrlChange = vi.fn();

    function Harness() {
      const [method, setMethod] = useState<"GET" | "POST" | "PUT" | "DELETE">("GET");
      const [url, setUrl] = useState("/api/users");
      return (
        <MethodUrlBar
          method={method}
          url={url}
          onMethodChange={(next) => {
            onMethodChange(next);
            setMethod(next);
          }}
          onUrlChange={(next) => {
            onUrlChange(next);
            setUrl(next);
          }}
          onSend={vi.fn()}
          isLoading={false}
        />
      );
    }

    render(<Harness />);

    await user.selectOptions(screen.getByRole("combobox", { name: "HTTP method" }), "POST");
    expect(onMethodChange).toHaveBeenCalledWith("POST");

    const suffix = screen.getByRole("combobox", { name: "Request URL suffix" });
    await user.clear(suffix);
    await user.type(suffix, "posts");
    expect(onUrlChange).toHaveBeenCalledWith("/api/posts");
    expect(suffix).toHaveValue("posts");
  });
});
