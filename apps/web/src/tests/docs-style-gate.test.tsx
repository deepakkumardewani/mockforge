import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { render, waitFor } from "@testing-library/react";
import { DocsStyleGate } from "@/components/docs/DocsStyleGate";

function appendFumadocsStylesheet(): HTMLLinkElement {
  const link = document.createElement("link");
  link.rel = "stylesheet";
  link.href = "https://cdn.example/fumadocs-ui.css";
  link.media = "print";
  document.head.appendChild(link);
  return link;
}

describe("DocsStyleGate", () => {
  let link: HTMLLinkElement;

  beforeEach(() => {
    link = appendFumadocsStylesheet();
  });

  afterEach(() => {
    link.remove();
    document.head.querySelectorAll('link[href*="fumadocs"]').forEach((node) => node.remove());
  });

  it("renders nothing visible", () => {
    const { container } = render(<DocsStyleGate />);
    expect(container.firstChild).toBeNull();
  });

  it("enables the fumadocs stylesheet while mounted", () => {
    render(<DocsStyleGate />);
    expect(link.media).toBe("all");
  });

  it("disables the fumadocs stylesheet on unmount", () => {
    const { unmount } = render(<DocsStyleGate />);
    expect(link.media).toBe("all");
    unmount();
    expect(link.media).toBe("print");
  });

  it("re-enables the stylesheet when a new fumadocs link is added to the head", async () => {
    render(<DocsStyleGate />);
    link.remove();

    const replacement = appendFumadocsStylesheet();
    await waitFor(() => {
      expect(replacement.media).toBe("all");
    });
    replacement.remove();
  });
});
