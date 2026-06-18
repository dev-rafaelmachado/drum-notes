"use client";

import * as React from "react";
import type { Instrument } from "@drum-notes/notation-engine";

import { cn } from "@/lib/utils";

type InstrumentRowProps = {
  readonly instrument: Instrument;
  readonly label: string;
  readonly cells: readonly boolean[];
  readonly stepsPerBeat: number;
  readonly playheadStep?: number;
  readonly onToggle: (instrument: Instrument, position: number) => void;
};

function InstrumentRowComponent({
  instrument,
  label,
  cells,
  stepsPerBeat,
  playheadStep = -1,
  onToggle,
}: InstrumentRowProps): React.JSX.Element {
  return (
    <div className="flex items-center">
      <span className="w-20 shrink-0 pr-2 text-right text-xs font-medium text-neutral-600">
        {label}
      </span>
      <div className="flex">
        {cells.map((active, position) => {
          const isBeatStart = position % stepsPerBeat === 0;
          const isPlayhead = position === playheadStep;
          return (
            <button
              key={position}
              type="button"
              aria-label={`${label} step ${position + 1}`}
              aria-pressed={active}
              onClick={() => onToggle(instrument, position)}
              className={cn(
                "h-6 w-6 border border-neutral-200 transition-colors hover:bg-neutral-100",
                isBeatStart && "border-l-2 border-l-neutral-400",
                isPlayhead && "bg-blue-100",
                active && "bg-neutral-900 hover:bg-neutral-700",
                isPlayhead && active && "bg-blue-600 hover:bg-blue-500",
              )}
            >
              <span
                className={cn(
                  "mx-auto block h-2.5 w-2.5 rounded-full",
                  active ? "bg-neutral-50" : "bg-transparent",
                )}
              />
            </button>
          );
        })}
      </div>
    </div>
  );
}

export const InstrumentRow = React.memo(InstrumentRowComponent);
