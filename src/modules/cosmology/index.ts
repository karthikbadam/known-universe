import type { ModuleMeta } from "../types";

export const cosmologyModule: ModuleMeta = {
  id: "cosmology",
  slug: "cosmology",
  title: "Cosmology",
  heroLabel: "Module 01",
  tagline:
    "Ten plots that build the ΛCDM model, each re-derived in real time.",
  summary:
    "A single-page scroll through the canonical visualizations of modern cosmology — Hubble's law, the CMB power spectrum, BBN abundances, supernovae, BAO, rotation curves, and gravitational waves — with parameter sliders that re-derive the curves live against bundled datasets.",
  status: "live",
  cover: { kind: "gradient", from: "#0a0a0a", to: "#2a2a2a" },
  sections: () => [],
};
