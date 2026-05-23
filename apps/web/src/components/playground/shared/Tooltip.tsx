"use client";

import * as RadixTooltip from "@radix-ui/react-tooltip";

export interface TooltipProps {
  /** Text shown in the floating bubble */
  label: string;
  children: React.ReactNode;
}

export function Tooltip({ label, children }: TooltipProps) {
  return (
    <RadixTooltip.Provider delayDuration={300}>
      <RadixTooltip.Root>
        <RadixTooltip.Trigger asChild>{children}</RadixTooltip.Trigger>
        <RadixTooltip.Portal>
          <RadixTooltip.Content
            sideOffset={6}
            className="z-50 select-none rounded-md border border-[var(--color-border)] bg-[var(--color-surface-raised)] px-2 py-1 text-xs font-medium text-[var(--color-text-primary)] shadow-lg"
          >
            {label}
            <RadixTooltip.Arrow className="fill-[var(--color-surface-raised)]" />
          </RadixTooltip.Content>
        </RadixTooltip.Portal>
      </RadixTooltip.Root>
    </RadixTooltip.Provider>
  );
}
