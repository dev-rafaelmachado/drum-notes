"use client";

import * as React from "react";
import { ChevronLeft, ChevronRight, GripVertical } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { MeasureReorder } from "../hooks/useMeasureReorder";

/**
 * Drag affordance for reordering a measure (EDIT-004). Drag-only, so it is hidden
 * from assistive tech — keyboard users reorder with the move buttons instead.
 */
export function MeasureDragHandle({
  index,
  handleProps,
}: {
  readonly index: number;
  readonly handleProps: MeasureReorder["handleProps"];
}): React.JSX.Element {
  return (
    <span
      {...handleProps}
      aria-hidden
      title={`Drag to reorder measure ${index + 1}`}
      className={cn(
        "flex cursor-grab items-center text-neutral-400 active:cursor-grabbing",
        "hover:text-neutral-600",
      )}
    >
      <GripVertical className="h-4 w-4" />
    </span>
  );
}

/**
 * Keyboard-operable alternative to dragging: move a measure earlier ("left") or
 * later ("right") in the score. Edge buttons are disabled at the ends.
 */
export function MeasureMoveButtons({
  index,
  moveLeft,
  moveRight,
  canMoveLeft,
  canMoveRight,
}: {
  readonly index: number;
  readonly moveLeft: () => void;
  readonly moveRight: () => void;
  readonly canMoveLeft: boolean;
  readonly canMoveRight: boolean;
}): React.JSX.Element {
  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        aria-label={`Move measure ${index + 1} left`}
        title="Move earlier"
        disabled={!canMoveLeft}
        onClick={moveLeft}
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        aria-label={`Move measure ${index + 1} right`}
        title="Move later"
        disabled={!canMoveRight}
        onClick={moveRight}
      >
        <ChevronRight className="h-4 w-4" />
      </Button>
    </>
  );
}
