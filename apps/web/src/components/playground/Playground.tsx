"use client";

import { PlaygroundTabs } from "@/components/playground/PlaygroundTabs";

export function Playground() {
  return (
    <main className="min-h-screen px-4 py-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <header>
          <h1 className="font-display text-3xl font-bold text-[var(--color-text-primary)]">Playground</h1>
          <p className="mt-2 max-w-2xl text-[var(--color-text-muted)]">
            Try REST, GraphQL, WebSocket, and Socket.IO against the pre-seeded demo API — no setup required.
          </p>
        </header>

        <PlaygroundTabs />
      </div>
    </main>
  );
}
