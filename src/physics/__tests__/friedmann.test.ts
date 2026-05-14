import { describe, expect, it } from "vitest";
import {
  hubbleModelCurve,
  hubbleTimeGyr,
  hubbleVelocity,
} from "../friedmann.js";
import { gaussian, mulberry32 } from "../rng.js";

describe("hubbleVelocity", () => {
  it("is linear in distance and proportional to H0", () => {
    expect(hubbleVelocity(0, 70)).toBe(0);
    expect(hubbleVelocity(1, 70)).toBeCloseTo(70);
    expect(hubbleVelocity(2, 70)).toBeCloseTo(140);
  });

  it("doubles when H0 doubles at fixed distance", () => {
    const v1 = hubbleVelocity(1.5, 70);
    const v2 = hubbleVelocity(1.5, 140);
    expect(v2 / v1).toBeCloseTo(2, 6);
  });
});

describe("hubbleModelCurve", () => {
  it("returns the requested number of samples starting at 0 and ending at max", () => {
    const curve = hubbleModelCurve(70, 2.5, 26);
    expect(curve).toHaveLength(26);
    expect(curve[0]!.d).toBe(0);
    expect(curve[25]!.d).toBeCloseTo(2.5);
    expect(curve[25]!.v).toBeCloseTo(70 * 2.5);
  });

  it("rejects fewer than two samples", () => {
    expect(() => hubbleModelCurve(70, 2.5, 1)).toThrow();
  });
});

describe("hubbleTimeGyr", () => {
  // Modern H0 ≈ 70 km/s/Mpc => Hubble time ≈ 14 Gyr
  it("gives ~14 Gyr for H0 = 70 km/s/Mpc", () => {
    expect(hubbleTimeGyr(70)).toBeGreaterThan(13);
    expect(hubbleTimeGyr(70)).toBeLessThan(15);
  });

  // Hubble's 1929 fit H0 ≈ 500 km/s/Mpc => Hubble time ≈ 2 Gyr
  // (this is the famous problem: younger than the Earth)
  it("gives ~2 Gyr for the 1929 fit of H0 = 500 km/s/Mpc", () => {
    expect(hubbleTimeGyr(500)).toBeGreaterThan(1.5);
    expect(hubbleTimeGyr(500)).toBeLessThan(2.5);
  });
});

describe("seeded RNG", () => {
  it("mulberry32 is deterministic given the same seed", () => {
    const a = mulberry32(42);
    const b = mulberry32(42);
    for (let i = 0; i < 10; i++) {
      expect(a()).toBe(b());
    }
  });

  it("gaussian sample mean approaches the requested mean", () => {
    const rng = mulberry32(1);
    let sum = 0;
    const n = 5000;
    for (let i = 0; i < n; i++) sum += gaussian(rng, 100, 5);
    const mean = sum / n;
    expect(mean).toBeGreaterThan(99);
    expect(mean).toBeLessThan(101);
  });
});
