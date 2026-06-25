import { useEffect } from "react";

import { useEditorStore } from "../stores/editor-store";

function isEditableTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;
  const tag = target.tagName;
  return tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT" || target.isContentEditable;
}

/**
 * Mounts Ctrl/Cmd+Z (undo) and Ctrl/Cmd+Shift+Z (redo) keyboard shortcuts for
 * the editor. Suppressed when an editable element has focus so native browser
 * undo inside text inputs is not hijacked.
 */
export function useUndoRedo(): void {
  const undo = useEditorStore((state) => state.undo);
  const redo = useEditorStore((state) => state.redo);

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent): void {
      const isMeta = event.metaKey || event.ctrlKey;
      if (!isMeta) return;
      if (event.key !== "z" && event.key !== "Z") return;
      if (isEditableTarget(document.activeElement)) return;

      event.preventDefault();

      if (event.shiftKey) {
        redo();
      } else {
        undo();
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [undo, redo]);
}
