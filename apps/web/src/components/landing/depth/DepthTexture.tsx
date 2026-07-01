import type { ReactNode } from "react";

type TextureVariant = "grid" | "dot";

interface DepthTextureProps {
  variant?: TextureVariant;
  className?: string;
  children?: ReactNode;
}

const VARIANT_CLASS: Record<TextureVariant, string> = {
  grid: "depth-texture-grid",
  dot: "depth-texture-dot",
};

/** Subtle grid or dot texture layer — static, reduced-motion safe, low contrast. */
export function DepthTexture({ variant = "dot", className = "", children }: DepthTextureProps) {
  return (
    <div
      className={`section-backdrop pointer-events-none absolute inset-0 z-0 ${VARIANT_CLASS[variant]}${className ? ` ${className}` : ""}`}
      aria-hidden
    >
      {children}
    </div>
  );
}
