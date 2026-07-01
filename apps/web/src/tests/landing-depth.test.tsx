import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import {
  DepthTexture,
  AccentGlowWash,
  TonalPanel,
  LANDING_SECTION_IDENTITY_SEQUENCE,
} from "@/components/landing/depth";

describe("DepthTexture", () => {
  it("renders dot variant without errors", () => {
    const { container } = render(<DepthTexture variant="dot" />);
    expect(container.firstChild).toHaveClass("depth-texture-dot");
  });

  it("renders grid variant without errors", () => {
    const { container } = render(<DepthTexture variant="grid" />);
    expect(container.firstChild).toHaveClass("depth-texture-grid");
  });
});

describe("AccentGlowWash", () => {
  it("renders bottom wash without errors", () => {
    const { container } = render(<AccentGlowWash position="bottom" />);
    expect(container.firstChild).toHaveClass("accent-glow-wash-bottom");
  });
});

describe("TonalPanel", () => {
  it("renders children in raised panel", () => {
    render(<TonalPanel>Panel content</TonalPanel>);
    expect(screen.getByText("Panel content")).toBeInTheDocument();
  });
});

describe("section identity sequence", () => {
  it("has no adjacent duplicate identities", () => {
    for (let i = 1; i < LANDING_SECTION_IDENTITY_SEQUENCE.length; i++) {
      expect(LANDING_SECTION_IDENTITY_SEQUENCE[i]).not.toBe(
        LANDING_SECTION_IDENTITY_SEQUENCE[i - 1],
      );
    }
  });
});
