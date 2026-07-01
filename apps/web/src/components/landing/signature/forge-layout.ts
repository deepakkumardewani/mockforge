export const FORGE_PROTOCOLS = ["REST", "GraphQL", "WebSocket", "Socket.io"] as const;

export type ForgeProtocol = (typeof FORGE_PROTOCOLS)[number];

export interface ForgeNode {
  id: ForgeProtocol;
  x: number;
  y: number;
  label: string;
}

export interface ForgeLayout {
  center: { x: number; y: number; radius: number };
  nodes: ForgeNode[];
}

const NODE_ANGLES = [-Math.PI / 2, 0, Math.PI / 2, Math.PI] as const;

export function getForgeLayout(width: number, height: number): ForgeLayout {
  const cx = width * 0.5;
  const cy = height * 0.52;
  const orbitRadius = Math.min(width, height) * 0.32;
  const centerRadius = Math.min(width, height) * 0.09;

  const nodes = FORGE_PROTOCOLS.map((id, index) => ({
    id,
    label: id === "GraphQL" ? "GQL" : id === "Socket.io" ? "SIO" : id === "WebSocket" ? "WS" : id,
    x: cx + Math.cos(NODE_ANGLES[index]) * orbitRadius,
    y: cy + Math.sin(NODE_ANGLES[index]) * orbitRadius,
  }));

  return {
    center: { x: cx, y: cy, radius: centerRadius },
    nodes,
  };
}

export function getParticleProgress(time: number, index: number): number {
  return (time * 0.35 + index * 0.25) % 1;
}

export function lerpPoint(
  from: { x: number; y: number },
  to: { x: number; y: number },
  t: number,
): { x: number; y: number } {
  return {
    x: from.x + (to.x - from.x) * t,
    y: from.y + (to.y - from.y) * t,
  };
}
