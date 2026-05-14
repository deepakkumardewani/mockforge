import { describe, it, expect } from "vitest";
import fs from "fs";
import path from "path";

describe("Documentation files", () => {
  it("should have created source.config.ts", () => {
    const sourceConfigPath = path.join(process.cwd(), "source.config.ts");
    expect(fs.existsSync(sourceConfigPath)).toBe(true);
  });

  it("should have created docs layout", () => {
    const layoutPath = path.join(process.cwd(), "src/app/docs/layout.tsx");
    expect(fs.existsSync(layoutPath)).toBe(true);
  });

  it("should have created docs page", () => {
    const pagePath = path.join(process.cwd(), "src/app/docs/[[...slug]]/page.tsx");
    expect(fs.existsSync(pagePath)).toBe(true);
  });

  it("should have created content/docs directory with MDX files", () => {
    const docsPath = path.join(process.cwd(), "content/docs");
    expect(fs.existsSync(docsPath)).toBe(true);

    const indexPath = path.join(docsPath, "index.mdx");
    expect(fs.existsSync(indexPath)).toBe(true);

    const metaPath = path.join(docsPath, "meta.json");
    expect(fs.existsSync(metaPath)).toBe(true);
  });

  it("should have created REST API docs", () => {
    const restPath = path.join(process.cwd(), "content/docs/rest");
    expect(fs.existsSync(restPath)).toBe(true);

    const files = ["index.mdx", "users.mdx", "products.mdx", "posts.mdx"];
    files.forEach((file) => {
      const filePath = path.join(restPath, file);
      expect(fs.existsSync(filePath)).toBe(true);
    });
  });

  it("should have created other docs", () => {
    const docsPath = path.join(process.cwd(), "content/docs");
    const files = ["graphql.mdx", "websockets.mdx", "socketio.mdx", "custom-schemas.mdx"];

    files.forEach((file) => {
      const filePath = path.join(docsPath, file);
      expect(fs.existsSync(filePath)).toBe(true);
    });
  });
});
