# CMB temperature map (Planck SMICA), fetch instructions

## Source

> Planck Collaboration (2020). *Planck 2018 results. IV. Diffuse
> component separation*. A&A 641, A4.
> [doi:10.1051/0004-6361/201833881](https://doi.org/10.1051/0004-6361/201833881)

The famous all-sky temperature map is from the SMICA component-separation
pipeline. We render it in-browser as a Mosaic raster mark; the renderer
reads `/public/data/cmb_mollweide.csv` regardless of whether it was
produced from the real Planck FITS or from the JS placeholder.

## CSV schema

Columns: `x` (Mollweide, −2..2), `y` (Mollweide, −1..1), `t_uk`
(temperature anomaly in microkelvin). Only points inside the Mollweide
ellipse `(x/2)² + y² ≤ 1` are emitted. Grid is 480 × 240.

## Placeholder (no Planck data needed)

```sh
npx tsx scripts/simulate/cmb_map.ts
# → public/data/cmb_mollweide.csv  (procedural CMB-like field, ~1.9 MB)
```

The procedural fallback in `src/modules/cosmology/physics/cmbMap.ts`
generates a CMB-statistics-look-alike field (smooth large-scale blobs +
Gaussian speckle). Suitable for dev and CI; **not** real Planck data.

## Real Planck SMICA (Python)

Download the SMICA HEALPix FITS from the [Planck Legacy Archive](http://pla.esac.esa.int/):

```sh
# COM_CMB_IQU-smica_2048_R3.00_full.fits  (~600 MB)
```

Then:

```sh
pip install healpy numpy astropy
python scripts/fetch/cmb_map_to_csv.py path/to/COM_CMB_IQU-smica_2048_R3.00_full.fits
# → public/data/cmb_mollweide.csv  (real Planck data, same schema)
```

The script downsamples HEALPix from Nside=2048 to Nside=256, projects to
the 480×240 Mollweide grid via `hp.get_interp_val`, and emits the same
CSV the JS placeholder produces. The React component does not care which
script wrote the file.
