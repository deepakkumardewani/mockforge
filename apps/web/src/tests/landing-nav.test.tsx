import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

vi.mock("next/link", () => ({
  default: ({
    children,
    href,
    ...rest
  }: {
    children: React.ReactNode;
    href: string;
    [key: string]: unknown;
  }) => (
    <a href={href} {...rest}>
      {children}
    </a>
  ),
}));

vi.mock("next/navigation", () => ({
  usePathname: () => "/",
}));

beforeEach(() => {
  vi.clearAllMocks();
});

describe("Nav", () => {
  it("renders the AppHeader brand wordmark", async () => {
    const { Nav } = await import("@/components/landing/Nav");
    render(<Nav />);
    expect(screen.getByText("MockForge")).toBeInTheDocument();
  });

  it("exposes primary navigation with docs and playground links", async () => {
    const { Nav } = await import("@/components/landing/Nav");
    render(<Nav />);
    expect(screen.getByRole("navigation", { name: "Primary navigation" })).toBeInTheDocument();
    expect(screen.getAllByRole("link", { name: "Docs" })[0]).toHaveAttribute("href", "/docs");
    expect(screen.getAllByRole("link", { name: "Playground" })[0]).toHaveAttribute(
      "href",
      "/playground",
    );
  });

  it("toggles mobile menu via the menu button", async () => {
    const user = userEvent.setup();
    const { Nav } = await import("@/components/landing/Nav");
    render(<Nav />);
    const toggle = screen.getByRole("button", { name: /toggle navigation menu/i });
    expect(toggle).toHaveAttribute("aria-expanded", "false");
    await user.click(toggle);
    expect(toggle).toHaveAttribute("aria-expanded", "true");
    await user.click(toggle);
    expect(toggle).toHaveAttribute("aria-expanded", "false");
  });
});
