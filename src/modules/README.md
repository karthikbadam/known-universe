# Modules

A *module* is a self-contained interactive journal on one topic (e.g. cosmology,
quantum, statmech). The catalog at `/` lists modules; each live module mounts at
`/<slug>` with its own hero + sections.

## Folder shape

```
src/modules/
  <slug>/
    index.ts          # exports the ModuleMeta object (default or named)
    sections.tsx      # builds the ReactNode[] returned by meta.sections()
    plots/            # module-specific plot components (optional)
    data/             # module-specific datasets (optional)
```

## Registration

A module is "real" once its `ModuleMeta` is added to the `MODULES` array in
`src/modules/index.ts`. Set `status: 'live'` to show it as launchable; use
`'soon'` for placeholders on the catalog.

## Contract

See `types.ts` for the full `ModuleMeta` shape. Key points:

- `slug` must be url-safe and unique.
- `sections` is a **factory** — it returns the `ReactNode[]` on demand so
  modules can lazy-build heavy plot trees only when their route is mounted.
- `cover` is optional; omit it to fall back to a default catalog card style.
