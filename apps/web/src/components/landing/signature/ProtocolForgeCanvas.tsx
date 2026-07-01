"use client";

import { useCallback, useEffect, useRef } from "react";
import { FORGE_PROTOCOLS, getForgeLayout, getParticleProgress, lerpPoint } from "./forge-layout";

type ProtocolForgeCanvasProps = {
  className?: string;
};

interface ForgeTheme {
  accent: string;
  surfaceRaised: string;
  surfaceHover: string;
  border: string;
  textPrimary: string;
}

function readForgeTheme(): ForgeTheme {
  if (typeof window === "undefined") {
    return {
      accent: "#ff6a3d",
      surfaceRaised: "#1a1a1a",
      surfaceHover: "#222222",
      border: "#333333",
      textPrimary: "#f5f5f5",
    };
  }

  const styles = getComputedStyle(document.documentElement);
  const read = (token: string, fallback: string) =>
    styles.getPropertyValue(token).trim() || fallback;

  return {
    accent: read("--color-accent", "#ff6a3d"),
    surfaceRaised: read("--color-surface-raised", "#1a1a1a"),
    surfaceHover: read("--color-surface-hover", "#222222"),
    border: read("--color-border", "#333333"),
    textPrimary: read("--color-text-primary", "#f5f5f5"),
  };
}

function drawForgeFrame(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  time: number,
  options: { staticMode: boolean; hoverIndex: number | null; theme: ForgeTheme },
) {
  const { staticMode, hoverIndex, theme } = options;
  const { accent } = theme;
  const layout = getForgeLayout(width, height);

  ctx.clearRect(0, 0, width, height);

  layout.nodes.forEach((node, index) => {
    const isHovered = hoverIndex === index;
    ctx.beginPath();
    ctx.moveTo(layout.center.x, layout.center.y);
    ctx.lineTo(node.x, node.y);
    ctx.strokeStyle = accent;
    ctx.globalAlpha = isHovered ? 0.55 : 0.22;
    ctx.lineWidth = isHovered ? 2 : 1;
    ctx.stroke();
    ctx.globalAlpha = 1;

    if (!staticMode) {
      const progress = getParticleProgress(time, index);
      const particle = lerpPoint(layout.center, node, progress);
      ctx.beginPath();
      ctx.arc(particle.x, particle.y, 3, 0, Math.PI * 2);
      ctx.fillStyle = accent;
      ctx.globalAlpha = 0.85;
      ctx.fill();
      ctx.globalAlpha = 1;
    }
  });

  const pulse = staticMode ? 1 : 1 + Math.sin(time * 2.2) * 0.06;
  const centerGlow = ctx.createRadialGradient(
    layout.center.x,
    layout.center.y,
    0,
    layout.center.x,
    layout.center.y,
    layout.center.radius * 3.2 * pulse,
  );
  centerGlow.addColorStop(0, accent);
  centerGlow.addColorStop(1, "transparent");
  ctx.globalAlpha = 0.35;
  ctx.fillStyle = centerGlow;
  ctx.beginPath();
  ctx.arc(layout.center.x, layout.center.y, layout.center.radius * 3.2, 0, Math.PI * 2);
  ctx.fill();
  ctx.globalAlpha = 1;

  ctx.beginPath();
  ctx.arc(layout.center.x, layout.center.y, layout.center.radius, 0, Math.PI * 2);
  ctx.fillStyle = theme.surfaceRaised;
  ctx.fill();
  ctx.strokeStyle = accent;
  ctx.lineWidth = 1.5;
  ctx.stroke();

  ctx.fillStyle = accent;
  ctx.font = "600 11px var(--font-mono, ui-monospace, monospace)";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("Schema", layout.center.x, layout.center.y);

  layout.nodes.forEach((node, index) => {
    const isHovered = hoverIndex === index;
    const nodeRadius = isHovered ? 26 : 22;

    ctx.beginPath();
    ctx.arc(node.x, node.y, nodeRadius, 0, Math.PI * 2);
    ctx.fillStyle = isHovered ? theme.surfaceHover : theme.surfaceRaised;
    ctx.fill();
    ctx.strokeStyle = isHovered ? accent : theme.border;
    ctx.lineWidth = isHovered ? 1.5 : 1;
    ctx.stroke();

    ctx.fillStyle = isHovered ? accent : theme.textPrimary;
    ctx.font = `${isHovered ? 600 : 500} 10px var(--font-mono, ui-monospace, monospace)`;
    ctx.fillText(node.label, node.x, node.y);
  });
}

export function ProtocolForgeCanvas({ className }: ProtocolForgeCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const frameRef = useRef(0);
  const hoverRef = useRef<number | null>(null);
  const themeRef = useRef<ForgeTheme>(readForgeTheme());

  const hitTest = useCallback((clientX: number, clientY: number): number | null => {
    const canvas = canvasRef.current;
    if (!canvas) return null;

    const rect = canvas.getBoundingClientRect();
    const x = clientX - rect.left;
    const y = clientY - rect.top;
    const layout = getForgeLayout(rect.width, rect.height);

    for (let index = layout.nodes.length - 1; index >= 0; index -= 1) {
      const node = layout.nodes[index];
      const dx = x - node.x;
      const dy = y - node.y;
      if (Math.hypot(dx, dy) <= 28) return index;
    }
    return null;
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    themeRef.current = readForgeTheme();
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resizeAndDraw = (time = 0, staticMode = prefersReducedMotion) => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const rect = canvas.getBoundingClientRect();
      canvas.width = Math.max(1, Math.floor(rect.width * dpr));
      canvas.height = Math.max(1, Math.floor(rect.height * dpr));
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      drawForgeFrame(ctx, rect.width, rect.height, time, {
        staticMode,
        hoverIndex: hoverRef.current,
        theme: themeRef.current,
      });
    };

    resizeAndDraw();

    const onResize = () => resizeAndDraw();
    window.addEventListener("resize", onResize);

    if (prefersReducedMotion) {
      return () => window.removeEventListener("resize", onResize);
    }

    const start = performance.now();
    const animate = (now: number) => {
      const rect = canvas.getBoundingClientRect();
      drawForgeFrame(ctx, rect.width, rect.height, (now - start) / 1000, {
        staticMode: false,
        hoverIndex: hoverRef.current,
        theme: themeRef.current,
      });
      frameRef.current = requestAnimationFrame(animate);
    };
    frameRef.current = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener("resize", onResize);
      cancelAnimationFrame(frameRef.current);
    };
  }, []);

  const handlePointerMove = (event: React.PointerEvent<HTMLCanvasElement>) => {
    const next = hitTest(event.clientX, event.clientY);
    if (next === hoverRef.current) return;
    hoverRef.current = next;
    canvasRef.current?.style.setProperty("cursor", next !== null ? "pointer" : "default");
  };

  const handlePointerLeave = () => {
    hoverRef.current = null;
    if (canvasRef.current) canvasRef.current.style.cursor = "default";
  };

  return (
    <canvas
      ref={canvasRef}
      className={className}
      aria-hidden
      role="presentation"
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
      data-protocols={FORGE_PROTOCOLS.join(",")}
    />
  );
}
