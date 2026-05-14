import { describe, expect, it } from "vitest";
import {
  comovingDistanceMpc,
  distanceModulus,
  luminosityDistanceMpc,
  muCurve,
} from "../luminosity.js";

const fiducial = { H0: 70, omegaM: 0.3, omegaLambda: 0.7 };

describe("comovingDistanceMpc", () => {
  it("is zero at z=0", () => {
    expect(comovingDistanceMpc(0, fiducial)).toBe(0);
  });

  it("at low z behaves like c·z/H₀", () => {
    const z = 0.01;
    const dc = comovingDistanceMpc(z, fiducial);
    const expected = (299792.458 * z) / fiducial.H0;
    expect(dc / expected).toBeGreaterThan(0.99);
    expect(dc / expected).toBeLessThan(1.01);
  });

  it("at z=1 in fiducial ΛCDM is roughly 3.3 Gpc", () => {
    const dc = comovingDistanceMpc(1, fiducial);
    expect(dc).toBeGreaterThan(3000);
    expect(dc).toBeLessThan(3600);
  });
});

describe("luminosityDistanceMpc", () => {
  it("d_L(z=0.1) ≈ 470 Mpc in fiducial ΛCDM (Planck-like H0=70)", () => {
    const dL = luminosityDistanceMpc(0.1, fiducial);
    expect(dL).toBeGreaterThan(440);
    expect(dL).toBeLessThan(500);
  });

  it("doubles approximately when H0 halves at fixed Ω_m", () => {
    const dL70 = luminosityDistanceMpc(0.5, fiducial);
    const dL35 = luminosityDistanceMpc(0.5, { ...fiducial, H0: 35 });
    expect(dL35 / dL70).toBeCloseTo(2, 1);
  });
});

describe("distanceModulus", () => {
  it("μ(z=0.1) ≈ 38.4 in fiducial ΛCDM", () => {
    const mu = distanceModulus(0.1, fiducial);
    expect(mu).toBeGreaterThan(38.0);
    expect(mu).toBeLessThan(38.7);
  });

  it("μ(z=1) ≈ 44 in fiducial ΛCDM", () => {
    const mu = distanceModulus(1, fiducial);
    expect(mu).toBeGreaterThan(43.5);
    expect(mu).toBeLessThan(45);
  });
});

describe("muCurve", () => {
  it("returns the requested samples in the requested z range", () => {
    const curve = muCurve(fiducial, { zMin: 0.01, zMax: 2, samples: 50 });
    expect(curve).toHaveLength(50);
    expect(curve[0]!.z).toBeCloseTo(0.01, 4);
    expect(curve[49]!.z).toBeCloseTo(2, 4);
  });
});
