import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  HOME_HREF,
  DOCS_HREF,
  PLAYGROUND_HREF,
  BUILDER_HREF,
  GITHUB_HREF,
  APP_NAV_LINKS,
  isAppNavActive,
} from "@/lib/nav-links";

describe("nav-links", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("exports stable public hrefs", () => {
    expect(HOME_HREF).toBe("/");
    expect(DOCS_HREF).toBe("/docs");
    expect(PLAYGROUND_HREF).toBe("/playground");
    expect(BUILDER_HREF).toBe("/builder");
    expect(GITHUB_HREF).toBe("https://github.com/deepakkumardewani/mockforge");
  });

  it("lists Docs, Playground, and Builder as primary destinations", () => {
    expect(APP_NAV_LINKS).toEqual([
      { label: "Docs", href: DOCS_HREF, match: "prefix" },
      { label: "Playground", href: PLAYGROUND_HREF, match: "exact" },
      { label: "Builder", href: BUILDER_HREF, match: "exact" },
    ]);
  });

  it("treats prefix match as the href or any nested path", () => {
    expect(isAppNavActive("/docs", DOCS_HREF, "prefix")).toBe(true);
    expect(isAppNavActive("/docs/rest/users", DOCS_HREF, "prefix")).toBe(true);
    expect(isAppNavActive("/documentation", DOCS_HREF, "prefix")).toBe(false);
  });

  it("treats exact match as the pathname only", () => {
    expect(isAppNavActive("/playground", PLAYGROUND_HREF, "exact")).toBe(true);
    expect(isAppNavActive("/playground/extra", PLAYGROUND_HREF, "exact")).toBe(false);
  });
});
