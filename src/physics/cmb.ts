// CMB temperature angular power spectrum, D_ℓ = ℓ(ℓ+1)C_ℓ/2π (μK²).
//
// This module ships a parameterized analytical model — not CAMB output.
// The fiducial point matches Planck 2018 base-ΛCDM. Parameter responses
// are calibrated to reproduce the qualitative features that make this
// plot famous:
//
//   - Sachs-Wolfe plateau at low ℓ (ℓ < 30)
//   - Acoustic peaks at ℓ_n ≈ n × ℓ_1 with ℓ_1 ≈ 220
//   - Baryon-driven asymmetry: more baryons → odd (compression) peaks
//     taller, even (rarefaction) peaks shorter
//   - Silk damping envelope cutting off the high-ℓ tail
//   - Spectral tilt n_s flattens or steepens the whole spectrum
//
// Quantitatively this is wrong by ~5-15% vs CAMB; qualitatively it lets
// every slider in the plot do the physically right thing. To swap in a
// precomputed CAMB grid, replace cmbModelDl() with a 4-D interpolator
// over (Ω_m, Ω_b h², H₀, n_s) and keep the same call signature.
//
// References:
//   - Hu, W. & Dodelson, S. (2002). Annu. Rev. Astron. Astrophys. 40, 171.
//   - Planck Collab. (2020). A&A 641, A6.

export interface CmbParams {
  /** Hubble constant, km/s/Mpc. Planck 2018: 67.4 */
  H0: number;
  /** Total matter density parameter Ω_m. Planck 2018: 0.315 */
  omegaM: number;
  /** Physical baryon density Ω_b h². Planck 2018: 0.02237 */
  omegaBh2: number;
  /** Scalar spectral index n_s. Planck 2018: 0.9649 */
  nS: number;
}

export const PLANCK_2018: Readonly<CmbParams> = {
  H0: 67.4,
  omegaM: 0.315,
  omegaBh2: 0.02237,
  nS: 0.9649,
};

const REFERENCE_PEAKS: ReadonlyArray<readonly [number, number]> = [
  [220, 5800],
  [540, 2580],
  [810, 2500],
  [1130, 1300],
  [1420, 950],
  [1730, 600],
  [2050, 320],
];

const REFERENCE_PEAK_WIDTH_ELL = 85;
const SACHS_WOLFE_PLATEAU_UK2 = 950;
const SACHS_WOLFE_TURNOVER_ELL = 30;
const REFERENCE_ELL_SILK = 1300;
const ELL_PIVOT_TILT = 100;

export function cmbModelDl(ell: ReadonlyArray<number>, p: CmbParams): number[] {
  const refH = PLANCK_2018.H0 / 100;
  const refOmegaMh2 = PLANCK_2018.omegaM * refH * refH;

  const h = p.H0 / 100;
  const omegaMh2 = p.omegaM * h * h;

  const ellScale =
    Math.pow(omegaMh2 / refOmegaMh2, 0.25) *
    Math.pow(p.omegaBh2 / PLANCK_2018.omegaBh2, 0.08) *
    (PLANCK_2018.H0 / p.H0);

  const ellSilk = REFERENCE_ELL_SILK * Math.pow(refOmegaMh2 / omegaMh2, 0.5);

  const baryonRatio = p.omegaBh2 / PLANCK_2018.omegaBh2;

  const tiltExponent = p.nS - PLANCK_2018.nS;

  return ell.map((l) => {
    const tilt = Math.pow(l / ELL_PIVOT_TILT, tiltExponent);

    const swSuppression = Math.exp(
      -Math.pow(l / SACHS_WOLFE_TURNOVER_ELL, 2),
    );
    const swPart = SACHS_WOLFE_PLATEAU_UK2 * tilt * (0.6 + swSuppression);

    let acoustic = 0;
    for (let i = 0; i < REFERENCE_PEAKS.length; i++) {
      const peak = REFERENCE_PEAKS[i]!;
      const refEll = peak[0];
      const refHeight = peak[1];
      const peakNumber = i + 1;
      const baryonBoost =
        peakNumber % 2 === 1
          ? Math.pow(baryonRatio, 0.45)
          : Math.pow(baryonRatio, -0.15);
      const shiftedEll = refEll * ellScale;
      const width = REFERENCE_PEAK_WIDTH_ELL * Math.sqrt(peakNumber);
      const gaussian = Math.exp(-Math.pow((l - shiftedEll) / width, 2));
      acoustic += refHeight * baryonBoost * gaussian;
    }

    const silk = Math.exp(-Math.pow(l / ellSilk, 1.3));

    return Math.max(0, swPart + acoustic * tilt * silk);
  });
}

export function cmbModelCurve(
  p: CmbParams,
  options: { ellMin?: number; ellMax?: number; samples?: number } = {},
): ReadonlyArray<{ ell: number; Dl: number }> {
  const ellMin = options.ellMin ?? 2;
  const ellMax = options.ellMax ?? 2500;
  const samples = options.samples ?? 500;
  if (samples < 2) throw new Error("cmbModelCurve: samples must be >= 2");

  const logMin = Math.log(ellMin);
  const logMax = Math.log(ellMax);
  const ell: number[] = [];
  for (let i = 0; i < samples; i++) {
    const t = i / (samples - 1);
    ell.push(Math.exp(logMin + (logMax - logMin) * t));
  }
  const Dl = cmbModelDl(ell, p);
  return ell.map((l, i) => ({ ell: l, Dl: Dl[i]! }));
}

export function approximatePlanckSigma(
  ell: number,
  Dl: number,
  binWidth = 30,
): number {
  const fSky = 0.7;
  const nModesInBin = Math.max(1, (2 * ell + 1) * binWidth * fSky);
  const cosmicVariance = Math.sqrt(2 / nModesInBin) * Dl;
  const noiseFloor = 8 + Math.pow(ell / 1200, 4) * 60;
  return Math.sqrt(cosmicVariance * cosmicVariance + noiseFloor * noiseFloor);
}
