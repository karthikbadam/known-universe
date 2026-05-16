// Hubble's law and related kinematic helpers used by the 1929 plot.
//
// The full Friedmann integrals (comoving distance, luminosity distance)
// live in `/src/physics/luminosity.ts` so that they can be shared with
// the supernova Hubble diagram without dragging unrelated Hubble-1929
// helpers along.

export const SPEED_OF_LIGHT_KM_S = 299_792.458;

/**
 * Hubble's law: recession velocity (km/s) for a given distance (Mpc)
 * and Hubble constant (km/s/Mpc). Trivially linear; defined as a
 * function so the model curve, the simulate script, and any later fit
 * all go through one place.
 */
export function hubbleVelocity(distanceMpc: number, hubbleConstant: number): number {
  return hubbleConstant * distanceMpc;
}

/**
 * Sample N evenly-spaced points on [0, maxDistanceMpc] and return their
 * (distance, model velocity) pairs. Used by the model overlay and tests.
 */
export function hubbleModelCurve(
  hubbleConstant: number,
  maxDistanceMpc: number,
  samples = 64,
): ReadonlyArray<{ d: number; v: number }> {
  if (samples < 2) {
    throw new Error("hubbleModelCurve: need at least 2 samples");
  }
  const out: { d: number; v: number }[] = [];
  const step = maxDistanceMpc / (samples - 1);
  for (let i = 0; i < samples; i++) {
    const d = i * step;
    out.push({ d, v: hubbleVelocity(d, hubbleConstant) });
  }
  return out;
}

/**
 * Hubble time = 1 / H₀, expressed in Gyr. H₀ in km/s/Mpc.
 * 1 Mpc = 3.0857e19 km; 1 Gyr = 3.1557e16 s.
 */
export function hubbleTimeGyr(hubbleConstant: number): number {
  const KM_PER_MPC = 3.0857e19;
  const S_PER_GYR = 3.1557e16;
  const tH_seconds = KM_PER_MPC / hubbleConstant;
  return tH_seconds / S_PER_GYR;
}
