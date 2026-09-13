"use client";

import { useId, useState, type FormEvent } from "react";
import { restoreMfId } from "@/hooks/use-mf-id";
import { useMfIdStore } from "@/store/mf-id";

type Status =
  | "idle"
  | "copied"
  | "copy-failed"
  | "pasted"
  | "paste-failed"
  | "restored"
  | "empty"
  | "invalid";

interface Props {
  mfId?: string;
  onDismiss?: () => void;
}

const STATUS_MESSAGE: Record<Status, string> = {
  idle: "",
  copied: "Recovery key copied to clipboard.",
  "copy-failed": "Couldn’t copy. Select the key and copy it manually.",
  pasted: "Pasted recovery key. Review it, then restore.",
  "paste-failed": "Couldn’t read the clipboard. Paste the key into the field.",
  restored: "Recovery key restored. Schema management now uses this identity.",
  empty: "Paste a recovery key to restore.",
  invalid: "Enter a valid UUID recovery key.",
};

function isErrorStatus(status: Status) {
  return (
    status === "copy-failed" ||
    status === "paste-failed" ||
    status === "empty" ||
    status === "invalid"
  );
}

export function MfIdPrompt({ mfId: mfIdProp, onDismiss }: Props) {
  const storeId = useMfIdStore((s) => s.mfId);
  const displayedId = mfIdProp ?? storeId ?? "";
  const [draft, setDraft] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const restoreFieldId = useId();
  const statusId = useId();

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(displayedId);
      setStatus("copied");
    } catch {
      setStatus("copy-failed");
    }
  }

  async function handlePaste() {
    try {
      const text = await navigator.clipboard.readText();
      setDraft(text.trim());
      setStatus("pasted");
    } catch {
      setStatus("paste-failed");
    }
  }

  function handleRestore(event?: FormEvent) {
    event?.preventDefault();
    const result = restoreMfId(draft);
    if (result.ok) {
      setDraft("");
      setStatus("restored");
      return;
    }
    setStatus(result.error);
  }

  const message = STATUS_MESSAGE[status];
  const copyLabel = status === "copied" ? "Copied recovery key to clipboard" : "Copy recovery key";

  return (
    <section aria-labelledby="recovery-key-heading">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1 space-y-1">
          <h2
            id="recovery-key-heading"
            className="text-xs font-semibold uppercase tracking-[0.1em] text-[var(--color-text-muted)]"
          >
            Recovery key
          </h2>
          <p className="text-xs leading-relaxed text-[var(--color-text-muted)]">
            Keep this key private. It restores access to manage your saved schemas in another
            browser.
          </p>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <code className="min-w-0 break-all rounded bg-[var(--color-surface-raised)] px-2 py-1 font-mono text-xs text-[var(--color-text-primary)]">
              {displayedId || "Creating key…"}
            </code>
            <button
              type="button"
              onClick={() => {
                void handleCopy();
              }}
              disabled={!displayedId}
              aria-label={copyLabel}
              className="rounded-md px-2 py-1 text-xs font-medium text-[var(--color-accent)] hover:bg-[var(--color-accent)]/10 disabled:opacity-50"
            >
              {status === "copied" ? "Copied!" : "Copy"}
            </button>
          </div>
        </div>
        {onDismiss ? (
          <button
            type="button"
            onClick={onDismiss}
            className="rounded-md p-1 text-[var(--color-text-muted)] hover:bg-[var(--color-surface-hover)]"
            aria-label="Dismiss"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M18 6 6 18" />
              <path d="m6 6 12 12" />
            </svg>
          </button>
        ) : null}
      </div>

      <form className="mt-3 space-y-2" onSubmit={handleRestore}>
        <label
          htmlFor={restoreFieldId}
          className="block text-xs font-medium text-[var(--color-text-primary)]"
        >
          Restore from a recovery key
        </label>
        <div className="flex flex-wrap items-center gap-2">
          <input
            id={restoreFieldId}
            value={draft}
            onChange={(event) => {
              setDraft(event.target.value);
              if (status !== "idle") setStatus("idle");
            }}
            spellCheck={false}
            autoComplete="off"
            placeholder="Paste a UUID"
            aria-invalid={status === "invalid" || status === "empty"}
            aria-describedby={statusId}
            className="min-w-0 flex-1 rounded-md border border-[var(--color-border)] bg-[var(--color-surface-raised)] px-2 py-1 font-mono text-xs text-[var(--color-text-primary)]"
          />
          <button
            type="button"
            onClick={() => {
              void handlePaste();
            }}
            className="rounded-md px-2 py-1 text-xs font-medium text-[var(--color-accent)] hover:bg-[var(--color-accent)]/10"
          >
            Paste
          </button>
          <button
            type="submit"
            className="rounded-md px-2 py-1 text-xs font-medium text-[var(--color-accent)] hover:bg-[var(--color-accent)]/10"
          >
            Restore
          </button>
        </div>
      </form>

      <p
        id={statusId}
        className="sr-only"
        role={isErrorStatus(status) ? "alert" : "status"}
        aria-live={isErrorStatus(status) ? "assertive" : "polite"}
      >
        {message}
      </p>
      {message ? (
        <p
          className={`mt-2 text-xs ${
            isErrorStatus(status) ? "text-red-500" : "text-[var(--color-text-muted)]"
          }`}
          aria-hidden="true"
        >
          {message}
        </p>
      ) : null}
    </section>
  );
}
