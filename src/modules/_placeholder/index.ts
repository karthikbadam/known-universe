import type { ModuleMeta } from "../types";

export const comingSoonModule: ModuleMeta = {
  id: "quantum",
  slug: "quantum",
  title: "Quantum Mechanics",
  heroLabel: "Module 02",
  tagline: "From wavefunctions to entanglement, derived interactively.",
  summary:
    "A planned walk through the canonical experiments and equations of quantum theory — single-slit and double-slit interference, the time-dependent Schrödinger equation, spin and Stern–Gerlach, and Bell-inequality violations — each visualized as a live, slider-driven derivation.",
  status: "soon",
  cover: {
    kind: "gradient",
    from: "#e5e5e5",
    to: "#a3a3a3",
    fromDark: "#1a1a1a",
    toDark: "#404040",
  },
  sections: () => [],
};
