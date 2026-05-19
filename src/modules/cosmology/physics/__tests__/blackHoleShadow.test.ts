import { describe, expect, it } from "vitest";
import {
  M87_OBSERVED,
  inclinationFactor,
  schwarzschildRadiusM,
  shadowDiameterUas,
} from "../blackHoleShadow.js";

describe("schwarzschildRadiusM", () => {
  it("solar mass BH has R_s ≈ 2.95 km", () => {
    const rs = schwarzschildRadiusM(1);
    expect(rs).toBeGreaterThan(2900);
    expect(rs).toBeLessThan(3000);
  });

  it("scales linearly with mass", () => {
    const r1 = schwarzschildRadiusM(1);
    const r10 = schwarzschildRadiusM(10);
    expect(r10 / r1).toBeCloseTo(10, 6);
  });
});

describe("shadowDiameterUas", () => {
  it("reproduces the M87* shadow at fiducial mass + distance", () => {
    const d = shadowDiameterUas(M87_OBSERVED.massSolar, M87_OBSERVED.distanceMpc);
    expect(d).toBeGreaterThan(M87_OBSERVED.shadowDiameterUas - M87_OBSERVED.shadowSigmaUas * 2);
    expect(d).toBeLessThan(M87_OBSERVED.shadowDiameterUas + M87_OBSERVED.shadowSigmaUas * 2);
  });

  it("scales linearly with mass and inversely with distance", () => {
    const baseline = shadowDiameterUas(6.5e9, 16.8);
    expect(shadowDiameterUas(13e9, 16.8) / baseline).toBeCloseTo(2, 6);
    expect(shadowDiameterUas(6.5e9, 8.4) / baseline).toBeCloseTo(2, 6);
  });
});

describe("inclinationFactor", () => {
  it("is 1 at face-on viewing", () => {
    expect(inclinationFactor(0)).toBeCloseTo(1, 6);
  });

  it("is slightly less than 1 at edge-on", () => {
    const f = inclinationFactor(90);
    expect(f).toBeGreaterThan(0.9);
    expect(f).toBeLessThan(1);
  });
});
