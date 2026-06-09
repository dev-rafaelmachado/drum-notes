"use client";

import * as React from "react";
import { Upload } from "lucide-react";

import { Button } from "@/components/ui/button";

type AudioUploaderProps = {
  readonly onSelect: (file: File) => void;
  readonly label?: string;
};

export function AudioUploader({
  onSelect,
  label = "Upload audio",
}: AudioUploaderProps): React.JSX.Element {
  const inputRef = React.useRef<HTMLInputElement>(null);

  function handleChange(event: React.ChangeEvent<HTMLInputElement>): void {
    const file = event.target.files?.[0];
    if (file) {
      onSelect(file);
    }
    // Reset so selecting the same file again still fires a change event.
    event.target.value = "";
  }

  return (
    <>
      <input
        ref={inputRef}
        type="file"
        accept="audio/mpeg,audio/wav,audio/x-wav,.mp3,.wav"
        className="sr-only"
        aria-label="Audio file"
        onChange={handleChange}
      />
      <Button variant="outline" size="sm" onClick={() => inputRef.current?.click()}>
        <Upload className="h-4 w-4" />
        {label}
      </Button>
    </>
  );
}
