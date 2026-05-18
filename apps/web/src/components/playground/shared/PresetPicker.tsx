export interface PresetPickerProps<T extends { readonly id: string; readonly label: string }> {
  presets: readonly T[];
  onSelect: (preset: T) => void;
  /** Accessible name for the chip group */
  ariaLabel?: string;
}

export function PresetPicker<T extends { readonly id: string; readonly label: string }>({
  presets,
  onSelect,
  ariaLabel = "Example presets",
}: PresetPickerProps<T>) {
  return (
    <div
      aria-label={ariaLabel}
      role="toolbar"
      aria-orientation="horizontal"
      className="flex min-w-0 flex-wrap gap-2"
    >
      {presets.map((preset) => (
        <button
          key={preset.id}
          type="button"
          onClick={() => onSelect(preset)}
          className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-1.5 text-left text-xs font-medium text-[var(--color-text-primary)] transition-colors hover:bg-[var(--color-surface-hover)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--color-surface)]"
        >
          {preset.label}
        </button>
      ))}
    </div>
  );
}
