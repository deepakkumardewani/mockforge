import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Accordion } from "@/components/playground/shared/Accordion";

describe("Playground Accordion", () => {
  it("starts closed and hides children", () => {
    render(
      <Accordion title="Headers" badge={2}>
        <p>Authorization</p>
      </Accordion>,
    );

    const toggle = screen.getByRole("button", { name: /Headers/ });
    expect(toggle).toHaveAttribute("aria-expanded", "false");
    expect(screen.queryByText("Authorization")).not.toBeInTheDocument();
    expect(screen.getByText("2")).toBeInTheDocument();
  });

  it("opens and closes on click", async () => {
    const user = userEvent.setup();
    render(
      <Accordion title="Query">
        <p>page=1</p>
      </Accordion>,
    );

    const toggle = screen.getByRole("button", { name: "Query" });
    await user.click(toggle);

    expect(toggle).toHaveAttribute("aria-expanded", "true");
    expect(screen.getByText("page=1")).toBeInTheDocument();

    await user.click(toggle);

    expect(toggle).toHaveAttribute("aria-expanded", "false");
    expect(screen.queryByText("page=1")).not.toBeInTheDocument();
  });

  it("honors defaultOpen", () => {
    render(
      <Accordion title="Body" defaultOpen>
        <p>ready</p>
      </Accordion>,
    );

    expect(screen.getByRole("button", { name: "Body" })).toHaveAttribute("aria-expanded", "true");
    expect(screen.getByText("ready")).toBeInTheDocument();
  });
});
