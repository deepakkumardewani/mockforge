import { describe, it, expect } from "vitest";
import { render, waitFor } from "@testing-library/react";
import { EventLog } from "@/components/playground/shared/EventLog";

const ev = (id: string, message: string, at: number) => ({
  id,
  direction: "in" as const,
  message,
  at,
});

describe("Playground WebSocket — EventLog", () => {
  it("auto-scrolls when pinned and new events are appended", async () => {
    const { rerender, container } = render(<EventLog events={[ev("1", "a", 1)]} />);
    const scroll = container.querySelector('[role="log"]') as HTMLDivElement;

    Object.defineProperty(scroll, "scrollHeight", {
      configurable: true,
      value: 1000,
      writable: true,
    });
    Object.defineProperty(scroll, "clientHeight", {
      configurable: true,
      value: 200,
      writable: true,
    });
    scroll.scrollTop = 0;

    rerender(<EventLog events={[ev("1", "a", 1), ev("2", "b", 2)]} />);

    await waitFor(() => {
      expect(scroll.scrollTop).toBeGreaterThan(0);
    });
  });

  it("renders timestamps and in/out labels on cards", () => {
    const at = new Date(2026, 0, 2, 3, 4, 5, 67).getTime();
    render(
      <EventLog
        events={[
          { id: "1", direction: "in", message: "inbound", at },
          { id: "2", direction: "out", message: "outbound", at },
        ]}
      />,
    );

    expect(document.body.textContent).toContain("03:04:05.067");
    expect(document.body.textContent).toContain("← In");
    expect(document.body.textContent).toContain("inbound");
    expect(document.body.textContent).toContain("→ Out");
    expect(document.body.textContent).toContain("outbound");
  });
});
