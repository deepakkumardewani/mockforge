"use client";

import { useCallback, useId, useRef, useState } from "react";
import type { HttpMethod } from "@/components/playground/shared/presets";
import { filterEndpoints } from "@/components/playground/shared/playground-catalogue";

export interface EndpointAutocompleteProps {
  value: string;
  onChange: (value: string) => void;
  onMethodChange: (method: HttpMethod) => void;
}

const UNAMBIGUOUS_METHODS: Record<string, HttpMethod> = {
  POST: "POST",
  PUT: "PUT",
  DELETE: "DELETE",
};

export function EndpointAutocomplete({
  value,
  onChange,
  onMethodChange,
}: EndpointAutocompleteProps) {
  const listboxId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);

  const suggestions = filterEndpoints(value);

  const close = useCallback(() => {
    setOpen(false);
    setActiveIndex(-1);
  }, []);

  function handleSelect(index: number) {
    const endpoint = suggestions[index];
    if (!endpoint) return;
    // Strip leading slash to keep value consistent with typed suffix
    onChange(endpoint.path.replace(/^\//, ""));
    if (UNAMBIGUOUS_METHODS[endpoint.method]) {
      onMethodChange(endpoint.method);
    } else {
      onMethodChange("GET");
    }
    close();
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (!open) {
      if (e.key === "ArrowDown") {
        setOpen(true);
        setActiveIndex(0);
        e.preventDefault();
      }
      return;
    }

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setActiveIndex((i) => Math.min(i + 1, suggestions.length - 1));
        break;
      case "ArrowUp":
        e.preventDefault();
        setActiveIndex((i) => Math.max(i - 1, 0));
        break;
      case "Enter":
        e.preventDefault();
        if (activeIndex >= 0) handleSelect(activeIndex);
        else close();
        break;
      case "Escape":
        e.preventDefault();
        close();
        break;
    }
  }

  return (
    <div className="relative flex min-w-0 flex-1 items-stretch">
      {/* Fixed /api/ prefix adornment */}
      <span
        aria-hidden="true"
        className="flex items-center rounded-l-lg bg-[var(--color-surface)] px-3 py-2 font-mono text-sm text-[var(--color-text-muted)] select-none border-r border-[var(--color-border)]"
      >
        /api/
      </span>
      <input
        ref={inputRef}
        role="combobox"
        aria-autocomplete="list"
        aria-expanded={open}
        aria-controls={open ? listboxId : undefined}
        aria-activedescendant={
          open && activeIndex >= 0 ? `${listboxId}-opt-${activeIndex}` : undefined
        }
        value={value}
        onChange={(e) => {
          onChange(e.target.value);
          setOpen(true);
          setActiveIndex(-1);
        }}
        onFocus={() => setOpen(true)}
        onBlur={() => {
          // Delay close so click on option fires first
          setTimeout(close, 150);
        }}
        onKeyDown={handleKeyDown}
        placeholder="users"
        aria-label="Request URL suffix"
        className="min-w-0 flex-1 rounded-r-lg bg-[var(--color-surface)] px-3 py-2 font-mono text-sm text-[var(--color-text-primary)] outline-none ring-[var(--color-accent)] placeholder:text-[var(--color-text-muted)] focus-visible:ring-2"
      />

      {open && suggestions.length > 0 && (
        <ul
          id={listboxId}
          role="listbox"
          aria-label="Endpoint suggestions"
          className="absolute top-full left-0 z-50 mt-1 max-h-64 w-full overflow-y-auto rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-raised)] py-1 shadow-lg"
        >
          {suggestions.map((endpoint, i) => (
            <li
              key={`${endpoint.method}-${endpoint.path}`}
              id={`${listboxId}-opt-${i}`}
              role="option"
              aria-selected={i === activeIndex}
              onMouseDown={(e) => {
                // Prevent blur before click registers
                e.preventDefault();
                handleSelect(i);
              }}
              className={`flex cursor-pointer items-center gap-3 px-3 py-2 font-mono text-sm ${
                i === activeIndex
                  ? "bg-[var(--color-accent)] text-[var(--color-bg)]"
                  : "text-[var(--color-text-primary)] hover:bg-[var(--color-surface)]"
              }`}
            >
              <span
                className={`w-16 shrink-0 text-xs font-semibold ${
                  i === activeIndex ? "text-[var(--color-bg)]" : "text-[var(--color-accent)]"
                }`}
              >
                {endpoint.method}
              </span>
              <span>/api{endpoint.path}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
