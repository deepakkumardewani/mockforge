import { describe, it, expect, beforeEach, vi } from "vitest";
import { sendToClients } from "./client-set";
import type { BunWs } from "./types";

function mockSocket(send: () => void): BunWs {
  return { send } as unknown as BunWs;
}

describe("sendToClients", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("sends the payload to every live socket", () => {
    const firstSend = vi.fn();
    const secondSend = vi.fn();
    const first = mockSocket(firstSend);
    const second = mockSocket(secondSend);
    const clients = new Set<BunWs>([first, second]);

    sendToClients(clients, '{"event":"tick"}');

    expect(firstSend).toHaveBeenCalledWith('{"event":"tick"}');
    expect(secondSend).toHaveBeenCalledWith('{"event":"tick"}');
    expect(clients.size).toBe(2);
  });

  it("drops a socket that throws on send", () => {
    const liveSend = vi.fn();
    const live = mockSocket(liveSend);
    const dead = mockSocket(() => {
      throw new Error("socket closed");
    });
    const clients = new Set<BunWs>([live, dead]);

    sendToClients(clients, "ping");

    expect(liveSend).toHaveBeenCalledWith("ping");
    expect(clients.has(live)).toBe(true);
    expect(clients.has(dead)).toBe(false);
    expect(clients.size).toBe(1);
  });

  it("does nothing when the client set is empty", () => {
    const clients = new Set<BunWs>();

    expect(() => sendToClients(clients, "ping")).not.toThrow();
    expect(clients.size).toBe(0);
  });
});
