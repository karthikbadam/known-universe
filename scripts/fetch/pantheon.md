# Pantheon+ Type Ia supernovae, fetch instructions

## Source

> Brout, D. et al. (2022). *The Pantheon+ Analysis: Cosmological
> Constraints*. ApJ 938, 110.
> [doi:10.3847/1538-4357/ac8e04](https://doi.org/10.3847/1538-4357/ac8e04)

Public data: https://github.com/PantheonPlusSH0ES/DataRelease

```sh
curl -fL -o Pantheon+SH0ES.dat \
  https://raw.githubusercontent.com/PantheonPlusSH0ES/DataRelease/main/Pantheon%2B_Data/4_DISTANCES_AND_COVAR/Pantheon%2BSH0ES.dat
```

The file has ~1700 SNe with columns including `zCMB`, `MU_SH0ES`,
`MU_SH0ES_ERR_DIAG`. Re-emit with columns `z,mu,sigma` and prepend our
6-line provenance header.

## Target schema

```
z,mu,sigma
```

## Flip the UI

```ts
const dataStatus: DataStatus = "simulated";  // → "real"
```

In `/src/plots/SupernovaHubble.tsx`.

## Re-run the simulate path

```sh
npm run simulate:pantheon
```
