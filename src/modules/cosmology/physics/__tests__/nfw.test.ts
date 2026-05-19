import { describe, expect, it } from "vitest";
import {
  baryonEnclosedMass,
  circularVelocityKmS,
  nfwEnclosedMass,
  rotationVelocity,
} from "../nfw.js";

describe("baryonEnclosedMass", () => {
  it("grows from zero to total at large radius", () => {
    expect(baryonEnclosedMass(0, 1e10, 3)).toBeCloseTo(0, 5);
    expect(baryonEnclosedMass(100, 1e10, 3)).toBeCloseTo(1e10, -1);
  });
});

describe("nfwEnclosedMass", () => {
  it("increases monotonically with r", () => {
    const p = { rsKpc: 10, rhoSMsunPerKpc3: 1e7 };
    expect(nfwEnclosedMass(5, p)).toBeLessThan(nfwEnclosedMass(20, p));
  });

  it("approaches a divergent log shape at large r", () => {
    const p = { rsKpc: 10, rhoSMsunPerKpc3: 1e7 };
    expect(nfwEnclosedMass(50, p)).toBeGreaterThan(nfwEnclosedMass(10, p) * 2);
  });
});

describe("circularVelocityKmS", () => {
  it("100 km/s at 1 kpc requires ~2.3e9 M_sun (~ Milky Way disk inner)", () => {
    const v = circularVelocityKmS(1, 2.3e9);
    expect(v).toBeGreaterThan(80);
    expect(v).toBeLessThan(120);
  });
});

describe("rotationVelocity", () => {
  it("vTot is the quadrature sum of vBary and vDm", () => {
    const { vBary, vDm, vTot } = rotationVelocity(
      8,
      4e10,
      3,
      { rsKpc: 12, rhoSMsunPerKpc3: 7e6 },
    );
    expect(vTot).toBeCloseTo(Math.sqrt(vBary * vBary + vDm * vDm), 6);
  });

  it("flat-ish outer rotation: vTot at r=20 vs r=10 within 30%", () => {
    const at10 = rotationVelocity(10, 4e10, 3, { rsKpc: 12, rhoSMsunPerKpc3: 7e6 }).vTot;
    const at20 = rotationVelocity(20, 4e10, 3, { rsKpc: 12, rhoSMsunPerKpc3: 7e6 }).vTot;
    expect(Math.abs(at20 - at10) / at10).toBeLessThan(0.4);
  });
});
