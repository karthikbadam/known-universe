# Planck 2018 CMB temperature power spectrum — real data fetch instructions

## Source

> Planck Collaboration (2020). *Planck 2018 results. VI. Cosmological
> parameters*. A&A 641, A6.
> [doi:10.1051/0004-6361/201833910](https://doi.org/10.1051/0004-6361/201833910)
>
> Data product: `COM_PowerSpect_CMB-TT-binned_R3.01.txt` — the binned
> TT-only D_ℓ values used in the published Planck 2018 figure.

## Target schema

The downstream loader (`/src/data/loaders.ts`, the Mosaic `loadCSV` call
in `/src/mosaic/coordinator.ts`) expects:

```
ell,Dl,Dl_lower,Dl_upper,sigma
```

with a 6-line `#`-prefixed provenance header above the column row. Use the
header from `/scripts/simulate/cmb_powerspectrum.ts` as the template —
same six fields, swap `# SIMULATED DATA …` for `# REAL DATA — Planck
2018 TT binned`. Units: μK² (multiplied by ℓ(ℓ+1)/2π).

## Option A — Planck Legacy Archive (requires registration)

```sh
curl -L -o COM_PowerSpect_CMB-TT-binned_R3.01.txt \
  "https://pla.esac.esa.int/pla/aio/product-action?COSMOLOGY.FILE_ID=COM_PowerSpect_CMB-TT-binned_R3.01.txt"
```

The file has 215 binned ℓ entries. Columns are `ℓ`, `Dℓ` (μK²), `-Δ`,
`+Δ`. To convert to our schema, set `Dl_lower = Dl - Δ_minus`,
`Dl_upper = Dl + Δ_plus`, and `sigma = (Δ_minus + Δ_plus) / 2`. Strip
the comment header, prepend our six-line provenance block, and save as
`/public/data/planck_dl.csv`.

## Flip the UI from simulated to real

In `/src/plots/CMBPowerSpectrum.tsx`, change the one line:

```ts
const dataStatus: DataStatus = "simulated";
```

to:

```ts
const dataStatus: DataStatus = "real";
```

That's the only code change. The plot, math, and slider behavior are
identical between simulated and real.

## Re-run the simulate path

If you tweak the simulate parameters (binning, fiducial cosmology,
noise model), regenerate via:

```sh
npm run simulate:cmb
```

## Upgrading the theory curve from analytical → CAMB

The model curve currently comes from `cmbModelDl()` in
`/src/physics/cmb.ts`, a parameterized analytical fit. To swap in a
precomputed CAMB grid (per the spec):

1. Run CAMB offline over (Ω_m, Ω_bh², H₀, n_s) on a 5⁴ = 625 grid.
2. Save D_ℓ(ℓ) at ~250 ℓ samples per grid point to
   `/public/data/camb_grid.json`.
3. Replace `cmbModelDl()` with a 4-D linear interpolator over the grid.
4. Keep the same call signature — the plot and slider code don't change.

The grid file should stay under ~5 MB to fit comfortably in the 20 MB
`/public/data` budget.
