import { describe, expect, it } from "vitest";
import {
  BBN_OBSERVED,
  bbnDoverH,
  bbnGrid,
  bbnLi7overH,
  bbnYp,
} from "../bbn.js";

describe("BBN abundance predictions at fiducial Ω_b h²", () => {
  it("D/H at fiducial sits within 20% of observed (2.5e-5)", () => {
    const dH = bbnDoverH(0.022);
    expect(dH).toBeGreaterThan(0.8 * BBN_OBSERVED.dH.value);
    expect(dH).toBeLessThan(1.2 * BBN_OBSERVED.dH.value);
  });

  it("Y_p at fiducial is roughly 0.245", () => {
    const yp = bbnYp(0.022);
    expect(yp).toBeGreaterThan(0.24);
    expect(yp).toBeLessThan(0.25);
  });

  it("predicted ⁷Li/H is 2-4× observed (the lithium problem)", () => {
    const li = bbnLi7overH(0.022);
    expect(li / BBN_OBSERVED.li7H.value).toBeGreaterThan(2);
    expect(li / BBN_OBSERVED.li7H.value).toBeLessThan(4);
  });
});

describe("BBN parameter responses", () => {
  it("D/H decreases with increasing baryon density", () => {
    expect(bbnDoverH(0.025)).toBeLessThan(bbnDoverH(0.020));
  });

  it("Y_p increases with both Ω_b h² and N_eff", () => {
    expect(bbnYp(0.025)).toBeGreaterThan(bbnYp(0.020));
    expect(bbnYp(0.022, 3.5)).toBeGreaterThan(bbnYp(0.022, 3.046));
  });

  it("⁷Li/H rises steeply with baryon density", () => {
    expect(bbnLi7overH(0.025) / bbnLi7overH(0.020)).toBeGreaterThan(1.3);
  });
});

describe("bbnGrid", () => {
  it("returns the requested number of samples covering the range", () => {
    const grid = bbnGrid(3.046, { omegaBh2Min: 0.01, omegaBh2Max: 0.04, samples: 50 });
    expect(grid).toHaveLength(50);
    expect(grid[0]!.omegaBh2).toBeCloseTo(0.01, 5);
    expect(grid[49]!.omegaBh2).toBeCloseTo(0.04, 5);
    expect(grid.every((row) => row.dH > 0 && row.yp > 0 && row.li7H > 0)).toBe(true);
  });
});
