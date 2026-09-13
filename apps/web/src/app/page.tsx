import { AppHeader } from "@/components/navigation/AppHeader";
import { Hero } from "@/components/landing/Hero";
import { LiveDemo } from "@/components/landing/LiveDemo";
import { ProtocolShowcase } from "@/components/landing/ProtocolShowcase";
import { EntityBrowser } from "@/components/landing/EntityBrowser";
import { WhyMockForge } from "@/components/landing/WhyMockForge";
import { UseCasesTrust } from "@/components/landing/UseCasesTrust";
import { Quickstart } from "@/components/landing/Quickstart";
import { FinalCTA } from "@/components/landing/FinalCTA";
import { Footer } from "@/components/landing/Footer";
import { fetchStatsTotal } from "@/lib/stats";

export default async function HomePage() {
  const statsTotal = await fetchStatsTotal();

  return (
    <>
      <AppHeader />
      <main className="overflow-x-clip">
        <Hero />
        <LiveDemo requestsServed={statsTotal} />
        <ProtocolShowcase />
        <EntityBrowser />
        <WhyMockForge />
        <Quickstart />
        <UseCasesTrust />
        <FinalCTA />
        <Footer />
      </main>
    </>
  );
}
