import type { Metadata } from "next";

const siteTitle = "MockForge — Hosted Mock API for Apps";
const siteDescription =
  "A hosted mock API with REST, GraphQL, WebSocket, and Socket.io over one schema and 15 typed resources. Call it directly from your app. No signup or API key required.";

export const siteMetadata: Metadata = {
  title: siteTitle,
  description: siteDescription,
  openGraph: {
    title: siteTitle,
    description: siteDescription,
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: siteTitle,
    description: siteDescription,
  },
};
