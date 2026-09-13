import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import {
  APP_NAV_LINKS,
  BUILDER_HREF,
  DOCS_HREF,
  GITHUB_HREF,
  HOME_HREF,
  PLAYGROUND_HREF,
} from "@/lib/nav-links";
import { BrandLogo } from "@/components/navigation/BrandLogo";

const { mockPathname } = vi.hoisted(() => ({
  mockPathname: { current: "/" },
}));

vi.mock("next/link", () => ({
  default: ({
    children,
    href,
    onClick,
    ...rest
  }: {
    children: React.ReactNode;
    href: string;
    onClick?: () => void;
    [key: string]: unknown;
  }) => (
    <a href={href} onClick={onClick} {...rest}>
      {children}
    </a>
  ),
}));

vi.mock("next/navigation", () => ({
  usePathname: () => mockPathname.current,
}));

beforeEach(() => {
  vi.clearAllMocks();
  mockPathname.current = "/";
  document.body.style.overflow = "";
});

describe("BrandLogo", () => {
  it("renders a decorative mark with the default size class", () => {
    const { container } = render(<BrandLogo />);
    const svg = container.querySelector("svg");
    expect(svg).toBeInTheDocument();
    expect(svg).toHaveAttribute("aria-hidden");
    expect(svg).toHaveClass("h-6", "w-6");
  });

  it("applies a custom className", () => {
    const { container } = render(<BrandLogo className="app-header-mark" />);
    expect(container.querySelector("svg")).toHaveClass("app-header-mark");
  });
});

describe("AppHeader", () => {
  async function renderHeader() {
    const { AppHeader } = await import("@/components/navigation/AppHeader");
    return render(<AppHeader />);
  }

  it("renders the wordmark linking home and the brand mark", async () => {
    await renderHeader();

    const wordmark = screen.getByText("MockForge");
    expect(wordmark.closest("a")).toHaveAttribute("href", HOME_HREF);
    expect(wordmark.closest("a")?.querySelector("svg")).toBeInTheDocument();
  });

  it("renders every primary nav link from APP_NAV_LINKS", async () => {
    await renderHeader();

    for (const link of APP_NAV_LINKS) {
      const anchors = screen.getAllByRole("link", { name: link.label });
      expect(anchors.length).toBeGreaterThanOrEqual(1);
      expect(anchors[0]).toHaveAttribute("href", link.href);
    }

    expect(screen.getByRole("link", { name: "Docs" })).toHaveAttribute("href", DOCS_HREF);
    expect(screen.getByRole("link", { name: "Playground" })).toHaveAttribute(
      "href",
      PLAYGROUND_HREF,
    );
    expect(screen.getByRole("link", { name: "Builder" })).toHaveAttribute("href", BUILDER_HREF);
  });

  it("exposes GitHub in a new tab and a theme toggle", async () => {
    await renderHeader();

    const github = screen.getByRole("link", { name: "GitHub" });
    expect(github).toHaveAttribute("href", GITHUB_HREF);
    expect(github).toHaveAttribute("target", "_blank");
    expect(github).toHaveAttribute("rel", "noopener noreferrer");
    expect(screen.getByRole("button", { name: "Toggle theme" })).toBeInTheDocument();
  });

  it("marks Docs as current on prefixed docs routes", async () => {
    mockPathname.current = "/docs/rest/users";
    await renderHeader();

    expect(screen.getByRole("link", { name: "Docs" })).toHaveAttribute("aria-current", "page");
    expect(screen.getByRole("link", { name: "Playground" })).not.toHaveAttribute("aria-current");
    expect(screen.getByRole("link", { name: "Builder" })).not.toHaveAttribute("aria-current");
  });

  it("marks Playground as current only on an exact match", async () => {
    mockPathname.current = "/playground";
    await renderHeader();

    expect(screen.getByRole("link", { name: "Playground" })).toHaveAttribute(
      "aria-current",
      "page",
    );
    expect(screen.getByRole("link", { name: "Docs" })).not.toHaveAttribute("aria-current");
  });

  it("does not mark Playground current on a nested path", async () => {
    mockPathname.current = "/playground/extra";
    await renderHeader();

    expect(screen.getByRole("link", { name: "Playground" })).not.toHaveAttribute("aria-current");
  });

  it("marks Builder as current on /builder", async () => {
    mockPathname.current = BUILDER_HREF;
    await renderHeader();

    expect(screen.getByRole("link", { name: "Builder" })).toHaveAttribute("aria-current", "page");
  });

  it("opens and closes the mobile navigation drawer", async () => {
    const user = userEvent.setup();
    await renderHeader();

    const toggle = screen.getByRole("button", { name: "Toggle navigation menu" });
    expect(toggle).toHaveAttribute("aria-expanded", "false");
    expect(toggle).toHaveAttribute("aria-controls", "mobile-menu");
    expect(document.getElementById("mobile-menu")).not.toBeInTheDocument();

    await user.click(toggle);
    expect(toggle).toHaveAttribute("aria-expanded", "true");
    expect(document.getElementById("mobile-menu")).toBeInTheDocument();
    expect(document.body.style.overflow).toBe("hidden");

    await user.click(toggle);
    expect(toggle).toHaveAttribute("aria-expanded", "false");
    expect(document.getElementById("mobile-menu")).not.toBeInTheDocument();
  });

  it("closes the mobile menu on Escape", async () => {
    const user = userEvent.setup();
    await renderHeader();

    await user.click(screen.getByRole("button", { name: "Toggle navigation menu" }));
    expect(document.getElementById("mobile-menu")).toBeInTheDocument();

    await user.keyboard("{Escape}");
    expect(document.getElementById("mobile-menu")).not.toBeInTheDocument();
  });

  it("closes the mobile menu when a drawer link is used", async () => {
    const user = userEvent.setup();
    await renderHeader();

    await user.click(screen.getByRole("button", { name: "Toggle navigation menu" }));
    const drawerLinks = screen.getAllByRole("link", { name: "Docs" });
    expect(drawerLinks.length).toBe(2);

    await user.click(drawerLinks[1]);
    expect(document.getElementById("mobile-menu")).not.toBeInTheDocument();
  });
});
