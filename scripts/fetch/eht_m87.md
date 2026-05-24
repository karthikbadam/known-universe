# EHT M87* image, fetch instructions

## Source

> Event Horizon Telescope Collaboration et al. (2019). *First M87 Event
> Horizon Telescope Results. I. The Shadow of the Supermassive Black
> Hole*. ApJL 875, L1.
> [doi:10.3847/2041-8213/ab0ec7](https://doi.org/10.3847/2041-8213/ab0ec7)

The 2019 reconstruction of M87*. The React component reads the data
through the same Mosaic + DuckDB-WASM pipeline as the CMB section.

## CSV schema

Columns: `x_uas`, `y_uas` (angular offsets in microarcseconds, centered
on the source), `intensity` (normalized to peak = 1). 200 × 200 grid
covering a 100 μas field of view.

## Default (transcoded ESO press release)

The published image, available from ESO without authentication, is
the actual EHT reconstruction rendered through an `afmhot` colormap
and shipped as JPG. Same intensity field as the published FITS, just
lossy-compressed and 8-bit.

```sh
curl -fL -o /tmp/eso_eht_m87.jpg \
  https://cdn.eso.org/images/large/eso1907a.jpg
python scripts/fetch/eht_m87_to_csv.py /tmp/eso_eht_m87.jpg
# → public/data/eht_m87.csv  (real EHT data, ~850 KB)
```

The Python script crops the ESO image to its centered square, takes
the max of the RGB channels as the intensity proxy (well-defined for
an `afmhot`-style monochromatic colormap), downsamples to 200×200, and
writes the CSV with proper provenance headers.

## Upgrade to a true FITS

For a fully float-32, lossless intensity field, run one of the EHT
imaging pipelines locally on the released visibility data:

```sh
# Get the uvfits and pipeline code:
git clone https://github.com/eventhorizontelescope/2019-D01-02
cd 2019-D01-02
./run.sh   # downloads uvfits + runs DIFMAP / eht-imaging / SMILI
```

This requires installing `ehtim`, `astropy`, `scipy`, and friends, and
runs for several minutes. The output is a per-day reconstructed image
FITS that can be fed to the same `eht_m87_to_csv.py` script — pass
the `.fits` path instead of the JPG and the script reads the WCS for
the angular scale:

```sh
python scripts/fetch/eht_m87_to_csv.py path/to/m87_image.fits
```

The CSV schema is identical so the React component doesn't change.
