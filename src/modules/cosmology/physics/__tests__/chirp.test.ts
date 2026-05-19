import { describe, expect, it } from "vitest";
import {
  GW150914_FIDUCIAL,
  chirpFrequency,
  chirpWaveform,
  strainAmplitude,
} from "../chirp.js";

describe("chirpFrequency", () => {
  it("rises as t approaches t_c", () => {
    const fEarly = chirpFrequency(0.0, 0.42, 30);
    const fLate = chirpFrequency(0.4, 0.42, 30);
    expect(fLate).toBeGreaterThan(fEarly);
  });

  it("at ~0.05s before coalescence with M_c=30 sits in ~50-300 Hz LIGO band", () => {
    const f = chirpFrequency(0.42 - 0.05, 0.42, 30);
    expect(f).toBeGreaterThan(40);
    expect(f).toBeLessThan(500);
  });

  it("higher M_c → lower frequency at same dt", () => {
    expect(chirpFrequency(0.4, 0.42, 60)).toBeLessThan(chirpFrequency(0.4, 0.42, 30));
  });
});

describe("strainAmplitude", () => {
  it("grows as t approaches t_c", () => {
    expect(strainAmplitude(0.4, 0.42, 30)).toBeGreaterThan(
      strainAmplitude(0.2, 0.42, 30),
    );
  });

  it("at GW150914 fiducial reaches order 10⁻²¹ near peak", () => {
    const peak = strainAmplitude(0.418, 0.42, GW150914_FIDUCIAL.chirpMassSolar);
    expect(peak).toBeGreaterThan(1e-22);
    expect(peak).toBeLessThan(1e-20);
  });
});

describe("chirpWaveform", () => {
  it("returns a finite array of the requested length", () => {
    const ts = Array.from({ length: 200 }, (_, i) => i * 0.002);
    const h = chirpWaveform(ts, 0.42, 30);
    expect(h).toHaveLength(200);
    expect(h.every((v) => Number.isFinite(v))).toBe(true);
  });
});
