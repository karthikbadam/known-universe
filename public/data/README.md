# /public/data, provenance, status, downsampling

Every dataset bundled with this app declares its provenance in a 6-line
`#`-prefixed header at the top of the file. All datasets are real
measurements; the header tells you:

  1. The dataset name and `# REAL DATA` marker
  2. The source paper or instrument release
  3. The fetch/replacement instructions
  4. The source citation
  5. The schema
  6. Downsampling or processing notes

## File index, all gates

| File                       | Status     | Size    | Source                                            |
|----------------------------|------------|---------|---------------------------------------------------|
| `hubble1929.csv`           | real       | <2 kB   | Hubble 1929 PNAS, Tables I+II                     |
| `bbn_grid.csv`             | real (fit) | <5 kB   | Cyburt 2016 analytical fits                       |
| `bbn_observed.csv`         | real       | <1 kB   | Cooke/Aver/Sbordone abundance measurements        |
| `planck_dl.csv`            | real       | <4 kB   | Planck 2018 binned TT (R3.01)                     |
| `pantheon_plus.csv`        | real       | ~33 kB  | Pantheon+SH0ES, 1619 Type Ia SNe                  |
| `sparc_galaxies.csv`       | real       | <6 kB   | SPARC table 2 (3 galaxies)                        |
| `boss_xi.csv`              | real       | <2 kB   | BOSS DR12 ξ(s) post-recon (Ross 2016)             |
| `gw150914_strain.csv`      | real       | <6 kB   | LIGO H1 whitened+bandpassed strain                |
| `planck_smica.jpg`         | real       | ~700 kB | Planck 2018 SMICA all-sky map (ESA)               |
| `eht_m87.jpg`              | real       | ~40 kB  | EHT M87* April 2019 image (ESO)                   |
