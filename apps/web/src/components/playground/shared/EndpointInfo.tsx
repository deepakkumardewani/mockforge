export interface EndpointInfoProps {
  readonly description: string;
}

export function EndpointInfo({ description }: EndpointInfoProps) {
  return <p className="text-xs leading-relaxed text-[var(--color-text-muted)]">{description}</p>;
}
