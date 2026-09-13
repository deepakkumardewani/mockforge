interface DestructiveIconButtonProps {
  label: string;
  onClick: () => void;
  className?: string;
  disabled?: boolean;
  hidden?: boolean;
}

export function DestructiveIconButton({
  label,
  onClick,
  className = "",
  disabled = false,
  hidden = false,
}: DestructiveIconButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      hidden={hidden}
      aria-label={label}
      title={label}
      className={`rounded-md p-2 text-[var(--color-status-error)] outline-none transition-colors hover:bg-[var(--color-status-error)]/10 focus-visible:ring-2 focus-visible:ring-[var(--color-status-error)] disabled:pointer-events-none disabled:opacity-40 ${className}`}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M3 6h18" />
        <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
        <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
      </svg>
    </button>
  );
}
