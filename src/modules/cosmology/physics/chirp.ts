// Compact-binary inspiral chirp waveform (Newtonian/leading PN).
//
// During the inspiral phase of a compact binary (BH-BH for GW150914),
// the gravitational-wave frequency and amplitude grow as the binary
// loses orbital energy to GW emission. To leading post-Newtonian order:
//
//   f(t) = (1/π) · (5/256)^(3/8) · (G M_c / c³)^(-5/8) · (t_c - t)^(-3/8)
//   h(t) ≈ (G M_c / c² D)^(5/4) · (5 / c(t_c - t))^(1/4) · cos[2π ∫ f dt]
//
// where M_c is the chirp mass and t_c the coalescence time.
//
// References:
//   - Abbott, B. P. et al. (LIGO/Virgo) 2016. PRL 116, 061102.
//   - Maggiore, M. (2008). Gravitational Waves Vol. 1.

const G = 6.6743e-11;
const C = 299792458;
const MSUN_KG = 1.98892e30;

const COEF_F = Math.pow(5 / 256, 3 / 8) / Math.PI;

/** Chirp-mass-derived frequency. M_c in solar masses, t & t_c in seconds. */
export function chirpFrequency(t: number, tc: number, chirpMassSolar: number): number {
  const dt = Math.max(1e-4, tc - t);
  const massSI = chirpMassSolar * MSUN_KG;
  const mu = (G * massSI) / Math.pow(C, 3);
  return COEF_F * Math.pow(mu, -5 / 8) * Math.pow(dt, -3 / 8);
}

/** Strain amplitude envelope (no orbital orientation factor). */
export function strainAmplitude(t: number, tc: number, chirpMassSolar: number): number {
  const dt = Math.max(1e-4, tc - t);
  const massSI = chirpMassSolar * MSUN_KG;
  const A = 2.0e-22;
  return A * Math.pow(massSI / MSUN_KG / 30, 5 / 4) * Math.pow(0.1 / dt, 1 / 4);
}

/** Phase: cumulative integral of 2π f(t) dt computed analytically. */
export function chirpPhase(t: number, tc: number, chirpMassSolar: number, phaseOffset = 0): number {
  const dt = Math.max(1e-4, tc - t);
  const massSI = chirpMassSolar * MSUN_KG;
  const mu = (G * massSI) / Math.pow(C, 3);
  const phase = (-2 * Math.PI * COEF_F * Math.pow(mu, -5 / 8) * (-8 / 5) * Math.pow(dt, 5 / 8));
  return phase + phaseOffset;
}

/** Generate strain waveform h(t) over a time array. */
export function chirpWaveform(
  tArray: ReadonlyArray<number>,
  tc: number,
  chirpMassSolar: number,
  phaseOffset = 0,
): number[] {
  return tArray.map((t) => {
    const a = strainAmplitude(t, tc, chirpMassSolar);
    const phi = chirpPhase(t, tc, chirpMassSolar, phaseOffset);
    return a * Math.cos(phi);
  });
}

export const GW150914_FIDUCIAL = {
  chirpMassSolar: 30.6,
  tc: 0.42,
  totalMassSolar: 65,
  distanceMpc: 410,
} as const;
