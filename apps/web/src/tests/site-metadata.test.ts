import { describe, it, expect } from "vitest";
import { siteMetadata } from "@/lib/site-metadata";

describe("siteMetadata", () => {
  it("exports the hosted mock API title and description", () => {
    expect(siteMetadata.title).toBe("MockForge — Hosted Mock API for Apps");
    expect(siteMetadata.description).toMatch(/15 typed resources/i);
    expect(siteMetadata.description).toMatch(/No signup or API key required/i);
  });

  it("mirrors title and description on Open Graph metadata", () => {
    expect(siteMetadata.openGraph?.title).toBe("MockForge — Hosted Mock API for Apps");
    expect(siteMetadata.openGraph?.description).toBe(siteMetadata.description);
    expect((siteMetadata.openGraph as { type?: string } | null | undefined)?.type).toBe("website");
  });

  it("mirrors title and description on Twitter card metadata", () => {
    expect((siteMetadata.twitter as { card?: string } | null | undefined)?.card).toBe(
      "summary_large_image",
    );
    expect(siteMetadata.twitter?.title).toBe("MockForge — Hosted Mock API for Apps");
    expect(siteMetadata.twitter?.description).toBe(siteMetadata.description);
  });
});
