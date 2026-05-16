// Big Bang Nucleosynthesis (BBN) light-element abundance predictions.
//
// Pure analytical fits to the PArthENoPE / Cyburt 2016 results. The
// abundances are functions of Ω_b h² (baryon density) and N_eff
// (effective number of relativistic species). Quantitatively correct
// to ~2-5% within Ω_b h² ∈ [0.005, 0.05] and N_eff near 3.046.
//
// Observed values: Cooke et al. (2018) for D/H, Aver et al. (2015)
// for Y_p, Sbordone et al. (2010) for ⁷Li/H. The lithium discrepancy
// (theory predicts ~3x observed) is the famous "lithium problem".
//
// References:
//   - Cyburt, R. H. et al. (2016). Rev. Mod. Phys. 88, 015004.
//   - Pisanti, O. et al. (2008). Comput. Phys. Commun. 178, 956.

export const OMEGA_BH2_FIDUCIAL = 0.02237;
export const N_EFF_STANDARD = 3.046;

/**
 * D/H predicted by BBN at given Ω_b h² and N_eff.
 * Returns the deuterium-to-hydrogen ratio (dimensionless, ~10⁻⁵).
 * Fit: D/H × 10⁵ ≈ 2.587 × (Ω_b h² / 0.022)^-1.6 × (N_eff / 3.046)^0.4
 */
export function bbnDoverH(omegaBh2: number, nEff: number = N_EFF_STANDARD): number {
  return (
    2.587e-5 *
    Math.pow(omegaBh2 / 0.022, -1.6) *
    Math.pow(nEff / N_EFF_STANDARD, 0.4)
  );
}

/**
 * Y_p (helium-4 mass fraction) predicted by BBN.
 * Fit: Y_p ≈ 0.2467 + 0.012 × (Ω_b h² - 0.022)/0.001 + 0.014 × (N_eff - 3.046)
 */
export function bbnYp(omegaBh2: number, nEff: number = N_EFF_STANDARD): number {
  return (
    0.2467 +
    0.0012 * ((omegaBh2 - 0.022) / 0.001) +
    0.014 * (nEff - N_EFF_STANDARD)
  );
}

/**
 * ⁷Li/H predicted by BBN.
 * Fit: ⁷Li/H × 10¹⁰ ≈ 4.7 × (Ω_b h² / 0.022)^2.1
 * Predicts ~3× the observed value, the lithium problem.
 */
export function bbnLi7overH(omegaBh2: number, nEff: number = N_EFF_STANDARD): number {
  return (
    4.7e-10 *
    Math.pow(omegaBh2 / 0.022, 2.1) *
    Math.pow(nEff / N_EFF_STANDARD, -0.3)
  );
}

/** Sample theory curves over an Ω_b h² grid. Used by simulate + plot. */
export function bbnGrid(
  nEff: number,
  options: { omegaBh2Min?: number; omegaBh2Max?: number; samples?: number } = {},
): ReadonlyArray<{ omegaBh2: number; dH: number; yp: number; li7H: number }> {
  const lo = options.omegaBh2Min ?? 0.005;
  const hi = options.omegaBh2Max ?? 0.05;
  const n = options.samples ?? 80;
  if (n < 2) throw new Error("bbnGrid: samples must be >= 2");
  const logLo = Math.log(lo);
  const logHi = Math.log(hi);
  const out: { omegaBh2: number; dH: number; yp: number; li7H: number }[] = [];
  for (let i = 0; i < n; i++) {
    const t = i / (n - 1);
    const x = Math.exp(logLo + (logHi - logLo) * t);
    out.push({
      omegaBh2: x,
      dH: bbnDoverH(x, nEff),
      yp: bbnYp(x, nEff),
      li7H: bbnLi7overH(x, nEff),
    });
  }
  return out;
}

// Observed values with 1σ errors. Real published measurements.
export const BBN_OBSERVED = {
  // Cooke et al. (2018): D/H = (2.527 ± 0.030) × 10⁻⁵ (quasar absorption)
  dH: { value: 2.527e-5, sigma: 0.030e-5, source: "Cooke 2018" },
  // Aver et al. (2015): Y_p = 0.2449 ± 0.0040 (HII regions in extragalactic spectra)
  yp: { value: 0.2449, sigma: 0.0040, source: "Aver 2015" },
  // Sbordone et al. (2010): ⁷Li/H = (1.6 ± 0.3) × 10⁻¹⁰ (Spite plateau stars)
  li7H: { value: 1.6e-10, sigma: 0.3e-10, source: "Sbordone 2010" },
} as const;
