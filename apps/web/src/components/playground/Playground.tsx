"use client";

import { PlaygroundTabs } from "@/components/playground/PlaygroundTabs";

export function Playground() {
  return (
    <main className="playground-scope flex h-screen max-w-[100vw] flex-col overflow-hidden px-4 pt-8 sm:px-6 lg:px-8">
      <div className="mx-auto flex w-full min-w-0 max-w-7xl flex-1 flex-col gap-6 overflow-hidden lg:gap-8">
        <header className="max-w-2xl shrink-0 space-y-1">
          <h1 className="font-display text-2xl font-bold tracking-tight text-[var(--color-text-primary)] lg:text-3xl">
            Playground
          </h1>
          <p className="text-sm text-[var(--color-text-muted)]">
            Try REST, GraphQL, WebSocket, and Socket.IO against the pre-seeded demo API — no setup
            required.
          </p>
        </header>

        <PlaygroundTabs />
      </div>
    </main>
  );
}
