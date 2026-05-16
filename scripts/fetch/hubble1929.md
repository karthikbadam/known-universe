# Hubble 1929, real data fetch instructions

## Source

> Hubble, E. (1929). *A Relation Between Distance and Radial Velocity Among
> Extra-Galactic Nebulae*. Proceedings of the National Academy of Sciences,
> 15(3), 168–173.
> [doi:10.1073/pnas.15.3.168](https://doi.org/10.1073/pnas.15.3.168)

Tables I and II of the paper list 24 galaxies with their distances (Mpc) and
radial velocities (km/s). The paper is public domain (US government /
NAS publication, pre-1989 with no notice). The numerical table itself is
not copyrightable.

## Target schema

The downstream code (`/src/data/loaders.ts`, the Mosaic `loadCSV` call in
`/src/mosaic/coordinator.ts`) expects:

```
name,distance_mpc,velocity_km_s
```

with a 6-line `#`-prefixed provenance header above the column row. Use the
header format from `/scripts/simulate/hubble1929.ts` as the template, same
6 fields, swap `# SIMULATED DATA …` for `# REAL DATA, Hubble 1929 Table I+II`.

## Option A, pull from the Astropy tutorials data mirror

The Astropy project hosts a curated transcription of Hubble's tables for
their teaching notebooks. It changes form occasionally; check before relying.

```sh
curl -fL -o public/data/hubble1929.csv \
  https://raw.githubusercontent.com/astropy/astropy-tutorials/main/tutorials/notebooks/Hubbles_Law/Hubble1929.csv
```

Then prepend the 6-line provenance header by hand or with `sed -i '1i …'`,
and rename columns to match the schema if the upstream uses different ones.

## Option B, transcribe from the paper directly

The 24 rows from Hubble (1929) Tables I + II, written out:

| name | distance_mpc | velocity_km_s |
|------|-------------:|--------------:|
| SMC | 0.032 | 170 |
| LMC | 0.034 | 290 |
| NGC 6822 | 0.214 | -130 |
| NGC 598 | 0.263 | -70 |
| NGC 221 | 0.275 | -185 |
| NGC 224 | 0.275 | -220 |
| NGC 5457 | 0.45 | 200 |
| NGC 4736 | 0.5 | 290 |
| NGC 5194 | 0.5 | 270 |
| NGC 4449 | 0.63 | 200 |
| NGC 4214 | 0.8 | 300 |
| NGC 3031 | 0.9 | -30 |
| NGC 3627 | 0.9 | 650 |
| NGC 4826 | 0.9 | 150 |
| NGC 5236 | 0.9 | 500 |
| NGC 1068 | 1.0 | 920 |
| NGC 5055 | 1.1 | 450 |
| NGC 7331 | 1.1 | 500 |
| NGC 4258 | 1.4 | 500 |
| NGC 4151 | 1.7 | 960 |
| NGC 4382 | 2.0 | 500 |
| NGC 4472 | 2.0 | 850 |
| NGC 4486 | 2.0 | 800 |
| NGC 4649 | 2.0 | 1090 |

Distances are Hubble's original (Cepheid-luminosity-miscalibrated) values
in Mpc; velocities are radial velocities corrected for solar motion. These
are the published numbers, known to be wrong by a factor of ~7 in
distance, and that's the point: they reproduce the famous original
scatter plot exactly.

Transcribe into a CSV with the 6-line header (using `# REAL DATA, Hubble
1929 Table I+II` as the first line), save as `/public/data/hubble1929.csv`.

## Flip the UI from simulated to real

In `/src/plots/HubbleDiagram.tsx`, change the one line:

```ts
const dataStatus: DataStatus = "simulated";
```

to:

```ts
const dataStatus: DataStatus = "real";
```

That's the only code change. The plot, the math, and the slider behavior
are identical between simulated and real.

## Re-run the simulate path

If you want to regenerate the simulated fallback (after editing the
simulate parameters, for example):

```sh
npm run simulate:hubble
```
