import { describe, expect, it } from "vitest";

import { pixelToSeconds, secondsToPixel } from "./waveform-service";

describe("secondsToPixel", () => {
  it("maps the start to 0", () => {
    expect(secondsToPixel(0, 60, 600)).toBe(0);
  });

  it("maps the end to the full width", () => {
    expect(secondsToPixel(60, 60, 600)).toBe(600);
  });

  it("maps the midpoint correctly", () => {
    expect(secondsToPixel(30, 60, 600)).toBe(300);
  });

  it("returns 0 when duration is 0 (no division by zero)", () => {
    expect(secondsToPixel(10, 0, 600)).toBe(0);
  });

  it("returns 0 when width is 0", () => {
    expect(secondsToPixel(10, 60, 0)).toBe(0);
  });

  it("clamps above the end to width", () => {
    expect(secondsToPixel(70, 60, 600)).toBe(600);
  });

  it("clamps below the start to 0", () => {
    expect(secondsToPixel(-5, 60, 600)).toBe(0);
  });
});

describe("pixelToSeconds", () => {
  it("maps pixel 0 to 0 seconds", () => {
    expect(pixelToSeconds(0, 600, 60)).toBe(0);
  });

  it("maps the end pixel to the duration", () => {
    expect(pixelToSeconds(600, 600, 60)).toBe(60);
  });

  it("maps the midpoint pixel correctly", () => {
    expect(pixelToSeconds(300, 600, 60)).toBe(30);
  });

  it("returns 0 when width is 0 (no division by zero)", () => {
    expect(pixelToSeconds(300, 0, 60)).toBe(0);
  });

  it("returns 0 when duration is 0", () => {
    expect(pixelToSeconds(300, 600, 0)).toBe(0);
  });

  it("round-trips with secondsToPixel", () => {
    const t = 42.5;
    const width = 800;
    const duration = 180;
    expect(pixelToSeconds(secondsToPixel(t, duration, width), width, duration)).toBeCloseTo(t);
  });
});
