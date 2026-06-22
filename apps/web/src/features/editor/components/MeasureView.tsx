"use client";

import * as React from "react";
import { Copy, Trash2 } from "lucide-react";
import type { Instrument, LayoutMeasure } from "@drum-notes/notation-engine";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { InstrumentRow } from "./InstrumentRow";

/** A measure's place in the loop region (PRACT-001). */
export type LoopRole = "none" | "single" | "start" | "end" | "inside";

/** Where the reorder drop indicator sits relative to this measure (EDIT-004). */
export type DropEdge = "none" | "top" | "bottom";

type MeasureViewProps = {
  readonly measure: LayoutMeasure;
  readonly index: number;
  readonly stepsPerBeat: number;
  readonly canRemove: boolean;
  readonly isActive?: boolean;
  readonly playheadStep?: number;
  readonly loopRole?: LoopRole;
  readonly headerActions?: React.ReactNode;
  /** Drag affordance shown at the start of the header (EDIT-004). */
  readonly dragHandle?: React.ReactNode;
  /** Drag-and-drop handlers making this measure a drop target (EDIT-004). */
  readonly dropTargetProps?: Pick<
    React.HTMLAttributes<HTMLElement>,
    "onDragOver" | "onDrop"
  >;
  readonly dropEdge?: DropEdge;
  readonly isDragging?: boolean;
  readonly onToggle: (measureId: string, instrument: Instrument, position: number) => void;
  readonly onDuplicate: (measureId: string) => void;
  readonly onRemove: (measureId: string) => void;
};

function MeasureViewComponent({
  measure,
  index,
  stepsPerBeat,
  canRemove,
  isActive = false,
  playheadStep = -1,
  loopRole = "none",
  headerActions,
  dragHandle,
  dropTargetProps,
  dropEdge = "none",
  isDragging = false,
  onToggle,
  onDuplicate,
  onRemove,
}: MeasureViewProps): React.JSX.Element {
  const inLoop = loopRole !== "none";
  const ref = React.useRef<HTMLElement>(null);

  const handleToggle = React.useCallback(
    (instrument: Instrument, position: number) => onToggle(measure.id, instrument, position),
    [measure.id, onToggle],
  );

  React.useEffect(() => {
    if (isActive) {
      ref.current?.scrollIntoView({ block: "nearest", behavior: "smooth" });
    }
  }, [isActive]);

  return (
    <section
      ref={ref}
      {...dropTargetProps}
      aria-current={isActive ? "true" : undefined}
      className={cn(
        "relative rounded-lg border bg-white p-4 transition-colors",
        isActive ? "border-blue-500 ring-2 ring-blue-300" : "border-neutral-200",
        // Loop region (PRACT-001): a violet left rail spans the looped measures,
        // distinct from the blue "playing" highlight and visible alongside it.
        inLoop && "border-l-4 border-l-violet-500",
        // The dragged source fades while it is being moved (EDIT-004).
        isDragging && "opacity-50",
      )}
    >
      {/* Reorder drop indicator (EDIT-004): a bar in the gap where the measure
          will land. Position — not colour — conveys the target. */}
      {dropEdge !== "none" ? (
        <div
          aria-hidden
          className={cn(
            "pointer-events-none absolute inset-x-3 h-1 rounded-full bg-violet-500",
            dropEdge === "top" ? "-top-2.5" : "-bottom-2.5",
          )}
        />
      ) : null}

      <header className="mb-3 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          {dragHandle}
          <h3 className="text-sm font-semibold text-neutral-700">Measure {index + 1}</h3>
          {loopRole === "start" || loopRole === "single" ? (
            <span className="rounded bg-violet-100 px-1.5 py-0.5 text-xs font-medium text-violet-700">
              Loop
            </span>
          ) : null}
          {isActive ? (
            <span className="rounded bg-blue-100 px-1.5 py-0.5 text-xs font-medium text-blue-700">
              Playing
            </span>
          ) : null}
        </div>
        <div className="flex items-center gap-1">
          {headerActions}
          <Button
            variant="ghost"
            size="icon"
            aria-label={`Duplicate measure ${index + 1}`}
            onClick={() => onDuplicate(measure.id)}
          >
            <Copy className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            aria-label={`Remove measure ${index + 1}`}
            disabled={!canRemove}
            onClick={() => onRemove(measure.id)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </header>

      <div className="space-y-1 overflow-x-auto">
        {measure.rows.map((row) => (
          <InstrumentRow
            key={row.instrument}
            instrument={row.instrument}
            label={row.label}
            cells={row.cells}
            stepsPerBeat={stepsPerBeat}
            playheadStep={playheadStep}
            onToggle={handleToggle}
          />
        ))}
      </div>
    </section>
  );
}

export const MeasureView = React.memo(MeasureViewComponent);
