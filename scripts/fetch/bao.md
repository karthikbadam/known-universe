# BOSS BAO ξ(s), fetch instructions

## Source

> Alam, S. et al. (2017). *The clustering of galaxies in the completed
> SDSS-III Baryon Oscillation Spectroscopic Survey: cosmological
> analysis of the DR12 galaxy sample*. MNRAS 470, 2617.
> [doi:10.1093/mnras/stx721](https://doi.org/10.1093/mnras/stx721)

Public data products:

- `https://data.sdss.org/sas/dr12/boss/papers/clustering/Alam_etal_2016_NGC_xi.dat`
  (and `Alam_etal_2016_SGC_xi.dat` for the other galactic cap)

The data is binned correlation function ξ(s) for the galaxy sample,
with columns `s_min`, `s_max`, `s_avg`, `xi`, `sigma`. Concatenate
NGC+SGC, bin to ~30 evenly-spaced s values, and reformat to our schema.

## Target schema

```
s_mpc,xi,xi_lower,xi_upper,sigma
```

with a 6-line `#` provenance header. Units: Mpc.

## Flip the UI

```ts
const dataStatus: DataStatus = "simulated";  // → "real"
```

In `/src/plots/BAOFeature.tsx`.

## Re-run the simulate path

```sh
npm run simulate:bao
```
