import type { Metadata } from "next";

const siteDescription =
  "REST, GraphQL, WebSocket, and Socket.io mock server with 15 typed resources. Spin up locally and point your client — no signup required.";

export const siteMetadata: Metadata = {
  title: "MockForge — Fake Data API for Local Dev",
  description: siteDescription,
  openGraph: {
    title: "MockForge — Fake Data API for Local Dev",
    description: siteDescription,
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "MockForge — Fake Data API for Local Dev",
    description: siteDescription,
  },
};
