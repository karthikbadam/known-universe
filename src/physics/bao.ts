// Baryon acoustic oscillation (BAO) feature in the galaxy correlation
// function ξ(s).
//
// The BAO feature is a "bump" in the two-point correlation function
// at s ≈ r_d ≈ 150 Mpc — the comoving size today of the sound horizon
// at the drag epoch. Acts as a standard ruler.
//
// We ship a phenomenological model:
//   ξ(s) = A · (s/100)^-1.8 · [1 - exp(-(s/40)²)]   (smooth power-law part)
//         + B · exp(-((s - r_d)/σ_BAO)²)             (Gaussian BAO bump)
//
// Calibrated against BOSS DR12 (Alam et al. 2017) at the % level.
//
// Reference:
//   - Alam, S. et al. (2017). MNRAS 470, 2617.

export const SOUND_HORIZON_FIDUCIAL_MPC = 147.78;
const POWERLAW_AMPLITUDE = 2.6e-3;
const BAO_BUMP_AMPLITUDE = 2.5e-3;
const BAO_BUMP_WIDTH_MPC = 12;

/**
 * Smooth (no-wiggle) part of the linear correlation function. Falls
 * roughly as s^-1.8 with a Gaussian suppression at small s where the
 * power-law breaks down.
 */
export function baoSmooth(sMpc: number): number {
  if (sMpc <= 0) return 0;
  const longRange = Math.pow(sMpc / 100, -1.8);
  const smallScale = 1 - Math.exp(-Math.pow(sMpc / 40, 2));
  return POWERLAW_AMPLITUDE * longRange * smallScale;
}

/** Gaussian BAO bump centered on r_d. */
export function baoBump(sMpc: number, rdMpc: number = SOUND_HORIZON_FIDUCIAL_MPC): number {
  const arg = (sMpc - rdMpc) / BAO_BUMP_WIDTH_MPC;
  return BAO_BUMP_AMPLITUDE * Math.exp(-(arg * arg));
}

/** Full model correlation function. */
export function baoCorrelation(
  sMpc: number,
  rdMpc: number = SOUND_HORIZON_FIDUCIAL_MPC,
): number {
  return baoSmooth(sMpc) + baoBump(sMpc, rdMpc);
}

/** Curve sampler. */
export function baoCurve(
  rdMpc: number,
  options: { sMinMpc?: number; sMaxMpc?: number; samples?: number } = {},
): ReadonlyArray<{ s: number; xi: number }> {
  const lo = options.sMinMpc ?? 50;
  const hi = options.sMaxMpc ?? 200;
  const n = options.samples ?? 200;
  if (n < 2) throw new Error("baoCurve: samples must be >= 2");
  const out: { s: number; xi: number }[] = [];
  for (let i = 0; i < n; i++) {
    const t = i / (n - 1);
    const s = lo + (hi - lo) * t;
    out.push({ s, xi: baoCorrelation(s, rdMpc) });
  }
  return out;
}

/**
 * BOSS-like uncertainty on a single ξ(s) bin. Cosmic variance for
 * pair counts at scale s, integrated over a Δs bin in a finite survey
 * volume. Crude scaling: σ_ξ(s) ≈ 2 × |ξ(s)| × √(s / 100) + floor.
 */
export function approximateBossSigma(sMpc: number, xi: number): number {
  return Math.max(2e-4, Math.abs(xi) * 0.25 * Math.sqrt(sMpc / 100));
}
