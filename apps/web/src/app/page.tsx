import { Nav } from "@/components/landing/Nav";
import { Hero } from "@/components/landing/Hero";
import { LiveDemo } from "@/components/landing/LiveDemo";
import { ProtocolShowcase } from "@/components/landing/ProtocolShowcase";
import { EntityBrowser } from "@/components/landing/EntityBrowser";
import { LiveCounter } from "@/components/landing/LiveCounter";
import { DXHighlights } from "@/components/landing/DXHighlights";
import { FinalCTA } from "@/components/landing/FinalCTA";
import { Footer } from "@/components/landing/Footer";

export default function HomePage() {
  return (
    <>
      <Nav />
      <main className="overflow-x-clip">
        <Hero />
        <LiveDemo />
        <ProtocolShowcase />
        <EntityBrowser />
        <LiveCounter />
        <DXHighlights />
        <FinalCTA />
        <Footer />
      </main>
    </>
  );
}
