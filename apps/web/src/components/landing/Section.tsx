import type { ReactNode, Ref } from "react";

interface SectionProps {
  children: ReactNode;
  /** Full-bleed depth layer — rendered on the section, below content. */
  backdrop?: ReactNode;
  className?: string;
  innerClassName?: string;
  id?: string;
  ref?: Ref<HTMLElement>;
}

export function Section({ children, backdrop, className, innerClassName, id, ref }: SectionProps) {
  return (
    <section
      ref={ref}
      id={id}
      className={`landing-section scroll-mt-[4.75rem] px-6 py-24 sm:px-10 sm:py-28 lg:px-16 lg:py-32${className ? ` ${className}` : ""}`}
    >
      {backdrop}
      <div
        className={`relative z-10 mx-auto max-w-7xl${innerClassName ? ` ${innerClassName}` : ""}`}
      >
        {children}
      </div>
    </section>
  );
}
