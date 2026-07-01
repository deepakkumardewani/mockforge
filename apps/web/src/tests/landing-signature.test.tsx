import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import {
  FORGE_PROTOCOLS,
  getForgeLayout,
  getParticleProgress,
} from "@/components/landing/signature/forge-layout";

vi.mock("gsap", () => ({
  default: {
    registerPlugin: vi.fn(),
    context: vi.fn(() => ({ revert: vi.fn() })),
    timeline: vi.fn(() => ({ fromTo: vi.fn().mockReturnThis() })),
    fromTo: vi.fn(),
    to: vi.fn(),
    getProperty: vi.fn(() => 0),
  },
}));

beforeEach(() => {
  vi.clearAllMocks();
  Object.defineProperty(HTMLCanvasElement.prototype, "getContext", {
    configurable: true,
    value: vi.fn(() => ({
      clearRect: vi.fn(),
      beginPath: vi.fn(),
      moveTo: vi.fn(),
      lineTo: vi.fn(),
      arc: vi.fn(),
      fill: vi.fn(),
      stroke: vi.fn(),
      fillText: vi.fn(),
      createRadialGradient: vi.fn(() => ({ addColorStop: vi.fn() })),
      setTransform: vi.fn(),
    })),
  });
});

describe("forge-layout", () => {
  it("places four protocol nodes around a central schema hub", () => {
    const layout = getForgeLayout(800, 600);
    expect(layout.nodes).toHaveLength(4);
    expect(layout.nodes.map((node) => node.id)).toEqual([...FORGE_PROTOCOLS]);
    expect(layout.center.radius).toBeGreaterThan(0);
  });

  it("wraps particle progress between 0 and 1", () => {
    expect(getParticleProgress(0, 0)).toBe(0);
    expect(getParticleProgress(10, 1)).toBeGreaterThanOrEqual(0);
    expect(getParticleProgress(10, 1)).toBeLessThan(1);
  });
});

describe("ProtocolForgeCanvas", () => {
  it("mounts the lazy signature canvas with protocol metadata", async () => {
    const { ProtocolForgeCanvas } = await import(
      "@/components/landing/signature/ProtocolForgeCanvas"
    );
    const { container } = render(<ProtocolForgeCanvas className="test-canvas" />);
    const canvas = container.querySelector("canvas.test-canvas");
    expect(canvas).toBeInTheDocument();
    expect(canvas).toHaveAttribute("data-protocols", FORGE_PROTOCOLS.join(","));
    expect(canvas).toHaveAttribute("aria-hidden", "true");
  });
});

describe("Hero signature integration", () => {
  it("renders live request proof when count is provided", async () => {
    const { Hero } = await import("@/components/landing/Hero");
    render(<Hero requestsServed={98765} />);
    expect(screen.getByText(/98,765/i)).toBeInTheDocument();
    expect(screen.getByText(/live requests served on the mock server/i)).toBeInTheDocument();
  });
});
