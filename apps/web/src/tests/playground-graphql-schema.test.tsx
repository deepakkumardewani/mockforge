import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
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
  it("renders Query and Mutation section headings", () => {
    render(<SchemaPanel onSelect={vi.fn()} />);
    expect(screen.getByText("Query")).toBeInTheDocument();
    expect(screen.getByText("Mutation")).toBeInTheDocument();
  });

  it("renders field rows for all root fields without checkboxes", () => {
    render(<SchemaPanel onSelect={vi.fn()} />);
    expect(screen.getByRole("button", { name: /users/ })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /deleteUser/ })).toBeInTheDocument();
    expect(screen.queryByRole("checkbox")).not.toBeInTheDocument();
  });

  it("calls onSelect with all scalars immediately on field row click", async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();
    render(<SchemaPanel onSelect={onSelect} />);

    await user.click(screen.getByRole("button", { name: /^users/ }));

    expect(onSelect).toHaveBeenCalledWith("users", ["id", "firstName", "lastName", "email"]);
  });

  it("calls onSelect with empty scalars for delete mutations", async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();
    render(<SchemaPanel onSelect={onSelect} />);

    await user.click(screen.getByRole("button", { name: /^deleteUser/ }));

    expect(onSelect).toHaveBeenCalledWith("deleteUser", []);
  });

  it("does not render an Apply to query button", () => {
    render(<SchemaPanel onSelect={vi.fn()} />);
    expect(screen.queryByRole("button", { name: "Apply to query" })).not.toBeInTheDocument();
  });

  it("calls onSelect once per click without requiring confirmation", async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();
    render(<SchemaPanel onSelect={onSelect} />);

    await user.click(screen.getByRole("button", { name: /^users/ }));
    await user.click(screen.getByRole("button", { name: /^users/ }));

    expect(onSelect).toHaveBeenCalledTimes(2);
  });
});
