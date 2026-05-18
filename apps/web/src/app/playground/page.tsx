import type { Metadata } from "next";
import { Playground } from "@/components/playground/Playground";

export const metadata: Metadata = {
  title: "Playground — MockForge",
  description: "Try REST, GraphQL, WebSocket, and Socket.IO against the demo API.",
};

export default function PlaygroundPage() {
  return <Playground />;
}
