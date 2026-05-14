import { describe, expect, it } from "vitest";
import {
  PLANCK_2018,
  approximatePlanckSigma,
  cmbModelCurve,
  cmbModelDl,
} from "../cmb.js";

describe("cmbModelDl at Planck 2018 fiducial", () => {
  it("first peak sits near ℓ ≈ 220 with height roughly 5000-6500 μK²", () => {
    const peakRegion: number[] = [];
    for (let l = 180; l <= 260; l += 5) peakRegion.push(l);
    const dl = cmbModelDl(peakRegion, PLANCK_2018);
    const maxIdx = dl.indexOf(Math.max(...dl));
    expect(peakRegion[maxIdx]!).toBeGreaterThanOrEqual(200);
    expect(peakRegion[maxIdx]!).toBeLessThanOrEqual(240);
    expect(dl[maxIdx]!).toBeGreaterThan(5000);
    expect(dl[maxIdx]!).toBeLessThan(6500);
  });

  it("Sachs-Wolfe plateau is in the 500-1700 μK² range at ℓ = 10", () => {
    const [v] = cmbModelDl([10], PLANCK_2018);
    expect(v!).toBeGreaterThan(500);
    expect(v!).toBeLessThan(1700);
  });

  it("damping tail: D_ℓ at ℓ=2400 is below 15% of first peak height", () => {
    const [firstPeak] = cmbModelDl([220], PLANCK_2018);
    const [tail] = cmbModelDl([2400], PLANCK_2018);
    expect(tail!).toBeLessThan(firstPeak! * 0.15);
  });
});

describe("parameter responses (sanity-check direction, not magnitude)", () => {
  it("increasing H0 shifts the first peak to lower ℓ", () => {
    const lowH = cmbModelDl(
      Array.from({ length: 50 }, (_, i) => 180 + i * 2),
      { ...PLANCK_2018, H0: 60 },
    );
    const highH = cmbModelDl(
      Array.from({ length: 50 }, (_, i) => 180 + i * 2),
      { ...PLANCK_2018, H0: 80 },
    );
    const ells = Array.from({ length: 50 }, (_, i) => 180 + i * 2);
    const peakLow = ells[lowH.indexOf(Math.max(...lowH))]!;
    const peakHigh = ells[highH.indexOf(Math.max(...highH))]!;
    expect(peakHigh).toBeLessThan(peakLow);
  });

  it("increasing Ω_b h² boosts the first peak (compression) relative to the second (rarefaction)", () => {
    const lowB = cmbModelDl([220, 540], { ...PLANCK_2018, omegaBh2: 0.018 });
    const highB = cmbModelDl([220, 540], { ...PLANCK_2018, omegaBh2: 0.028 });
    const ratioLow = lowB[0]! / lowB[1]!;
    const ratioHigh = highB[0]! / highB[1]!;
    expect(ratioHigh).toBeGreaterThan(ratioLow);
  });

  it("increasing n_s tilts power toward higher ℓ", () => {
    const redder = cmbModelDl([1500], { ...PLANCK_2018, nS: 0.90 });
    const bluer = cmbModelDl([1500], { ...PLANCK_2018, nS: 1.05 });
    expect(bluer[0]!).toBeGreaterThan(redder[0]!);
  });
});

describe("cmbModelCurve", () => {
  it("returns the requested number of samples spanning the requested ℓ range", () => {
    const curve = cmbModelCurve(PLANCK_2018, {
      ellMin: 2,
      ellMax: 2500,
      samples: 300,
    });
    expect(curve).toHaveLength(300);
    expect(curve[0]!.ell).toBeCloseTo(2, 5);
    expect(curve[299]!.ell).toBeCloseTo(2500, 0);
    // All D_ℓ values should be positive (the model clips negatives).
    expect(curve.every((p) => p.Dl >= 0)).toBe(true);
  });

  it("rejects fewer than two samples", () => {
    expect(() => cmbModelCurve(PLANCK_2018, { samples: 1 })).toThrow();
  });
});

describe("approximatePlanckSigma", () => {
  it("returns a positive uncertainty that grows in the damping tail", () => {
    const sigmaPeak = approximatePlanckSigma(220, 5800);
    const sigmaTail = approximatePlanckSigma(2000, 400);
    expect(sigmaPeak).toBeGreaterThan(0);
    expect(sigmaTail).toBeGreaterThan(sigmaPeak);
  });

  it("is cosmic-variance-dominated at low ℓ (sigma is a non-trivial fraction of Dℓ)", () => {
    const sigma = approximatePlanckSigma(30, 1000);
    expect(sigma).toBeGreaterThan(30);
    expect(sigma).toBeLessThan(300);
  });
});
