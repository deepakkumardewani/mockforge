import { Tooltip } from "@/components/playground/shared/Tooltip";

type PresetChip = {
  readonly id: string;
  readonly label: string;
  readonly description?: string;
};

export interface PresetPickerProps<T extends PresetChip> {
  presets: readonly T[];
  onSelect: (preset: T) => void;
  /** Accessible name for the chip group */
  ariaLabel?: string;
  selectedId?: string;
}

const CHIP_BASE =
  "rounded-lg border bg-[var(--color-surface)] px-3 py-1.5 text-left text-xs font-medium transition-colors hover:bg-[var(--color-surface-hover)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--color-surface)]";

function chipClassName(selected: boolean): string {
  return selected
    ? `${CHIP_BASE} border-[var(--color-accent)] text-[var(--color-accent)]`
    : `${CHIP_BASE} border-[var(--color-border)] text-[var(--color-text-primary)]`;
}

export function PresetPicker<T extends PresetChip>({
  presets,
  onSelect,
  ariaLabel = "Example presets",
  selectedId,
}: PresetPickerProps<T>) {
  return (
    <div
      aria-label={ariaLabel}
      role="toolbar"
      aria-orientation="horizontal"
      className="flex min-w-0 flex-wrap gap-2"
    >
      {presets.map((preset) => {
        const button = (
          <button
            key={preset.id}
            type="button"
            onClick={() => onSelect(preset)}
            className={chipClassName(preset.id === selectedId)}
          >
            {preset.label}
          </button>
        );

        if (!preset.description) {
          return button;
        }

        return (
          <Tooltip key={preset.id} label={preset.description}>
            {button}
          </Tooltip>
        );
      })}
    </div>
  );
}
