// Luminosity distance for flat ΛCDM (and weak open/closed extensions).
//
// E(z) = √(Ω_m (1+z)³ + Ω_Λ + Ω_k (1+z)²)
// d_C(z) = (c/H₀) ∫₀^z dz' / E(z')
// d_L(z) = (1+z) · d_C(z)   (flat)
//        = (1+z) · (c/H₀) · S_k(∫₀^z dz' / E(z')) · 1/√|Ω_k|   (curved)
//
// μ(z) = 5 log₁₀(d_L / 10 pc) = 5 log₁₀(d_L / Mpc) + 25
//
// Integration: Simpson's rule over a fine grid in z'. Cheap (~50 steps).
// Used by the supernova Hubble diagram plot.

import { SPEED_OF_LIGHT_KM_S } from "./friedmann.js";

const MPC_TO_PC = 1e6;

export interface CosmologyParams {
  H0: number;
  omegaM: number;
  omegaLambda: number;
}

function ezFlat(z: number, p: CosmologyParams): number {
  const omegaK = 1 - p.omegaM - p.omegaLambda;
  const onePlusZ = 1 + z;
  return Math.sqrt(
    p.omegaM * onePlusZ ** 3 + p.omegaLambda + omegaK * onePlusZ ** 2,
  );
}

export function comovingDistanceMpc(z: number, p: CosmologyParams, n = 80): number {
  if (z <= 0) return 0;
  const N = n % 2 === 0 ? n : n + 1;
  const h = z / N;
  let sum = 1 / ezFlat(0, p) + 1 / ezFlat(z, p);
  for (let i = 1; i < N; i++) {
    const zi = i * h;
    sum += (i % 2 === 0 ? 2 : 4) / ezFlat(zi, p);
  }
  const integral = (h / 3) * sum;
  return (SPEED_OF_LIGHT_KM_S / p.H0) * integral;
}

export function luminosityDistanceMpc(z: number, p: CosmologyParams): number {
  if (z <= 0) return 0;
  const dC = comovingDistanceMpc(z, p);
  const omegaK = 1 - p.omegaM - p.omegaLambda;
  if (Math.abs(omegaK) < 1e-4) return (1 + z) * dC;
  const dhMpc = SPEED_OF_LIGHT_KM_S / p.H0;
  const arg = (Math.sqrt(Math.abs(omegaK)) * dC) / dhMpc;
  if (omegaK > 0) {
    return ((1 + z) * dhMpc * Math.sinh(arg)) / Math.sqrt(omegaK);
  }
  return ((1 + z) * dhMpc * Math.sin(arg)) / Math.sqrt(-omegaK);
}

export function distanceModulus(z: number, p: CosmologyParams): number {
  const dLMpc = luminosityDistanceMpc(z, p);
  const dLPc = dLMpc * MPC_TO_PC;
  return 5 * Math.log10(dLPc / 10);
}

export function muCurve(
  p: CosmologyParams,
  options: { zMin?: number; zMax?: number; samples?: number } = {},
): ReadonlyArray<{ z: number; mu: number }> {
  const lo = options.zMin ?? 0.005;
  const hi = options.zMax ?? 2.5;
  const n = options.samples ?? 200;
  if (n < 2) throw new Error("muCurve: samples must be >= 2");
  const logLo = Math.log(lo);
  const logHi = Math.log(hi);
  const out: { z: number; mu: number }[] = [];
  for (let i = 0; i < n; i++) {
    const t = i / (n - 1);
    const z = Math.exp(logLo + (logHi - logLo) * t);
    out.push({ z, mu: distanceModulus(z, p) });
  }
  return out;
}
