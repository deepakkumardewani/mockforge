export const HOME_HREF = "/" as const;
export const DOCS_HREF = "/docs" as const;
export const PLAYGROUND_HREF = "/playground" as const;
export const BUILDER_HREF = "/builder" as const;

export type AppNavMatch = "exact" | "prefix";

export interface AppNavLink {
  label: string;
  href: string;
  match: AppNavMatch;
}

/** Primary in-app destinations (excludes Home wordmark). */
export const APP_NAV_LINKS: readonly AppNavLink[] = [
  { label: "Docs", href: DOCS_HREF, match: "prefix" },
  { label: "Playground", href: PLAYGROUND_HREF, match: "exact" },
  { label: "Builder", href: BUILDER_HREF, match: "exact" },
];

export function isAppNavActive(pathname: string, href: string, match: AppNavMatch): boolean {
  if (match === "prefix") {
    return pathname === href || pathname.startsWith(`${href}/`);
  }
  return pathname === href;
}
