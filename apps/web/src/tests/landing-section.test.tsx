import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import React from "react";

beforeEach(() => {
  vi.clearAllMocks();
});

describe("Section", () => {
  it("renders children inside the inner max-width container", async () => {
    const { Section } = await import("@/components/landing/Section");
    render(<Section>Section body</Section>);
    expect(screen.getByText("Section body")).toBeInTheDocument();
  });

  it("forwards id to the outer section element", async () => {
    const { Section } = await import("@/components/landing/Section");
    render(<Section id="integration">content</Section>);
    expect(document.getElementById("integration")).toBeInTheDocument();
  });

  it("renders backdrop before inner content", async () => {
    const { Section } = await import("@/components/landing/Section");
    render(<Section backdrop={<div data-testid="backdrop-layer">backdrop</div>}>content</Section>);
    const backdrop = screen.getByTestId("backdrop-layer");
    const section = backdrop.closest("section");
    expect(section).toBeInTheDocument();
    expect(section?.querySelector(".max-w-7xl")).toContainElement(screen.getByText("content"));
  });

  it("applies innerClassName to the inner wrapper", async () => {
    const { Section } = await import("@/components/landing/Section");
    const { container } = render(<Section innerClassName="inner-extra">content</Section>);
    expect(container.querySelector(".inner-extra")).toBeInTheDocument();
  });

  it("forwards ref to the section element", async () => {
    const { Section } = await import("@/components/landing/Section");
    const ref = React.createRef<HTMLElement>();
    render(<Section ref={ref}>content</Section>);
    expect(ref.current?.tagName).toBe("SECTION");
  });
});
