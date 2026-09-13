import { defineDocs, defineConfig } from "fumadocs-mdx/config";
import { remarkDocsApiBase } from "./remark-docs-api-base";

export const { docs, meta } = defineDocs({
  dir: "content/docs",
});

export default defineConfig({
  mdxOptions: {
    remarkPlugins: [remarkDocsApiBase],
  },
});
