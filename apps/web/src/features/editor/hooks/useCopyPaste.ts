import { useEffect } from "react";

import { useEditorStore } from "../stores/editor-store";

function isEditableTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;
  const tag = target.tagName;
  return tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT" || target.isContentEditable;
}

/**
 * Mounts Ctrl/Cmd+C (copy) and Ctrl/Cmd+V (paste) keyboard shortcuts for
 * the editor. Suppressed when an editable element has focus so native browser
 * copy/paste inside text inputs is not hijacked.
 */
export function useCopyPaste(): void {
  const copySelectedMeasures = useEditorStore((state) => state.copySelectedMeasures);
  const pasteMeasures = useEditorStore((state) => state.pasteMeasures);

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent): void {
      const isMeta = event.metaKey || event.ctrlKey;
      if (!isMeta) return;
      if (isEditableTarget(document.activeElement)) return;

      if (event.key === "c" || event.key === "C") {
        const { selectedMeasureIds } = useEditorStore.getState();
        if (selectedMeasureIds.size === 0) return;
        event.preventDefault();
        copySelectedMeasures();
      } else if (event.key === "v" || event.key === "V") {
        const { canPaste } = useEditorStore.getState();
        if (!canPaste) return;
        event.preventDefault();
        pasteMeasures();
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [copySelectedMeasures, pasteMeasures]);
}
