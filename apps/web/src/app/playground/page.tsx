import type { Metadata } from "next";
import { Suspense } from "react";
import { AppHeader } from "@/components/navigation/AppHeader";
import { Playground } from "@/components/playground/Playground";

export const metadata: Metadata = {
  title: "Playground — MockForge",
  description:
    "Optional explorer for the hosted MockForge API — try REST, GraphQL, WebSocket, and Socket.IO.",
};

export default function PlaygroundPage() {
  return (
    <div className="flex h-dvh max-w-[100vw] flex-col overflow-hidden">
      <AppHeader />
      <div className="min-h-0 flex-1 overflow-hidden [&>main]:h-full [&>main]:max-h-full">
        <Suspense fallback={null}>
          <Playground />
        </Suspense>
      </div>
    </div>
  );
}
