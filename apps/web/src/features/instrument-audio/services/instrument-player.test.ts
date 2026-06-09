import { describe, expect, it } from "vitest";

import { instrumentPlayer } from "./instrument-player";

describe("instrument player", () => {
  it("play is fire-and-forget and never throws", () => {
    // jsdom has no Web Audio; play must swallow the failure so editing is never
    // interrupted. It returns void synchronously.
    expect(() => instrumentPlayer.play("kick")).not.toThrow();
    expect(() => instrumentPlayer.play("snare")).not.toThrow();
    expect(instrumentPlayer.play("hiHat")).toBeUndefined();
  });
});
