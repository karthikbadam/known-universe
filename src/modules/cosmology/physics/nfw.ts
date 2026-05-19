// Galaxy rotation curves: visible baryonic disk + NFW dark matter halo.
//
// Newtonian circular velocity: v(r) = √(G M(<r) / r).
// For a thin-disk baryon distribution we use an exponential disk,
// approximated by:
//   M_bary(<r) = M_disk · [1 - (1 + r/R_d) e^{-r/R_d}]
// For dark matter we use the NFW profile:
//   ρ_NFW(r) = ρ_s / ((r/r_s)(1 + r/r_s)²)
//   M_NFW(<r) = 4π ρ_s r_s³ [ln(1 + x) - x/(1+x)],  x = r/r_s
//
// References:
//   - Navarro, Frenk, White (1997). ApJ 490, 493.
//   - SPARC database, Lelli et al. (2016). AJ 152, 157.

const G_SI = 6.6743e-11;
const KPC_M = 3.0857e19;
const MSUN_KG = 1.98892e30;
const G_ASTRO = (G_SI * MSUN_KG) / (KPC_M * 1e6);

export interface NfwParams {
  rsKpc: number;
  rhoSMsunPerKpc3: number;
}

export function nfwEnclosedMass(rKpc: number, p: NfwParams): number {
  const x = Math.max(1e-6, rKpc / p.rsKpc);
  return 4 * Math.PI * p.rhoSMsunPerKpc3 * p.rsKpc ** 3 * (Math.log(1 + x) - x / (1 + x));
}

export function circularVelocityKmS(rKpc: number, massSolar: number): number {
  if (rKpc <= 0) return 0;
  return Math.sqrt((G_ASTRO * massSolar) / rKpc);
}

export function baryonEnclosedMass(rKpc: number, diskMassSolar: number, scaleKpc: number): number {
  const x = rKpc / scaleKpc;
  return diskMassSolar * (1 - (1 + x) * Math.exp(-x));
}

export function rotationVelocity(
  rKpc: number,
  diskMassSolar: number,
  scaleKpc: number,
  nfw: NfwParams,
): { vBary: number; vDm: number; vTot: number } {
  const mBary = baryonEnclosedMass(rKpc, diskMassSolar, scaleKpc);
  const mDm = nfwEnclosedMass(rKpc, nfw);
  const vBary = circularVelocityKmS(rKpc, mBary);
  const vDm = circularVelocityKmS(rKpc, mDm);
  const vTot = Math.sqrt(vBary ** 2 + vDm ** 2);
  return { vBary, vDm, vTot };
}

export function rotationCurve(
  diskMassSolar: number,
  scaleKpc: number,
  nfw: NfwParams,
  options: { rMinKpc?: number; rMaxKpc?: number; samples?: number } = {},
): ReadonlyArray<{ r: number; vBary: number; vDm: number; vTot: number }> {
  const lo = options.rMinKpc ?? 0.5;
  const hi = options.rMaxKpc ?? 30;
  const n = options.samples ?? 80;
  if (n < 2) throw new Error("rotationCurve: samples must be >= 2");
  const out: { r: number; vBary: number; vDm: number; vTot: number }[] = [];
  for (let i = 0; i < n; i++) {
    const t = i / (n - 1);
    const r = lo + (hi - lo) * t;
    out.push({ r, ...rotationVelocity(r, diskMassSolar, scaleKpc, nfw) });
  }
  return out;
}
