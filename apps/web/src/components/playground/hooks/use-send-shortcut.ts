import { useEffect, type RefObject } from "react";

const SEND_SHORTCUT_KEY = "Enter";

function isSendShortcut(event: KeyboardEvent): boolean {
  return (event.metaKey || event.ctrlKey) && event.key === SEND_SHORTCUT_KEY;
}

/**
 * Binds Cmd/Ctrl+Enter to trigger `onSend`. All four protocol panels stay
 * mounted at once (toggled via the `hidden` attribute), so the listener is
 * attached to the panel's own root — via `containerRef` — rather than
 * `window`: a hidden ([hidden] => display:none) panel can never contain the
 * focused element, so its listener naturally never sees the keydown from a
 * sibling panel. Falls back to `window` when no ref is supplied.
 */
export function useSendShortcut(
  onSend: () => void,
  enabled = true,
  containerRef?: RefObject<HTMLElement | null>,
): void {
  useEffect(() => {
    if (!enabled) return;

    const target: EventTarget = containerRef?.current ?? window;
    const handleKeyDown = (event: Event) => {
      if (!isSendShortcut(event as KeyboardEvent)) return;
      event.preventDefault();
      onSend();
    };

    target.addEventListener("keydown", handleKeyDown);
    return () => target.removeEventListener("keydown", handleKeyDown);
  }, [onSend, enabled, containerRef]);
}
