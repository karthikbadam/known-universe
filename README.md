# Known Universe

Known Universe is an interactive journal of canonical visualizations in
physics. Module 01 is Cosmology: a single-page scroll through ten plots that
build the ΛCDM model, each with parameter sliders that re-derive the curve in
real time. Future modules will cover other branches of physics in the same
format.

## Status

Gates 1 + 2 shipped: scaffold + Hubble 1929 plot + CMB angular power spectrum.
Plots 2, 3, 5–10 and the ΛCDM synthesis section land in Gate 3.

All ten plots now ship with real data: Planck 2018 binned TT, Pantheon+SH0ES
supernovae, SPARC rotation curves, BOSS DR12 ξ(s), GW150914 H1 strain
(whitened + bandpassed), Planck SMICA all-sky map, and the EHT M87* image,
in addition to the Hubble 1929 transcription and BBN measurements that were
already real. See `/public/data/README.md` for the per-file provenance.

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

- `/src/components`: shared template pieces (PlotSection, MathBlock,
  ParamSlider, RulesInOut, Citation)
- `/src/plots`: one file per plot section
- `/src/physics`: pure, unit-testable physics functions
- `/src/mosaic`: Mosaic coordinator + React `useParam` hook
- `/src/data`: loaders + Zod schemas
- `/src/theme`: Chakra theme (monochrome, light by default)
- `/public/data`: data files; every file has a 6-line provenance header
- `/scripts/fetch/<plot>.md`: instructions for fetching real data
- `/scripts/simulate/<plot>.ts`: simulated fallback generators

## Data policy

Every dataset lives in `/public/data/<name>.{csv,json,png}` with a six-line
`#`-prefixed provenance header declaring status (real or simulated),
generating script or source paper, and schema. Replacement instructions live
in `/scripts/fetch/<plot>.md`; simulated fallback generators live in
`/scripts/simulate/<plot>.ts`.
