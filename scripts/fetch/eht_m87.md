# EHT M87* shadow image — fetch instructions

## Source

> Event Horizon Telescope Collaboration et al. (2019). *First M87 Event
> Horizon Telescope Results. I. The Shadow of the Supermassive Black
> Hole*. ApJ 875, L1.
> [doi:10.3847/2041-8213/ab0ec7](https://doi.org/10.3847/2041-8213/ab0ec7)

The iconic April 2019 image is hosted by ESO:

```sh
curl -fL -o public/data/eht_m87.png \
  https://www.eso.org/public/archives/images/screen/eso1907a.jpg
# Or the original FITS data from
# https://eventhorizontelescope.org/for-astronomers/data
```

Save as `/public/data/eht_m87.png`. The plot overlays a predicted
shadow circle (5.2 R_s) computed from the sliders; the image itself
is decorative.

## Quantities used in the plot

- Apparent diameter measured by EHT: 42 ± 3 μas
- Distance to M87: 16.8 ± 0.7 Mpc
- Inferred mass: (6.5 ± 0.7) × 10⁹ M_☉

## Flip the UI

```ts
const dataStatus: DataStatus = "simulated";  // → "real" if you save the image
```

In `/src/plots/EHTShadow.tsx`.

The current build ships an SVG-rendered placeholder (a black disk with
a warm-coloured photon ring) since the network fetch is unavailable in
the build environment. Replace `eht_m87.png` with the real ESO image
to ship the actual EHT data.
