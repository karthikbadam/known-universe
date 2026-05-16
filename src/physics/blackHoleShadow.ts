// Black hole shadow geometry for Schwarzschild and slowly-spinning Kerr.
//
// The "shadow" is the apparent dark disk an Earth-bound observer sees
// because photons emitted from behind the BH within an impact parameter
// b ≲ 5.196 R_s (for a non-spinning BH) are captured. Diameter on the
// sky:
//
//   D_obs = 2 b_crit / D_obs_distance
//
// where b_crit = 3√3 G M / c² = 5.196 R_s/2 = 3√3 R_g, and D_distance
// is the angular-diameter distance to the BH.
//
// Reference:
//   - EHT Collab. (2019). ApJ 875, L1-L6.
//   - Bardeen, J. M. (1973). Black Holes (Les Houches).

export const SPEED_OF_LIGHT_M_S = 299792458;
export const GRAVITATIONAL_CONSTANT = 6.6743e-11;
export const SOLAR_MASS_KG = 1.98892e30;
export const MPC_M = 3.0857e22;
export const RADIANS_TO_UAS = (180 / Math.PI) * 3600 * 1e6;

/** Schwarzschild radius R_s = 2GM/c² in metres. M in solar masses. */
export function schwarzschildRadiusM(massSolar: number): number {
  return (2 * GRAVITATIONAL_CONSTANT * massSolar * SOLAR_MASS_KG) / (SPEED_OF_LIGHT_M_S ** 2);
}

/**
 * Apparent shadow diameter on the sky in micro-arcseconds (μas), for a
 * Schwarzschild BH of given mass at given distance. The shadow diameter
 * is 2 × b_crit = 6√3 G M / c² = 5.196 × R_s.
 */
export function shadowDiameterUas(massSolar: number, distanceMpc: number): number {
  const bCritM = 3 * Math.sqrt(3) * (GRAVITATIONAL_CONSTANT * massSolar * SOLAR_MASS_KG) / (SPEED_OF_LIGHT_M_S ** 2);
  const distM = distanceMpc * MPC_M;
  const radians = (2 * bCritM) / distM;
  return radians * RADIANS_TO_UAS;
}

/**
 * Inclination correction (very modest for Kerr): the apparent shadow
 * shrinks by a few percent at moderate viewing angles and spin. We use a
 * simple cos-dependent fudge as a teaching device.
 */
export function inclinationFactor(inclinationDeg: number): number {
  const rad = (inclinationDeg * Math.PI) / 180;
  return 1 - 0.04 * Math.pow(Math.sin(rad), 2);
}

export const M87_OBSERVED = {
  shadowDiameterUas: 42,
  shadowSigmaUas: 3,
  distanceMpc: 16.8,
  massSolar: 6.5e9,
} as const;
