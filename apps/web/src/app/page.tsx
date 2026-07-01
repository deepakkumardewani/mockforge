import { Nav } from "@/components/landing/Nav";
import { Hero } from "@/components/landing/Hero";
import { LiveDemo } from "@/components/landing/LiveDemo";
import { ProtocolShowcase } from "@/components/landing/ProtocolShowcase";
import { Capabilities } from "@/components/landing/Capabilities";
import { EntityBrowser } from "@/components/landing/EntityBrowser";
import { LiveCounter } from "@/components/landing/LiveCounter";
import { WhyMockForge } from "@/components/landing/WhyMockForge";
import { DXHighlights } from "@/components/landing/DXHighlights";
import { UseCasesTrust } from "@/components/landing/UseCasesTrust";
import { Quickstart } from "@/components/landing/Quickstart";
import { FinalCTA } from "@/components/landing/FinalCTA";
import { Footer } from "@/components/landing/Footer";
import { fetchStatsTotal } from "@/lib/stats";

export default async function HomePage() {
  const statsTotal = await fetchStatsTotal();

  return (
    <>
      <Nav />
      <main className="overflow-x-clip">
        <Hero requestsServed={statsTotal} />
        <LiveDemo />
        <ProtocolShowcase />
        <Capabilities />
        <EntityBrowser />
        <LiveCounter initialTotal={statsTotal} />
        <WhyMockForge />
        <DXHighlights />
        <UseCasesTrust />
        <Quickstart />
        <FinalCTA />
        <Footer />
      </main>
    </>
  );
}
