"use client";

import { useRevealOnScroll } from "./useRevealOnScroll";
import { Section } from "./Section";
import { SECTION_IDENTITY } from "./depth";
import { EntityIcon } from "./entity-icons";

interface Entity {
  name: Parameters<typeof EntityIcon>[0]["name"];
  fields: string[];
}

const ENTITIES: Entity[] = [
  { name: "User", fields: ["firstName", "lastName", "email", "username"] },
  { name: "Product", fields: ["title", "price", "category", "brand"] },
  { name: "Post", fields: ["title", "body", "tags", "reactions"] },
  { name: "Comment", fields: ["body", "author", "email", "postId"] },
  { name: "Todo", fields: ["todo", "completed", "priority", "dueDate"] },
  { name: "Cart", fields: ["total", "totalProducts", "userId"] },
  { name: "Message", fields: ["body", "senderId", "receiverId", "roomId"] },
  { name: "Notification", fields: ["type", "title", "message", "read"] },
  { name: "Quote", fields: ["content", "author", "category"] },
  { name: "Recipe", fields: ["name", "cuisine", "difficulty", "calories"] },
  { name: "Country", fields: ["name", "capital", "region", "population"] },
  { name: "Company", fields: ["name", "industry", "employees", "website"] },
  { name: "Stock", fields: ["symbol", "price", "changePercent", "volume"] },
  { name: "Event", fields: ["title", "category", "location", "startDate"] },
  { name: "Custom", fields: ["schema", "slug", "fields", "Builder"] },
];

export function EntityBrowser() {
  const containerRef = useRevealOnScroll([
    {
      selector: ".section-heading",
      from: { clipPath: "inset(0 100% 0 0)", y: 6 },
      to: { clipPath: "inset(0 0% 0 0)", y: 0, duration: 0.8, ease: "power3.out" },
    },
    {
      selector: ".entity-card",
      from: { y: 24, opacity: 0 },
      to: { y: 0, opacity: 1, duration: 0.45, ease: "power2.out" },
      stagger: 0.04,
      triggerStart: "top 85%",
    },
  ]);

  return (
    <Section ref={containerRef} className={SECTION_IDENTITY.entityBrowser}>
      <div className="section-heading mb-12 overflow-hidden sm:mb-16">
        <span
          className="mb-3 block font-mono text-xs font-medium uppercase tracking-[0.2em]"
          style={{ color: "var(--color-accent)" }}
        >
          Schema
        </span>
        <h2 className="font-display text-4xl font-bold text-[var(--color-text-primary)] sm:text-5xl">
          15 typed resources
        </h2>
        <p className="mt-4 max-w-xl text-lg text-[var(--color-text-muted)]">
          Modeled fields with pagination and search on every resource — pick one and query it.
        </p>
      </div>

      <div className="entity-grid grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7">
        {ENTITIES.map((entity) => (
          <div
            key={entity.name}
            className="entity-card group rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-raised)] p-4 transition-[border-color,box-shadow,transform] duration-200 hover:-translate-y-0.5 hover:border-[var(--color-accent)]/50 hover:shadow-md motion-reduce:hover:translate-y-0"
          >
            <EntityIcon
              name={entity.name}
              width={24}
              height={24}
              className="text-[var(--color-accent)] transition-transform duration-200 group-hover:scale-110 motion-reduce:group-hover:scale-100"
            />
            <h3 className="mt-2 font-display text-sm font-semibold text-[var(--color-text-primary)]">
              {entity.name}
            </h3>
            <ul className="mt-2 space-y-0.5 border-t border-[var(--color-border)] pt-2">
              {entity.fields.map((field) => (
                <li
                  key={field}
                  className="truncate font-mono text-[11px] text-[var(--color-text-muted)]"
                >
                  {field}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </Section>
  );
}
