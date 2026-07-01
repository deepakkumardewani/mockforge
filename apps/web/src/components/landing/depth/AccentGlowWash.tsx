type GlowPosition = "top" | "bottom" | "center";

interface AccentGlowWashProps {
  position?: GlowPosition;
  className?: string;
}

const POSITION_CLASS: Record<GlowPosition, string> = {
  top: "accent-glow-wash-top",
  bottom: "accent-glow-wash-bottom",
  center: "accent-glow-wash-center",
};

/** Low-chroma molten-orange wash — not a decorative blob; ties to forge heat. */
export function AccentGlowWash({ position = "bottom", className = "" }: AccentGlowWashProps) {
  return (
    <div
      className={`section-backdrop pointer-events-none absolute inset-x-0 z-0 ${POSITION_CLASS[position]}${className ? ` ${className}` : ""}`}
      aria-hidden
    />
  );
}
