import type { ReactNode } from "react";

type Elevation = "raised" | "hover";

interface TonalPanelProps {
  elevation?: Elevation;
  className?: string;
  children: ReactNode;
}

const ELEVATION_CLASS: Record<Elevation, string> = {
  raised: "tonal-panel-raised",
  hover: "tonal-panel-hover",
};

/** Tonal surface panel using elevation tokens — no glass, no shadow slop. */
export function TonalPanel({ elevation = "raised", className = "", children }: TonalPanelProps) {
  return (
    <div className={`tonal-panel ${ELEVATION_CLASS[elevation]}${className ? ` ${className}` : ""}`}>
      {children}
    </div>
  );
}
