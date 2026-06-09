"use client";

import * as React from "react";
import { Copy, Trash2 } from "lucide-react";
import type { Instrument, LayoutMeasure } from "@drum-notes/notation-engine";

import { Button } from "@/components/ui/button";
import { InstrumentRow } from "./InstrumentRow";

type MeasureViewProps = {
  readonly measure: LayoutMeasure;
  readonly index: number;
  readonly stepsPerBeat: number;
  readonly canRemove: boolean;
  readonly onToggle: (measureId: string, instrument: Instrument, position: number) => void;
  readonly onDuplicate: (measureId: string) => void;
  readonly onRemove: (measureId: string) => void;
};

function MeasureViewComponent({
  measure,
  index,
  stepsPerBeat,
  canRemove,
  onToggle,
  onDuplicate,
  onRemove,
}: MeasureViewProps): React.JSX.Element {
  const handleToggle = React.useCallback(
    (instrument: Instrument, position: number) => onToggle(measure.id, instrument, position),
    [measure.id, onToggle],
  );

  return (
    <section className="rounded-lg border border-neutral-200 bg-white p-4">
      <header className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-neutral-700">Measure {index + 1}</h3>
        <div className="flex items-center gap-1">
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
            onToggle={handleToggle}
          />
        ))}
      </div>
    </section>
  );
}

export const MeasureView = React.memo(MeasureViewComponent);
