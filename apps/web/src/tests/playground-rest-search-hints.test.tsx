import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { SearchHints } from "@/components/playground/rest/SearchHints";

describe("Playground REST — SearchHints", () => {
  it("lists the searchable fields for the resolved entity", () => {
    render(<SearchHints url="/api/users/search" onAppendParam={vi.fn()} />);
    expect(screen.getByText("firstName, lastName, email, username")).toBeInTheDocument();
  });

  it("appends a clicked param with key and value", async () => {
    const user = userEvent.setup();
    const onAppendParam = vi.fn();
    render(<SearchHints url="/api/users/search" onAppendParam={onAppendParam} />);

    await user.click(screen.getByRole("button", { name: "q=searchterm" }));
    expect(onAppendParam).toHaveBeenCalledWith("q", "searchterm");
  });

  it("disables a param chip once that key already exists in the URL", () => {
    render(<SearchHints url="/api/users/search?q=ada" onAppendParam={vi.fn()} />);
    expect(screen.getByRole("button", { name: "q=searchterm" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "limit=30" })).toBeEnabled();
  });

  it("does not append when an already-added chip is clicked", async () => {
    const user = userEvent.setup();
    const onAppendParam = vi.fn();
    render(<SearchHints url="/api/users/search?q=ada" onAppendParam={onAppendParam} />);

    await user.click(screen.getByRole("button", { name: "q=searchterm" }));
    expect(onAppendParam).not.toHaveBeenCalled();
  });
});
