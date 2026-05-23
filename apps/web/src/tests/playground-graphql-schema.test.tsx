import { describe, it, expect, vi } from "vitest";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import {
  buildOperation,
  getDefaultScalarsForField,
  getGraphqlRootFieldsByKind,
  mergeOperation,
  parsePrimaryOperation,
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

describe("parsePrimaryOperation", () => {
  it("parses anonymous query and mutation operations", () => {
    expect(parsePrimaryOperation(`query {\n  users { id }\n}`)).toEqual({
      kind: "query",
      rootField: "users",
    });
    expect(parsePrimaryOperation(`mutation {\n  deleteUser(id: "1")\n}`)).toEqual({
      kind: "mutation",
      rootField: "deleteUser",
    });
  });

  it("parses named operations with variables", () => {
    expect(
      parsePrimaryOperation(`query Product($id: String!) {\n  product(id: $id) { id }\n}`),
    ).toEqual({ kind: "query", rootField: "product" });
  });
});

describe("mergeOperation", () => {
  it("inserts into an empty editor", () => {
    expect(mergeOperation("", "users", ["id", "email"])).toBe(
      `query {
  users {
    id
    email
  }
}`,
    );
  });

  it("replaces selection when the same root field is applied again", () => {
    const existing = `query {
  users {
    id
    firstName
    lastName
    email
  }
}`;
    expect(mergeOperation(existing, "users", ["id"])).toBe(
      `query {
  users {
    id
  }
}`,
    );
  });

  it("replaces the query when switching to a different entity", () => {
    const existing = `query {
  users {
    id
  }
}`;
    expect(mergeOperation(existing, "products", ["id", "title"])).toBe(
      `query {
  products {
    id
    title
  }
}`,
    );
  });

  it("replaces the query when switching between query and mutation on the same entity", () => {
    const existing = `query {
  users {
    id
  }
}`;
    expect(mergeOperation(existing, "createUser", ["id", "email"])).toBe(
      `mutation {
  createUser {
    id
    email
  }
}`,
    );
  });

  it("replaces list query with single-entity query on the same entity", () => {
    const existing = `query {
  users {
    id
    email
  }
}`;
    expect(mergeOperation(existing, "user", ["id", "email"])).toBe(
      `query {
  user(id: "1") {
    id
    email
  }
}`,
    );
  });
});

describe("getDefaultScalarsForField", () => {
  it("returns all selectable scalars for a root field", () => {
    expect(getDefaultScalarsForField("users")).toEqual(["id", "firstName", "lastName", "email"]);
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

  it("selects all scalars by default when a root field is expanded", async () => {
    const user = userEvent.setup();
    render(<SchemaPanel onConfirm={vi.fn()} />);

    await user.click(screen.getByRole("button", { name: /^Query/u }));
    await user.click(screen.getByRole("button", { name: /^users/u }));

    const panel = screen.getByLabelText("GraphQL schema");
    for (const scalar of ["id", "firstName", "lastName", "email"]) {
      expect(within(panel).getByRole("checkbox", { name: scalar })).toBeChecked();
    }
    expect(screen.getByRole("button", { name: "Apply to query" })).toBeEnabled();
  });

  it("confirms a valid operation with default-selected scalars", async () => {
    const user = userEvent.setup();
    const onConfirm = vi.fn();
    render(<SchemaPanel onConfirm={onConfirm} />);

    await user.click(screen.getByRole("button", { name: /^Query/u }));
    await user.click(screen.getByRole("button", { name: /^users/u }));
    await user.click(screen.getByRole("button", { name: "Apply to query" }));

    expect(onConfirm).toHaveBeenCalledWith("users", ["id", "firstName", "lastName", "email"]);
  });

  it("confirms only the remaining selected scalars after deselecting some", async () => {
    const user = userEvent.setup();
    const onConfirm = vi.fn();
    render(<SchemaPanel onConfirm={onConfirm} />);

    await user.click(screen.getByRole("button", { name: /^Query/u }));
    await user.click(screen.getByRole("button", { name: /^users/u }));

    const panel = screen.getByLabelText("GraphQL schema");
    await user.click(within(panel).getByRole("checkbox", { name: "firstName" }));
    await user.click(within(panel).getByRole("checkbox", { name: "lastName" }));
    await user.click(within(panel).getByRole("checkbox", { name: "email" }));
    await user.click(screen.getByRole("button", { name: "Apply to query" }));

    expect(onConfirm).toHaveBeenCalledWith("users", ["id"]);
  });

  it("disables apply when all scalars are deselected for a query field", async () => {
    const user = userEvent.setup();
    render(<SchemaPanel onConfirm={vi.fn()} />);

    await user.click(screen.getByRole("button", { name: /^Query/u }));
    await user.click(screen.getByRole("button", { name: /^users/u }));

    const panel = screen.getByLabelText("GraphQL schema");
    for (const scalar of ["id", "firstName", "lastName", "email"]) {
      await user.click(within(panel).getByRole("checkbox", { name: scalar }));
    }

    expect(screen.getByRole("button", { name: "Apply to query" })).toBeDisabled();
  });

  it("allows apply for delete mutations without selectable fields", async () => {
    const user = userEvent.setup();
    const onConfirm = vi.fn();
    render(<SchemaPanel onConfirm={onConfirm} />);

    await user.click(screen.getByRole("button", { name: /^Mutation/u }));
    await user.click(screen.getByRole("button", { name: /^deleteUser/u }));
    await user.click(screen.getByRole("button", { name: "Apply to query" }));

    expect(onConfirm).toHaveBeenCalledWith("deleteUser", []);
  });
});
