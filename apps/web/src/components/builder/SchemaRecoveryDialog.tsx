"use client";

import { useEffect, useRef } from "react";
import { MfIdPrompt } from "./MfIdPrompt";

interface SchemaRecoveryDialogProps {
  open: boolean;
  onClose: () => void;
}

export function SchemaRecoveryDialog({ open, onClose }: SchemaRecoveryDialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  return (
    <dialog
      ref={dialogRef}
      onCancel={onClose}
      onClose={onClose}
      aria-labelledby="recovery-key-heading"
      className="m-auto max-h-[calc(100dvh-2rem)] w-[min(30rem,calc(100vw-2rem))] overflow-y-auto rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-0 text-[var(--color-text-primary)] shadow-2xl backdrop:bg-[var(--color-surface)]/80"
    >
      <div className="p-6">
        <MfIdPrompt onDismiss={onClose} />
      </div>
    </dialog>
  );
}
