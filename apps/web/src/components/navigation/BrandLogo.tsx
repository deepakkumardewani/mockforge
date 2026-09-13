type BrandLogoProps = {
  className?: string;
};

export function BrandLogo({ className = "h-6 w-6" }: BrandLogoProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 32 32"
      className={`text-[var(--color-on-accent)] ${className}`}
      aria-hidden
    >
      <rect width="32" height="32" rx="7" fill="var(--color-accent)" />
      <path
        d="M8 23V9.5l8 6 8-6V23"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
