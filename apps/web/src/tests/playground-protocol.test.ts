import { describe, it, expect } from "vitest";
import type { Protocol } from "@/components/playground/shared/protocol";

describe("Protocol type", () => {
  it("includes all four playground protocol literals", () => {
    const protocols: Protocol[] = ["rest", "graphql", "websocket", "socketio"];
    expect(protocols).toEqual(["rest", "graphql", "websocket", "socketio"]);
  });
});
