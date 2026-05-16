"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

interface Entity {
  name: string;
  icon: string;
  fields: string[];
}

const ENTITIES: Entity[] = [
  {
    name: "User",
    icon: "👤",
    fields: ["firstName", "lastName", "email", "username"],
  },
  {
    name: "Product",
    icon: "📦",
    fields: ["title", "price", "category", "brand"],
  },
  {
    name: "Post",
    icon: "📝",
    fields: ["title", "body", "tags", "reactions"],
  },
  {
    name: "Comment",
    icon: "💬",
    fields: ["body", "author", "email", "postId"],
  },
  {
    name: "Todo",
    icon: "✅",
    fields: ["todo", "completed", "priority", "dueDate"],
  },
  {
    name: "Cart",
    icon: "🛒",
    fields: ["total", "totalProducts", "userId"],
  },
  {
    name: "Message",
    icon: "✉️",
    fields: ["body", "senderId", "receiverId", "roomId"],
  },
  {
    name: "Notification",
    icon: "🔔",
    fields: ["type", "title", "message", "read"],
  },
  {
    name: "Quote",
    icon: "💭",
    fields: ["content", "author", "category"],
  },
  {
    name: "Recipe",
    icon: "🍳",
    fields: ["name", "cuisine", "difficulty", "calories"],
  },
  {
    name: "Country",
    icon: "🌍",
    fields: ["name", "capital", "region", "population"],
  },
  {
    name: "Company",
    icon: "🏢",
    fields: ["name", "industry", "employees", "website"],
  },
  {
    name: "Stock",
    icon: "📈",
    fields: ["symbol", "price", "changePercent", "volume"],
  },
  {
    name: "Event",
    icon: "📅",
    fields: ["title", "category", "location", "startDate"],
  },
];

// Row size for stagger grouping
const ROW_SIZE = 7;

export function EntityBrowser() {
  const sectionRef = useRef<HTMLElement>(null);
  const cardsRef = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const ctx = gsap.context(() => {
      if (!sectionRef.current) return;

      gsap.fromTo(
        sectionRef.current.querySelector(".section-heading"),
        { clipPath: "inset(0 100% 0 0)", y: 6 },
        {
          clipPath: "inset(0 0% 0 0)",
          y: 0,
          duration: 0.8,
          ease: "power3.out",
          scrollTrigger: { trigger: sectionRef.current, start: "top 80%" },
        },
      );

      cardsRef.current.forEach((card, i) => {
        if (!card) return;
        const rowDelay = Math.floor(i / ROW_SIZE) * 0.12;
        const colDelay = (i % ROW_SIZE) * 0.04;
        gsap.fromTo(
          card,
          { y: 28, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.5,
            ease: "power2.out",
            delay: rowDelay + colDelay,
            scrollTrigger: {
              trigger: sectionRef.current!.querySelector(".entity-grid"),
              start: "top 85%",
            },
          },
        );
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} className="px-6 py-28 sm:px-10 lg:px-16">
      <div className="mx-auto max-w-7xl">
        <div className="section-heading mb-16 overflow-hidden">
          <span
            className="mb-3 block font-mono text-xs font-medium uppercase tracking-[0.2em]"
            style={{ color: "var(--color-accent)" }}
          >
            Entities
          </span>
          <h2 className="font-display text-4xl font-bold text-[var(--color-text-primary)] sm:text-5xl">
            14 entities, zero setup
          </h2>
          <p className="mt-4 max-w-xl text-lg text-[var(--color-text-muted)]">
            Every resource is available instantly via REST, GraphQL, and WebSocket. Each card lists
            the fields you can query — hit the docs or the playground for real responses.
          </p>
        </div>

        <div className="entity-grid grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-7">
          {ENTITIES.map((entity, i) => (
            <div
              key={entity.name}
              ref={(el) => {
                cardsRef.current[i] = el;
              }}
              className="group rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-raised)] p-4 transition-all duration-200 hover:scale-[1.02] hover:border-[var(--color-accent)] hover:shadow-lg"
            >
              <span className="text-2xl" aria-hidden>
                {entity.icon}
              </span>
              <h3 className="mt-2 font-display text-sm font-semibold text-[var(--color-text-primary)]">
                {entity.name}
              </h3>
              <ul className="mt-1 space-y-0.5">
                {entity.fields.map((field) => (
                  <li key={field} className="font-mono text-xs text-[var(--color-text-muted)]">
                    {field}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
