import { describe, it, expect, vi } from "vitest";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import {
  buildOperation,
  getGraphqlRootFieldsByKind,
} from "@/components/playground/graphql/build-operation";
import { SchemaPanel } from "@/components/playground/graphql/SchemaPanel";

describe("buildOperation", () => {
  it("builds a query with selected scalar fields", () => {
    expect(buildOperation("users", ["id", "email"])).toBe(
      `query {
  users {
    id
    email
  }
}`,
    );
  });

  it("builds a single-entity query with id argument", () => {
    expect(buildOperation("user", ["id", "email"])).toBe(
      `query {
  user(id: "1") {
    id
    email
  }
}`,
    );
  });

  it("builds a delete mutation without a selection set", () => {
    expect(buildOperation("deleteUser", [])).toBe(
      `mutation {
  deleteUser(id: "1")
}`,
    );
  });

  it("returns null for unknown root fields", () => {
    expect(buildOperation("notAField", ["id"])).toBeNull();
  });

  it("returns null when selection is required but empty (zero-field guard)", () => {
    expect(buildOperation("users", [])).toBeNull();
    expect(buildOperation("createUser", [])).toBeNull();
  });
});

describe("getGraphqlRootFieldsByKind", () => {
  it("groups catalogue fields into Query and Mutation", () => {
    const { query, mutation } = getGraphqlRootFieldsByKind();
    expect(query.some((f) => f.name === "users")).toBe(true);
    expect(query.some((f) => f.name === "user")).toBe(true);
    expect(mutation.some((f) => f.name === "createUser")).toBe(true);
    expect(mutation.some((f) => f.name === "deleteUser")).toBe(true);
    expect(query.every((f) => !f.name.startsWith("create"))).toBe(true);
  });
});

describe("SchemaPanel", () => {
  it("renders Query and Mutation groups from the catalogue", () => {
    render(<SchemaPanel onConfirm={vi.fn()} />);
    expect(screen.getByRole("button", { name: /^Query/u })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /^Mutation/u })).toBeInTheDocument();
  });

  it("expands a root field, ticks scalars, and confirms a valid operation", async () => {
    const user = userEvent.setup();
    const onConfirm = vi.fn();
    render(<SchemaPanel onConfirm={onConfirm} />);

    await user.click(screen.getByRole("button", { name: /^Query/u }));
    await user.click(screen.getByRole("button", { name: /^users/u }));

    const panel = screen.getByLabelText("GraphQL schema");
    await user.click(within(panel).getByRole("checkbox", { name: "id" }));
    await user.click(within(panel).getByRole("checkbox", { name: "email" }));
    await user.click(screen.getByRole("button", { name: "Insert operation" }));

    expect(onConfirm).toHaveBeenCalledWith(
      `query {
  users {
    id
    email
  }
}`,
    );
  });

  it("disables insert when no scalars are selected for a query field", async () => {
    const user = userEvent.setup();
    render(<SchemaPanel onConfirm={vi.fn()} />);

    await user.click(screen.getByRole("button", { name: /^Query/u }));
    await user.click(screen.getByRole("button", { name: /^users/u }));

    expect(screen.getByRole("button", { name: "Insert operation" })).toBeDisabled();
  });

  it("allows insert for delete mutations without selectable fields", async () => {
    const user = userEvent.setup();
    const onConfirm = vi.fn();
    render(<SchemaPanel onConfirm={onConfirm} />);

    await user.click(screen.getByRole("button", { name: /^Mutation/u }));
    await user.click(screen.getByRole("button", { name: /^deleteUser/u }));
    await user.click(screen.getByRole("button", { name: "Insert operation" }));

    expect(onConfirm).toHaveBeenCalledWith(
      `mutation {
  deleteUser(id: "1")
}`,
    );
  });
});
