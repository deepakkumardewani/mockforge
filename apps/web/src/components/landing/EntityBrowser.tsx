"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

interface Entity {
  name: string;
  icon: string;
  fields: string[];
  sample: Record<string, unknown>;
}

const ENTITIES: Entity[] = [
  {
    name: "User",
    icon: "👤",
    fields: ["firstName", "lastName", "email", "username"],
    sample: {
      firstName: "Jane",
      lastName: "Cooper",
      email: "jane@example.com",
      username: "janec",
    },
  },
  {
    name: "Product",
    icon: "📦",
    fields: ["title", "price", "category", "brand"],
    sample: {
      title: "Wireless Headphones",
      price: 79.99,
      category: "Electronics",
      brand: "SoundMax",
    },
  },
  {
    name: "Post",
    icon: "📝",
    fields: ["title", "body", "tags", "reactions"],
    sample: {
      title: "Getting Started with MockForge",
      body: "MockForge makes API prototyping...",
      tags: ["api", "tutorial"],
      reactions: 42,
    },
  },
  {
    name: "Comment",
    icon: "💬",
    fields: ["body", "author", "email", "postId"],
    sample: {
      body: "Great article! Very helpful.",
      author: "Alex Chen",
      email: "alex@example.com",
      postId: "a1b2c3",
    },
  },
  {
    name: "Todo",
    icon: "✅",
    fields: ["todo", "completed", "priority", "dueDate"],
    sample: {
      todo: "Set up CI pipeline",
      completed: false,
      priority: "high",
      dueDate: "2026-05-15",
    },
  },
  {
    name: "Cart",
    icon: "🛒",
    fields: ["total", "totalProducts", "userId"],
    sample: {
      total: 249.97,
      totalProducts: 3,
      userId: "u1",
    },
  },
  {
    name: "Message",
    icon: "✉️",
    fields: ["body", "senderId", "receiverId", "roomId"],
    sample: {
      body: "Hey, did you see the new release?",
      senderId: "u1",
      receiverId: "u2",
      roomId: "general",
    },
  },
  {
    name: "Notification",
    icon: "🔔",
    fields: ["type", "title", "message", "read"],
    sample: {
      type: "success",
      title: "Deployment complete",
      message: "v2.1.0 is now live.",
      read: false,
    },
  },
  {
    name: "Quote",
    icon: "💭",
    fields: ["content", "author", "category"],
    sample: {
      content: "The only way to do great work is to love what you do.",
      author: "Steve Jobs",
      category: "inspiration",
    },
  },
  {
    name: "Recipe",
    icon: "🍳",
    fields: ["name", "cuisine", "difficulty", "calories"],
    sample: {
      name: "Chicken Tikka Masala",
      cuisine: "Indian",
      difficulty: "medium",
      calories: 420,
    },
  },
  {
    name: "Country",
    icon: "🌍",
    fields: ["name", "capital", "region", "population"],
    sample: {
      name: "Japan",
      capital: "Tokyo",
      region: "Asia",
      population: 125800000,
    },
  },
  {
    name: "Company",
    icon: "🏢",
    fields: ["name", "industry", "employees", "website"],
    sample: {
      name: "Acme Corp",
      industry: "Technology",
      employees: 5000,
      website: "acme.example.com",
    },
  },
  {
    name: "Stock",
    icon: "📈",
    fields: ["symbol", "price", "changePercent", "volume"],
    sample: {
      symbol: "AAPL",
      price: 182.63,
      changePercent: 1.24,
      volume: 52400000,
    },
  },
  {
    name: "Event",
    icon: "📅",
    fields: ["title", "category", "location", "startDate"],
    sample: {
      title: "Tech Conference 2026",
      category: "Technology",
      location: "San Francisco",
      startDate: "2026-08-12",
    },
  },
];

export function EntityBrowser() {
  const sectionRef = useRef<HTMLElement>(null);
  const cardsRef = useRef<(HTMLDivElement | null)[]>([]);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      if (!sectionRef.current) return;
      gsap.fromTo(
        sectionRef.current.querySelector(".section-heading"),
        { y: 30, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.7,
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top 80%",
          },
        },
      );

      cardsRef.current.forEach((card, i) => {
        if (!card) return;
        gsap.fromTo(
          card,
          { y: 30, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.5,
            delay: i * 0.05,
            scrollTrigger: {
              trigger: card,
              start: "top 95%",
            },
          },
        );
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      className="px-4 py-24 sm:px-6 lg:px-8"
    >
      <div className="mx-auto max-w-6xl">
        <div className="section-heading mb-16 text-center">
          <h2 className="text-3xl font-bold text-[var(--color-text-primary)] sm:text-4xl">
            14 Entities, Zero Setup
          </h2>
          <p className="mt-4 text-lg text-[var(--color-text-muted)]">
            Every entity is available instantly via REST, GraphQL, and
            WebSocket. Hover to preview sample data.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7">
          {ENTITIES.map((entity, i) => (
            <div
              key={entity.name}
              ref={(el) => {
                cardsRef.current[i] = el;
              }}
              onMouseEnter={() => setHoveredIndex(i)}
              onMouseLeave={() => setHoveredIndex(null)}
              className="relative rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-raised)] p-4 transition-all hover:border-[var(--color-accent)] hover:shadow-md"
            >
              <span className="text-2xl">{entity.icon}</span>
              <h3 className="mt-2 text-sm font-semibold text-[var(--color-text-primary)]">
                {entity.name}
              </h3>
              <ul className="mt-1 space-y-0.5">
                {entity.fields.map((field) => (
                  <li
                    key={field}
                    className="font-mono text-xs text-[var(--color-text-muted)]"
                  >
                    {field}
                  </li>
                ))}
              </ul>

              {/* Hover preview tooltip */}
              {hoveredIndex === i && (
                <div className="absolute -top-2 left-1/2 z-20 w-48 -translate-x-1/2 -translate-y-full rounded-lg border border-[var(--color-border)] bg-[var(--color-code-bg)] p-3 shadow-xl">
                  <pre className="whitespace-pre-wrap font-mono text-xs leading-relaxed text-[var(--color-code-text)]">
                    {JSON.stringify(entity.sample, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
