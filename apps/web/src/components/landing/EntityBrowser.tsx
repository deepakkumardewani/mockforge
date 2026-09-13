"use client";

import { useState } from "react";
import Link from "next/link";
import { useRevealOnScroll } from "./useRevealOnScroll";
import { Section } from "./Section";
import { SECTION_IDENTITY } from "./depth";
import { EntityIcon } from "./entity-icons";
import { API_BASE } from "@/lib/api-client";

interface Entity {
  name: Parameters<typeof EntityIcon>[0]["name"];
  fields: string[];
  path: string;
  docsHref?: string;
}

function restDocsHref(apiPath: string): string | undefined {
  const slug = apiPath.replace(/^\/api\//, "");
  if (!slug || slug.includes("/")) return undefined;
  return `/docs/rest/${slug}`;
}

const FEATURED: Entity[] = [
  { name: "User", fields: ["firstName", "lastName", "email", "username"], path: "/api/users" },
  { name: "Product", fields: ["title", "price", "category", "brand"], path: "/api/products" },
  { name: "Post", fields: ["title", "body", "tags", "reactions"], path: "/api/posts" },
  { name: "Todo", fields: ["todo", "completed", "priority", "dueDate"], path: "/api/todos" },
  {
    name: "Notification",
    fields: ["type", "title", "message", "read"],
    path: "/api/notifications",
  },
  { name: "Event", fields: ["title", "category", "location", "startDate"], path: "/api/events" },
];

const ADDITIONAL: Entity[] = [
  { name: "Comment", fields: ["body", "author", "email", "postId"], path: "/api/comments" },
  { name: "Cart", fields: ["total", "totalProducts", "userId"], path: "/api/carts" },
  { name: "Message", fields: ["body", "senderId", "receiverId", "roomId"], path: "/api/messages" },
  { name: "Quote", fields: ["content", "author", "category"], path: "/api/quotes" },
  { name: "Recipe", fields: ["name", "cuisine", "difficulty", "calories"], path: "/api/recipes" },
  { name: "Country", fields: ["name", "capital", "region", "population"], path: "/api/countries" },
  { name: "Company", fields: ["name", "industry", "employees", "website"], path: "/api/companies" },
  { name: "Stock", fields: ["symbol", "price", "changePercent", "volume"], path: "/api/stocks" },
];

const ENTITY_CARD_CLASS =
  "entity-card group rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-raised)] p-4 transition-[border-color,box-shadow,transform] duration-200 hover:-translate-y-0.5 hover:border-[var(--color-accent)]/50 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)] motion-reduce:hover:translate-y-0";

function EntityCardBody({ entity }: { entity: Entity }) {
  return (
    <>
      <EntityIcon
        name={entity.name}
        width={24}
        height={24}
        className="text-[var(--color-accent)] transition-transform duration-200 group-hover:scale-110 motion-reduce:group-hover:scale-100"
      />
      <h3 className="mt-2 font-display text-sm font-semibold text-[var(--color-text-primary)]">
        {entity.name}
      </h3>
      <p className="mt-1 truncate font-mono text-[11px] text-[var(--color-text-muted)]">
        GET {entity.path}
      </p>
      <ul className="mt-2 space-y-0.5 border-t border-[var(--color-border)] pt-2">
        {entity.fields.map((field) => (
          <li key={field} className="truncate font-mono text-[11px] text-[var(--color-text-muted)]">
            {field}
          </li>
        ))}
      </ul>
    </>
  );
}

function EntityCard({ entity }: { entity: Entity }) {
  const href = entity.docsHref ?? restDocsHref(entity.path);
  if (!href) {
    return (
      <article className={ENTITY_CARD_CLASS}>
        <EntityCardBody entity={entity} />
      </article>
    );
  }
  return (
    <Link href={href} className={ENTITY_CARD_CLASS}>
      <EntityCardBody entity={entity} />
    </Link>
  );
}

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
  const [showAll, setShowAll] = useState(false);

  return (
    <Section ref={containerRef} className={SECTION_IDENTITY.entityBrowser}>
      <div className="section-heading mb-12 overflow-hidden sm:mb-16">
        <span
          className="mb-3 block font-mono text-xs font-medium uppercase tracking-[0.2em]"
          style={{ color: "var(--color-accent)" }}
        >
          Resources
        </span>
        <h2 className="font-display text-4xl font-bold text-[var(--color-text-primary)] sm:text-5xl">
          14 built-in resources, plus custom schemas
        </h2>
        <p className="mt-4 max-w-xl text-lg text-[var(--color-text-muted)]">
          Modeled fields with pagination and search on a shared hosted origin. Custom schemas live
          in the Builder. Base URL{" "}
          <code className="font-mono text-[0.95em] text-[var(--color-text-primary)]">
            {API_BASE}
          </code>
          .
        </p>
      </div>

      <div className="entity-grid grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        {FEATURED.map((entity) => (
          <EntityCard key={entity.name} entity={entity} />
        ))}
      </div>

      <div className="mt-6">
        <button
          type="button"
          aria-expanded={showAll}
          onClick={() => setShowAll((open) => !open)}
          className="rounded-lg border border-[var(--color-border)] px-4 py-2 text-sm font-medium text-[var(--color-text-primary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)]"
        >
          {showAll ? "Hide additional resources" : "Show 8 more resources"}
        </button>
      </div>

      {showAll && (
        <div className="entity-grid mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {ADDITIONAL.map((entity) => (
            <EntityCard key={entity.name} entity={entity} />
          ))}
        </div>
      )}

      <Link
        href="/builder"
        className="entity-card mt-8 flex flex-col gap-2 rounded-xl border border-[var(--color-border)] p-6 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)] sm:flex-row sm:items-center sm:justify-between"
        style={{ background: "var(--color-surface)" }}
      >
        <div>
          <p className="font-display text-lg font-bold text-[var(--color-text-primary)]">
            Custom schema
          </p>
          <p className="mt-1 text-sm text-[var(--color-text-muted)]">
            Define fields in the Builder and receive a hosted REST endpoint for that schema.
          </p>
        </div>
        <span className="text-sm font-semibold" style={{ color: "var(--color-accent)" }}>
          Open Builder
        </span>
      </Link>
    </Section>
  );
}
