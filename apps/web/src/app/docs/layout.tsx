import { DocsLayout } from "fumadocs-ui/layouts/docs";
import type { ReactNode } from "react";
import { source } from "@/lib/source";
import { RootProvider } from "fumadocs-ui/provider";
import "fumadocs-ui/style.css";
import "./docs-theme.css";

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <RootProvider
      theme={{
        attribute: "class",
        storageKey: "theme",
        defaultTheme: "dark",
        enableSystem: false,
      }}
    >
      <DocsLayout tree={source.pageTree} nav={{ title: "MockForge Docs" }}>
        {children}
      </DocsLayout>
    </RootProvider>
  );
}
