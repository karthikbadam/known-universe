import { describe, expect, it } from "vitest";
import {
  SOUND_HORIZON_FIDUCIAL_MPC,
  baoBump,
  baoCorrelation,
  baoCurve,
  baoSmooth,
} from "../bao.js";

describe("baoSmooth", () => {
  it("is positive and decreases with separation", () => {
    expect(baoSmooth(80)).toBeGreaterThan(baoSmooth(150));
    expect(baoSmooth(150)).toBeGreaterThan(0);
  });

  it("vanishes at s = 0", () => {
    expect(baoSmooth(0)).toBe(0);
  });
});

describe("baoBump", () => {
  it("peaks at r_d", () => {
    const at = baoBump(SOUND_HORIZON_FIDUCIAL_MPC);
    const offsetLow = baoBump(SOUND_HORIZON_FIDUCIAL_MPC - 20);
    const offsetHigh = baoBump(SOUND_HORIZON_FIDUCIAL_MPC + 20);
    expect(at).toBeGreaterThan(offsetLow);
    expect(at).toBeGreaterThan(offsetHigh);
  });

  it("shifts when r_d shifts", () => {
    const stdAt150 = baoBump(150, 150);
    const shiftedAt150 = baoBump(150, 130);
    expect(stdAt150).toBeGreaterThan(shiftedAt150);
  });
});

describe("baoCorrelation", () => {
  it("produces a local maximum near r_d after the smooth decline", () => {
    const at130 = baoCorrelation(130);
    const at147 = baoCorrelation(SOUND_HORIZON_FIDUCIAL_MPC);
    const at170 = baoCorrelation(170);
    expect(at147).toBeGreaterThan(at170);
    expect(at147 - baoSmooth(147)).toBeGreaterThan(at130 - baoSmooth(130));
  });
});

describe("baoCurve", () => {
  it("returns the requested samples and spans the range", () => {
    const curve = baoCurve(SOUND_HORIZON_FIDUCIAL_MPC, { samples: 100, sMinMpc: 50, sMaxMpc: 200 });
    expect(curve).toHaveLength(100);
    expect(curve[0]!.s).toBe(50);
    expect(curve[99]!.s).toBe(200);
  });

  it("rejects fewer than two samples", () => {
    expect(() => baoCurve(150, { samples: 1 })).toThrow();
  });
});
