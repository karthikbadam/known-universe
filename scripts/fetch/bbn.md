# BBN light element abundances — fetch instructions

## Source

> Cyburt, R. H., Fields, B. D., Olive, K. A., Yeh, T.-H. (2016).
> *Big bang nucleosynthesis: Present status*. Rev. Mod. Phys. 88,
> 015004. [doi:10.1103/RevModPhys.88.015004](https://doi.org/10.1103/RevModPhys.88.015004)

PArthENoPE-grade theory grids (over Ω_b h² and N_eff) are available
from the PArthENoPE web interface at
http://parthenope.na.infn.it/. Each grid file is small (<100 kB) and
can be saved directly into `/public/data/bbn_grid.csv` after light
column reformatting to match our schema.

## Observed abundances

Each value below is a real published measurement with 1σ error:

| Species  | Value                 | σ                    | Source                                 |
|----------|----------------------:|---------------------:|----------------------------------------|
| D/H      | 2.527 × 10⁻⁵          | 0.030 × 10⁻⁵         | Cooke et al. (2018), ApJ 855, 102      |
| Y_p      | 0.2449                | 0.0040               | Aver et al. (2015), JCAP 07, 011       |
| ⁷Li/H    | 1.6 × 10⁻¹⁰           | 0.3 × 10⁻¹⁰          | Sbordone et al. (2010), A&A 522, A26   |

The lithium discrepancy — theory predicts ~3× the observed ⁷Li/H —
is the well-known "lithium problem". The plot makes it visually
obvious: at the Ω_b h² that fits D/H, the ⁷Li/H curve sits above the
observed band.

## Schema

Two files in `/public/data`:

```
bbn_grid.csv:     omega_bh2,dH,yp,li7H
bbn_observed.csv: species,value,sigma,source
```

Both prepended with the 6-line `#` provenance block.

## Re-run the simulate path

```sh
npm run simulate:bbn
```

The simulate script writes both files in one pass using the analytical
fits in `/src/physics/bbn.ts`.
