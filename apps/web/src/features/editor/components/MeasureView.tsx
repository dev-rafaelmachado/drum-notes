"use client";

import * as React from "react";
import { Copy, Trash2 } from "lucide-react";
import type { Instrument, LayoutMeasure } from "@drum-notes/notation-engine";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { InstrumentRow } from "./InstrumentRow";

type MeasureViewProps = {
  readonly measure: LayoutMeasure;
  readonly index: number;
  readonly stepsPerBeat: number;
  readonly canRemove: boolean;
  readonly isActive?: boolean;
  readonly playheadStep?: number;
  readonly headerActions?: React.ReactNode;
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
  headerActions,
  onToggle,
  onDuplicate,
  onRemove,
}: MeasureViewProps): React.JSX.Element {
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
      aria-current={isActive ? "true" : undefined}
      className={cn(
        "rounded-lg border bg-white p-4 transition-colors",
        isActive ? "border-blue-500 ring-2 ring-blue-300" : "border-neutral-200",
      )}
    >
      <header className="mb-3 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-semibold text-neutral-700">Measure {index + 1}</h3>
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
