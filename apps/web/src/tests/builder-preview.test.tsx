import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Preview } from "@/components/builder/Preview";
import type { BuilderFormValues } from "@/components/builder/types";

describe("Preview", () => {
  it("shows guidance when no fields are named", () => {
    const emptyValues: BuilderFormValues = {
      name: "",
      fields: [{ name: "", type: "string" }],
    };
    render(<Preview formValues={emptyValues} />);
    expect(screen.getByText("Your sample response will appear here")).toBeInTheDocument();
    expect(screen.getByText(/name the first field/i)).toBeInTheDocument();
  });

  it("renders generated JSON when at least one field has a name", () => {
    const values: BuilderFormValues = {
      name: "Product",
      fields: [{ name: "title", type: "string" }],
    };
    render(<Preview formValues={values} />);
    expect(screen.getByRole("heading", { name: "Generated response" })).toBeInTheDocument();
    expect(screen.getByText(/sample records/)).toBeInTheDocument();
    expect(screen.getByText(/"title"/)).toBeInTheDocument();
  });
});
