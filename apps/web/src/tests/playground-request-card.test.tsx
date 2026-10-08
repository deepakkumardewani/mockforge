import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { RequestCard } from "@/components/playground/shared/RequestCard";

describe("RequestCard", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const baseTabs = [
    { id: "query", label: "Query", content: <p>Query panel</p> },
    { id: "variables", label: "Variables", content: <p>Variables panel</p> },
  ];

  it("renders examples label, presets, request bar, and default tab content", () => {
    render(
      <RequestCard
        presets={<button type="button">Users list</button>}
        requestBar={<div>Request bar</div>}
        tabs={baseTabs}
        subtitle="POST /graphql"
      />,
    );

    expect(screen.getByText("Examples")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Users list" })).toBeInTheDocument();
    expect(screen.getByText("Request bar")).toBeInTheDocument();
    expect(screen.getByText("POST /graphql")).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: "Query" })).toHaveAttribute("data-state", "active");
    expect(screen.getByRole("tab", { name: "Variables" })).toHaveAttribute(
      "data-state",
      "inactive",
    );
  });

  it("switches tabs while keeping inactive panels mounted", async () => {
    const user = userEvent.setup();
    render(<RequestCard presets={null} requestBar={<div>Bar</div>} tabs={baseTabs} />);

    await user.click(screen.getByRole("tab", { name: "Variables" }));
    expect(screen.getByRole("tab", { name: "Variables" })).toHaveAttribute("data-state", "active");
    expect(screen.getByRole("tab", { name: "Query" })).toHaveAttribute("data-state", "inactive");
    expect(document.body).toHaveTextContent("Query panel");
  });

  it("supports a custom examples label and workbench variant without card chrome", () => {
    const { container } = render(
      <RequestCard
        variant="workbench"
        examplesLabel="Presets"
        presets={<span>Preset row</span>}
        requestBar={<div>Bar</div>}
        tabs={[]}
      />,
    );

    expect(screen.getByText("Presets")).toBeInTheDocument();
    expect(container.firstElementChild?.className).not.toMatch(/rounded-xl/);
  });
});
