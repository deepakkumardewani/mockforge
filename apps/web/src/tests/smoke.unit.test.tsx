import { render, screen } from "@testing-library/react";

function Greeting({ name }: { name: string }) {
  return <p>Hello, {name}!</p>;
}

describe("smoke", () => {
  it("renders a React component", () => {
    render(<Greeting name="MockForge" />);
    expect(screen.getByText("Hello, MockForge!")).toBeInTheDocument();
  });
});
