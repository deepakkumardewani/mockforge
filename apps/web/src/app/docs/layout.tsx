import { DocsLayout } from "fumadocs-ui/layouts/docs";
import type { ReactNode } from "react";
import { AppHeader } from "@/components/navigation/AppHeader";
import { source } from "@/lib/source";
import { RootProvider } from "fumadocs-ui/provider";
import { DOCS_HREF } from "@/lib/nav-links";
import "fumadocs-ui/style.css";
import "./docs-theme.css";

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-dvh flex-col">
      <AppHeader />
      <div className="min-h-0 flex-1">
        <RootProvider
          theme={{
            attribute: "class",
            storageKey: "theme",
            defaultTheme: "dark",
            enableSystem: false,
          }}
        >
          <DocsLayout
            tree={source.pageTree}
            nav={{ enabled: false, title: "MockForge Docs", url: DOCS_HREF }}
            links={[]}
          >
            {children}
          </DocsLayout>
        </RootProvider>
      </div>
    </div>
  );
}
