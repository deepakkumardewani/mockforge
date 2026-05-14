import { Hero } from "@/components/landing/Hero";
import { ProtocolShowcase } from "@/components/landing/ProtocolShowcase";
import { EntityBrowser } from "@/components/landing/EntityBrowser";
import { LiveCounter } from "@/components/landing/LiveCounter";
import { DXHighlights } from "@/components/landing/DXHighlights";
import { Footer } from "@/components/landing/Footer";

export default function HomePage() {
  return (
    <main>
      <Hero />
      <ProtocolShowcase />
      <EntityBrowser />
      <LiveCounter />
      <DXHighlights />
      <Footer />
    </main>
  );
}
