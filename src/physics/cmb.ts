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

// Reference peak positions (Planck 2018 best fit) and heights (μK²) for
// peaks 1-7. Peaks 2+ are at ~270 + (n-2)*300 ℓ spacing (the famous
// "peak phase shift" from the n × ℓ_1 prediction).
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

/**
 * Sample D_ℓ over an array of ℓ values for the given cosmological params.
 * Returns μK² values; caller may need to clip negatives near the noise
 * floor (none expected within the model's domain).
 */
export function cmbModelDl(ell: ReadonlyArray<number>, p: CmbParams): number[] {
  const refH = PLANCK_2018.H0 / 100;
  const refOmegaMh2 = PLANCK_2018.omegaM * refH * refH;

  const h = p.H0 / 100;
  const omegaMh2 = p.omegaM * h * h;

  // Peak position scaling. ℓ_1 ∝ D_A(z*) / r_s(z*). To rough fitting-formula
  // precision (Hu+ 2001), D_A ∝ 1/H_0 with weak Ω_m dependence and
  // r_s ∝ (Ω_m h²)^-0.25 (Ω_b h²)^-0.08. Combine:
  const ellScale =
    Math.pow(omegaMh2 / refOmegaMh2, 0.25) *
    Math.pow(p.omegaBh2 / PLANCK_2018.omegaBh2, 0.08) *
    (PLANCK_2018.H0 / p.H0);

  // Silk damping scale shrinks with more matter (peaks more damped).
  const ellSilk = REFERENCE_ELL_SILK * Math.pow(refOmegaMh2 / omegaMh2, 0.5);

  // Baryon ratio drives odd/even peak asymmetry.
  const baryonRatio = p.omegaBh2 / PLANCK_2018.omegaBh2;

  // Spectral tilt around the pivot. n_s < 1 = redder (more power at low ℓ).
  const tiltExponent = p.nS - PLANCK_2018.nS;

  return ell.map((l) => {
    const tilt = Math.pow(l / ELL_PIVOT_TILT, tiltExponent);

    // SW plateau: roughly constant for ℓ < 30, vanishing above.
    const swSuppression = Math.exp(
      -Math.pow(l / SACHS_WOLFE_TURNOVER_ELL, 2),
    );
    const swPart = SACHS_WOLFE_PLATEAU_UK2 * tilt * (0.6 + swSuppression);

    // Sum of Gaussian acoustic peaks, each shifted by ellScale and
    // modulated by the baryon ratio.
    let acoustic = 0;
    for (let i = 0; i < REFERENCE_PEAKS.length; i++) {
      const peak = REFERENCE_PEAKS[i]!;
      const refEll = peak[0];
      const refHeight = peak[1];
      const peakNumber = i + 1;
      // Odd peaks (compression, n=1,3,5,7) rise with baryon ratio.
      // Even peaks (rarefaction, n=2,4,6) fall with baryon ratio.
      const baryonBoost =
        peakNumber % 2 === 1
          ? Math.pow(baryonRatio, 0.45)
          : Math.pow(baryonRatio, -0.15);
      const shiftedEll = refEll * ellScale;
      const width = REFERENCE_PEAK_WIDTH_ELL * Math.sqrt(peakNumber);
      const gaussian = Math.exp(-Math.pow((l - shiftedEll) / width, 2));
      acoustic += refHeight * baryonBoost * gaussian;
    }

    // Silk damping multiplies the whole acoustic envelope.
    const silk = Math.exp(-Math.pow(l / ellSilk, 1.3));

    return Math.max(0, swPart + acoustic * tilt * silk);
  });
}

/**
 * Convenience: generate (ℓ, D_ℓ) pairs over a logarithmic ℓ grid.
 * Returns a row-oriented array suitable for Mosaic vg.line(arrayData, ...).
 */
export function cmbModelCurve(
  p: CmbParams,
  options: { ellMin?: number; ellMax?: number; samples?: number } = {},
): ReadonlyArray<{ ell: number; Dl: number }> {
  const ellMin = options.ellMin ?? 2;
  const ellMax = options.ellMax ?? 2500;
  const samples = options.samples ?? 500;
  if (samples < 2) throw new Error("cmbModelCurve: samples must be >= 2");

  // Log-spaced ℓ values give better resolution at the acoustic peaks
  // where the spectrum changes most rapidly per ℓ.
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

/**
 * Approximate uncertainty for binned Planck-like Dℓ. Returns σ in μK².
 * Cosmic-variance + bin-width limited at low and intermediate ℓ; rises
 * sharply in the damping tail due to detector noise. Used by the
 * simulate script and the plot's error bars.
 */
export function approximatePlanckSigma(
  ell: number,
  Dl: number,
  binWidth = 30,
): number {
  const fSky = 0.7; // Planck-like effective sky fraction
  const nModesInBin = Math.max(1, (2 * ell + 1) * binWidth * fSky);
  const cosmicVariance = Math.sqrt(2 / nModesInBin) * Dl;
  // Rough noise-dominated rise: detector noise contributes ~100 μK² by
  // ℓ=2000 (Planck 100/143 GHz, scaled by beam transfer). Constant floor
  // at low ℓ is dominated by cosmic variance, not measurement error.
  const noiseFloor = 8 + Math.pow(ell / 1200, 4) * 60;
  return Math.sqrt(cosmicVariance * cosmicVariance + noiseFloor * noiseFloor);
}
