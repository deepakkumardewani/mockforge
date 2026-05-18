"use client";

import { PlaygroundTabs } from "@/components/playground/PlaygroundTabs";

export function Playground() {
  return (
    <main className="playground-scope min-h-screen max-w-[100vw] overflow-x-hidden px-4 py-10 sm:px-6 lg:px-8 lg:py-12">
      <div className="mx-auto min-w-0 max-w-7xl space-y-8 lg:space-y-10">
        <header className="max-w-2xl space-y-3">
          <h1 className="font-display text-3xl font-bold tracking-tight text-[var(--color-text-primary)] lg:text-4xl">
            Playground
          </h1>
          <p className="text-[var(--color-text-muted)] leading-relaxed">
            Try REST, GraphQL, WebSocket, and Socket.IO against the pre-seeded demo API — no setup
            required.
          </p>
        </header>

        <PlaygroundTabs />
      </div>
    </main>
  );
}
