import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { QueryEditor } from "@/components/playground/graphql/QueryEditor";

describe("QueryEditor", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders a GraphQL query region with an editable field", () => {
    render(<QueryEditor value="query { users { id } }" onChange={vi.fn()} />);
    expect(screen.getByRole("region", { name: "GraphQL query" })).toBeInTheDocument();
    expect(screen.getByRole("textbox", { name: "GraphQL query" })).toHaveValue(
      "query { users { id } }",
    );
  });

  it("calls onChange when the query text changes", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<QueryEditor value="" onChange={onChange} />);

    await user.type(screen.getByRole("textbox", { name: "GraphQL query" }), "q");
    expect(onChange).toHaveBeenCalled();
  });
});
