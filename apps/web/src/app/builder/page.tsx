import { AppHeader } from "@/components/navigation/AppHeader";
import { BuilderShell } from "@/components/builder/BuilderShell";

export default function BuilderPage() {
  return (
    <div className="min-h-screen">
      <AppHeader />
      <BuilderShell />
    </div>
  );
}
