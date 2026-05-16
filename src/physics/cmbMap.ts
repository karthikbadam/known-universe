// Synthetic CMB-like temperature map for the Mollweide-projection plot.
//
// Real CMB maps are Healpix grids of T(n̂) over the celestial sphere.
// For visualization we generate a low-resolution pixel grid with a
// procedural temperature field that has the right statistical look:
// large-scale, smooth patches at the ~200 μK level (dipole-subtracted)
// plus higher-frequency speckle.

import { mulberry32 } from "./rng.js";

const FIXED_SEED = 42;

interface CmbField {
  width: number;
  height: number;
  values: Float32Array;
}

function smoothLowFrequency(rng: () => number, width: number, height: number): Float32Array {
  const out = new Float32Array(width * height);
  const blobs: { lon: number; lat: number; sigma: number; amp: number }[] = [];
  for (let i = 0; i < 12; i++) {
    blobs.push({
      lon: (rng() * 2 - 1) * Math.PI,
      lat: (rng() - 0.5) * Math.PI * 0.9,
      sigma: 0.3 + rng() * 0.5,
      amp: (rng() - 0.5) * 250,
    });
  }
  for (let y = 0; y < height; y++) {
    const lat = ((y / (height - 1)) - 0.5) * Math.PI;
    for (let x = 0; x < width; x++) {
      const lon = ((x / (width - 1)) - 0.5) * 2 * Math.PI;
      let t = 0;
      for (const b of blobs) {
        const dLon = Math.atan2(Math.sin(lon - b.lon), Math.cos(lon - b.lon));
        const dLat = lat - b.lat;
        const r2 = (dLon * dLon + dLat * dLat) / (b.sigma * b.sigma);
        t += b.amp * Math.exp(-r2);
      }
      out[y * width + x] = t;
    }
  }
  return out;
}

function highFrequencySpeckle(rng: () => number, width: number, height: number): Float32Array {
  const raw = new Float32Array(width * height);
  for (let i = 0; i < raw.length; i++) {
    let u = 0;
    let v = 0;
    while (u === 0) u = rng();
    while (v === 0) v = rng();
    raw[i] = 80 * Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
  }
  const out = new Float32Array(width * height);
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      let sum = 0;
      let count = 0;
      for (let dy = -1; dy <= 1; dy++) {
        for (let dx = -1; dx <= 1; dx++) {
          const xi = x + dx;
          const yi = y + dy;
          if (xi >= 0 && xi < width && yi >= 0 && yi < height) {
            sum += raw[yi * width + xi]!;
            count++;
          }
        }
      }
      out[y * width + x] = sum / count;
    }
  }
  return out;
}

export function generateCmbField(width: number, height: number, seed = FIXED_SEED): CmbField {
  const rng = mulberry32(seed);
  const lf = smoothLowFrequency(rng, width, height);
  const hf = highFrequencySpeckle(rng, width, height);
  const values = new Float32Array(width * height);
  for (let i = 0; i < values.length; i++) values[i] = (lf[i] ?? 0) + (hf[i] ?? 0);
  return { width, height, values };
}

export function mollweideInverse(
  xNorm: number,
  yNorm: number,
): { lon: number; lat: number } | null {
  const x = xNorm;
  const y = yNorm;
  if (x * x + y * y > 1) return null;
  const theta = Math.asin(y);
  const lat = Math.asin((2 * theta + Math.sin(2 * theta)) / Math.PI);
  const lon = (Math.PI * x) / Math.cos(theta);
  if (lon < -Math.PI || lon > Math.PI) return null;
  return { lon, lat };
}

/**
 * Diverging colormap (Planck-like blue-white-red). Input t in μK, scale
 * sets the ± clip range. Returns an [r, g, b] triple of 0-255 ints so
 * callers writing into a canvas ImageData can avoid per-pixel string
 * parsing.
 */
export function temperatureColor(
  tMicroK: number,
  scaleMicroK: number,
): [number, number, number] {
  const x = Math.max(-1, Math.min(1, tMicroK / scaleMicroK));
  if (x < 0) {
    const f = -x;
    return [
      Math.round(255 * (1 - 0.8 * f)),
      Math.round(255 * (1 - 0.6 * f)),
      Math.round(255 * (1 - 0.2 * f)),
    ];
  }
  const f = x;
  return [
    Math.round(255 * (1 - 0.05 * f)),
    Math.round(255 * (1 - 0.5 * f)),
    Math.round(255 * (1 - 0.85 * f)),
  ];
}
