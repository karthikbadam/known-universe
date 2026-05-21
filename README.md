# Known Universe

Known Universe is an interactive journal of canonical visualizations in
scientific fields. Each module is a single-page scroll through the plots
that build a model, with parameter sliders that re-derive the curves in real
time. Module 01 is Cosmology; more modules are planned.

## Stack

- React 19 + TypeScript (strict)
- Vite 6
- Chakra UI v3 (with `@emotion/react`) and `next-themes` for color mode
- React Router 7 (catalog at `/`, modules at `/m/:slug`)
- `@uwdata/mosaic-core` + `@uwdata/mosaic-plot` + `@uwdata/mosaic-sql` +
  `@uwdata/vgplot` 0.26 (the convenience layer; spec compatible)
- DuckDB-WASM (Mosaic's default backend)
- KaTeX for math, `zod` 4 for runtime data validation
- Vitest 2 for unit tests, Playwright for the e2e smoke
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

- `/src/pages/Catalog.tsx`: catalog landing page rendered at `/`
- `/src/components/`: shared template pieces (`ModuleCard`, `ModuleHero`,
  `ModulePage`, `PlotSection`, `MathBlock`, `ParamSlider`, `RulesInOut`,
  `Citation`)
- `/src/modules/<slug>/`: one folder per module containing:
  - `index.tsx`: the module's `ModuleMeta` (id, slug, title, heroLabel,
    tagline, summary, status, optional cover, `sections()` factory)
  - `plots/`: the section components rendered by `sections()`
  - `physics/`: pure, unit-testable physics functions for that module
  - `data/` (optional): module-specific loaders and tables
- `/src/modules/index.ts`: the module registry (`MODULES`, `getModuleBySlug`,
  `getLiveModules`)
- `/src/mosaic`: Mosaic coordinator + React `useParam` hook
- `/src/data`: shared loaders + Zod schemas
- `/src/theme`: Chakra theme (monochrome, light by default)
- `/public/data`: data files; every file has a 6-line provenance header
- `/scripts/fetch/<plot>.md`: instructions for fetching real data
- `/scripts/simulate/<plot>.ts`: simulated fallback generators

## Adding a new module

1. Create `src/modules/<slug>/` with `plots/`, `physics/`, and an
   `index.tsx`.
2. In `src/modules/<slug>/index.tsx`, define and export a `ModuleMeta`
   (`id`, `slug`, `title`, `heroLabel`, `tagline`, `summary`, `status`,
   optional `cover`, and a `sections()` factory returning the ordered
   `ReactNode[]` rendered below the hero).
3. Write the section components under `src/modules/<slug>/plots/` and any
   supporting physics under `src/modules/<slug>/physics/`.
4. Register the new module in `src/modules/index.ts` by importing its
   `ModuleMeta` and adding it to the `MODULES` array. The catalog and the
   `/m/:slug` route pick it up automatically.

## Data policy

Every dataset lives in `/public/data/<name>.{csv,json,png}` with a six-line
`#`-prefixed provenance header declaring status (real or simulated),
generating script or source paper, and schema. Replacement instructions live
in `/scripts/fetch/<plot>.md`; simulated fallback generators live in
`/scripts/simulate/<plot>.ts`.
