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

## File index — Gate 1

| File              | Status | Size  | Source                                            |
|-------------------|--------|-------|---------------------------------------------------|
| `hubble1929.csv`  | real   | <2 kB | Hubble 1929 PNAS, Tables I+II (public domain)     |

Later gates will add the remaining 9 datasets. Bundle total stays under
20 MB per the spec.
