/**
 * Waveform data generation from an audio blob (see docs/adr/013-waveform.md).
 * All Web Audio API usage is confined to this file — the domain and stores stay
 * framework-agnostic.
 *
 * A waveform is a downsampled peak array: each bucket holds the [min, max]
 * amplitude of its slice. The array is interleaved (min0, max0, min1, max1,…)
 * so a single Float32Array carries all data for both the positive and negative
 * halves of the waveform bars.
 *
 * Coordinate helpers (secondsToPixel / pixelToSeconds) are pure functions
 * exported here so the canvas renderer and interaction hook share the same math
 * without any browser dependency.
 */

export const WAVEFORM_BUCKETS = 2000;

/**
 * Decode an audio blob and downsample it to `buckets` [min, max] peak pairs.
 * Returns an interleaved Float32Array of length `buckets * 2`.
 */
export async function generateWaveform(
  blob: Blob,
  buckets = WAVEFORM_BUCKETS,
): Promise<Float32Array> {
  const arrayBuffer = await blob.arrayBuffer();
  // AudioContext is used only for decode; it produces no audio output here.
  const ctx = new AudioContext();
  let audioBuffer: AudioBuffer;
  try {
    audioBuffer = await ctx.decodeAudioData(arrayBuffer);
  } finally {
    void ctx.close();
  }

  const channel = audioBuffer.getChannelData(0);
  const samplesPerBucket = Math.max(1, Math.floor(channel.length / buckets));
  const result = new Float32Array(buckets * 2);

  for (let i = 0; i < buckets; i++) {
    const start = i * samplesPerBucket;
    const end = Math.min(start + samplesPerBucket, channel.length);
    let min = 0;
    let max = 0;
    for (let j = start; j < end; j++) {
      const s = channel[j]!;
      if (s < min) min = s;
      if (s > max) max = s;
    }
    result[i * 2] = min;
    result[i * 2 + 1] = max;
  }

  return result;
}

/** Maps a time position to a canvas x-coordinate. Clamps to `[0, width]`. */
export function secondsToPixel(seconds: number, duration: number, width: number): number {
  if (duration <= 0 || width <= 0) return 0;
  return Math.max(0, Math.min(width, (seconds / duration) * width));
}

/** Maps a canvas x-coordinate back to a time position. Clamps to `[0, duration]`. */
export function pixelToSeconds(pixel: number, width: number, duration: number): number {
  if (width <= 0 || duration <= 0) return 0;
  return Math.max(0, Math.min(duration, (pixel / width) * duration));
}
