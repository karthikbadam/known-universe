# Cosmology Visualization Lab

Interactive journal of canonical data visualizations in physics. Module 1 is
Cosmology — a single-page scroll through ten plots that build the ΛCDM model,
each with parameter sliders that re-derive the curve in real time.

## Status

Gates 1 + 2 shipped: scaffold + Hubble 1929 plot + CMB angular power spectrum.
Plots 2, 3, 5–10 and the ΛCDM synthesis section land in Gate 3.

## Stack

  - React 18 + TypeScript (strict)
  - Vite
  - Chakra UI v2
  - `@uwdata/mosaic-core` + `@uwdata/mosaic-plot` + `@uwdata/mosaic-sql` +
    `@uwdata/vgplot` (the convenience layer; spec compatible)
  - DuckDB-WASM (Mosaic's default backend)
  - KaTeX for math
  - No backend; all data bundled in `/public/data`

## Run

```sh
npm install
npm run dev         # http://localhost:5173
```

## Verify

```sh
npm run typecheck   # tsc --noEmit
npm test            # vitest
npm run build       # production build
```

## Layout

- `/src/components` — shared template pieces (PlotSection, MathBlock,
  ParamSlider, DataStatusBadge, RulesInOut, Citation)
- `/src/plots` — one file per plot section
- `/src/physics` — pure, unit-testable physics functions
- `/src/mosaic` — Mosaic coordinator + React `useParam` hook
- `/src/data` — loaders + Zod schemas
- `/src/theme` — Chakra theme (navy/gold, dark by default)
- `/public/data` — data files; every file has a 6-line provenance header
- `/scripts/fetch/<plot>.md` — instructions for fetching real data
- `/scripts/simulate/<plot>.ts` — simulated fallback generators

## Data policy

Every dataset lives in `/public/data/<name>.{csv,json,png}` with a six-line
`#`-prefixed provenance header declaring status (real or simulated),
generating script or source paper, and schema. Replacement instructions live
in `/scripts/fetch/<plot>.md`; simulated fallback generators live in
`/scripts/simulate/<plot>.ts`.

To flip a plot from simulated to real data, follow the matching
`/scripts/fetch/<plot>.md` and change a single `dataStatus` line in the
plot component.
