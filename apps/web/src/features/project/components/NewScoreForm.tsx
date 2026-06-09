"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  COMMON_TIME_SIGNATURES,
  createScore,
  formatTimeSignature,
  SUBDIVISION_LABELS,
  SUBDIVISIONS,
  type Score,
} from "@drum-notes/notation-engine";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { saveScore } from "../services/score-repository";

const schema = z.object({
  title: z.string().trim().min(1, "Title is required").max(80),
  bpm: z.number().int("Whole numbers only").min(20, "Min 20").max(400, "Max 400"),
  timeSignature: z.string().regex(/^\d+\/\d+$/),
  subdivision: z.enum(["quarter", "eighth", "sixteenth", "thirtySecond"]),
});

type FormValues = z.infer<typeof schema>;

function parseTimeSignature(value: string): { numerator: number; denominator: number } {
  const [numerator, denominator] = value.split("/").map(Number);
  return { numerator: numerator ?? 4, denominator: denominator ?? 4 };
}

export function NewScoreForm({
  onCreated,
}: {
  readonly onCreated: (score: Score) => void;
}): React.JSX.Element {
  const [submitting, setSubmitting] = React.useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      title: "Untitled",
      bpm: 120,
      timeSignature: "4/4",
      subdivision: "sixteenth",
    },
  });

  const onSubmit = handleSubmit(async (values) => {
    setSubmitting(true);
    try {
      const score = createScore({
        title: values.title,
        bpm: values.bpm,
        timeSignature: parseTimeSignature(values.timeSignature),
        subdivision: values.subdivision,
      });
      await saveScore(score);
      onCreated(score);
    } finally {
      setSubmitting(false);
    }
  });

  return (
    <form
      onSubmit={onSubmit}
      className="grid gap-4 rounded-lg border border-neutral-200 bg-white p-5 sm:grid-cols-2"
    >
      <div className="space-y-1 sm:col-span-2">
        <Label htmlFor="title">Title</Label>
        <Input id="title" {...register("title")} />
        {errors.title && <p className="text-xs text-red-600">{errors.title.message}</p>}
      </div>

      <div className="space-y-1">
        <Label htmlFor="new-bpm">BPM</Label>
        <Input
          id="new-bpm"
          type="number"
          min={20}
          max={400}
          {...register("bpm", { valueAsNumber: true })}
        />
        {errors.bpm && <p className="text-xs text-red-600">{errors.bpm.message}</p>}
      </div>

      <div className="space-y-1">
        <Label htmlFor="timeSignature">Time signature</Label>
        <Select id="timeSignature" {...register("timeSignature")}>
          {COMMON_TIME_SIGNATURES.map((ts) => {
            const value = formatTimeSignature(ts);
            return (
              <option key={value} value={value}>
                {value}
              </option>
            );
          })}
        </Select>
      </div>

      <div className="space-y-1">
        <Label htmlFor="subdivision">Subdivision</Label>
        <Select id="subdivision" {...register("subdivision")}>
          {SUBDIVISIONS.map((subdivision) => (
            <option key={subdivision} value={subdivision}>
              {SUBDIVISION_LABELS[subdivision]}
            </option>
          ))}
        </Select>
      </div>

      <div className="sm:col-span-2">
        <Button type="submit" disabled={submitting}>
          {submitting ? "Creating…" : "Create score"}
        </Button>
      </div>
    </form>
  );
}
