# /public/data — provenance, status, downsampling

Every dataset bundled with this app declares its provenance in a 6-line
`#`-prefixed header at the top of the file. The header tells you:

  1. Whether the data is real or simulated
  2. The source script (simulate path) or paper (real path)
  3. The fetch/replacement instructions
  4. The source citation
  5. The schema
  6. Generation parameters or downsampling notes

Replacement instructions for every file live under `/scripts/fetch/`.

## File index — all gates

| File                       | Status     | Size  | Source                                            |
|----------------------------|------------|-------|---------------------------------------------------|
| `hubble1929.csv`           | real       | <2 kB | Hubble 1929 PNAS, Tables I+II                     |
| `bbn_grid.csv`             | real (fit) | <5 kB | Cyburt 2016 analytical fits                       |
| `bbn_observed.csv`         | real       | <1 kB | Cooke/Aver/Sbordone abundance measurements        |
| `planck_dl.csv`            | simulated  | <4 kB | Planck-like binned TT Dℓ                          |
| `pantheon_plus.csv`        | simulated  | <6 kB | Pantheon+-like Type Ia SN μ(z)                    |
| `sparc_galaxies.csv`       | simulated  | <3 kB | SPARC-like rotation curves                        |
| `boss_xi.csv`              | simulated  | <2 kB | BOSS-like ξ(s) with BAO bump                      |
| `gw150914_strain.csv`      | simulated  | <6 kB | LIGO-like strain with chirp                       |

Bundle is well under 20 MB. CMB Mollweide map is generated procedurally
in <code>/src/physics/cmbMap.ts</code>; EHT shadow renders an SVG
placeholder. fetch.md files for both have curl-able URLs to swap to real
imagery.
