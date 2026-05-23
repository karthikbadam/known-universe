import { Box, Code, HStack, Text, VStack } from "@chakra-ui/react";
import * as vg from "@uwdata/vgplot";
import { useMemo, useState } from "react";

import { Citation } from "../../../components/Citation";
import { MathBlock, MathInline } from "../../../components/MathBlock";
import { MosaicPlot } from "../../../components/MosaicPlot";
import { ParamSlider } from "../../../components/ParamSlider";
import { PlotError } from "../../../components/PlotError";
import { PlotSection } from "../../../components/PlotSection";
import { RulesInOut } from "../../../components/RulesInOut";

import { TABLES } from "../data/tables";
import { useDataTable } from "../../../mosaic/useDataTable";
import { CHART_HEIGHT } from "../../../theme/chartDimensions";
import { useChartPalette } from "../../../theme/palette";

const PLOT_HEIGHT = CHART_HEIGHT.standard;

// vgplot 0.26 type defs omit several real runtime functions
// (raster, sql aggregates, several axis/color attributes). Narrow cast
// keeps usage typed without an `any` blowout.
const vgX = vg as unknown as {
  raster: (source: unknown, options: Record<string, unknown>) => unknown;
  max: (col: string) => unknown;
  text: (source: unknown, options: Record<string, unknown>) => unknown;
};

interface Landmark {
  name: string;
  lonDeg: number;
  latDeg: number;
  note: string;
}

const LANDMARKS: ReadonlyArray<Landmark> = [
  {
    name: "Cold Spot",
    lonDeg: 209,
    latDeg: -57,
    note: "Anomalously cold ~10° patch, ~70 μK colder than the mean. One of the most discussed CMB anomalies.",
  },
  {
    name: "Galactic Center",
    lonDeg: 0,
    latDeg: 0,
    note: "Brightest residual foreground; SMICA cleans most of the disk but the Galactic plane stripe is still visible.",
  },
  {
    name: "Dipole apex",
    lonDeg: 264,
    latDeg: 48,
    note: "Direction of the Sun's motion through the CMB rest frame (~370 km/s). The dipole signal itself is subtracted from this map.",
  },
  {
    name: "N. Galactic Pole",
    lonDeg: 0,
    latDeg: 90,
    note: "Cleanest sky for cosmological measurements; least Galactic contamination.",
  },
];

function mollweideForward(
  lonDeg: number,
  latDeg: number,
): { x: number; y: number } {
  if (Math.abs(latDeg) > 89.99) {
    return { x: 0, y: Math.sign(latDeg) };
  }
  let lon = lonDeg;
  while (lon > 180) lon -= 360;
  while (lon < -180) lon += 360;
  const lat = (latDeg * Math.PI) / 180;
  const lonRad = (lon * Math.PI) / 180;
  let theta = lat;
  for (let i = 0; i < 8; i++) {
    const f = 2 * theta + Math.sin(2 * theta) - Math.PI * Math.sin(lat);
    const fp = 2 + 2 * Math.cos(2 * theta);
    theta -= f / fp;
  }
  return {
    x: (2 / Math.PI) * lonRad * Math.cos(theta),
    y: Math.sin(theta),
  };
}

interface ProjectedLandmark extends Landmark {
  x: number;
  y: number;
}

export function CMBMap() {
  const palette = useChartPalette();
  const { ready, error } = useDataTable(
    TABLES.cmbMollweide.name,
    TABLES.cmbMollweide.url,
    { skipHeaderLines: TABLES.cmbMollweide.skipHeaderLines },
  );

  const [tempClipUK, setTempClipUK] = useState<number>(300);

  const projectedLandmarks = useMemo<ProjectedLandmark[]>(
    () =>
      LANDMARKS.map((lm) => ({
        ...lm,
        ...mollweideForward(lm.lonDeg, lm.latDeg),
      })),
    [],
  );

  const spec = useMemo(
    () => [
      vgX.raster(vg.from(TABLES.cmbMollweide.name), {
        x: "x",
        y: "y",
        fill: vgX.max("t_uk"),
        interpolate: "none",
        pixelSize: 1,
      }),
      vg.dot(projectedLandmarks, {
        x: "x",
        y: "y",
        r: 8,
        fill: "transparent",
        stroke: palette.modelStroke,
        strokeWidth: 1.5,
        title: "name",
      }),
      vgX.text(projectedLandmarks, {
        x: "x",
        y: "y",
        text: "name",
        dy: -14,
        fill: palette.modelStroke,
        fontSize: 11,
        fontWeight: 500,
      }),
      vg.xDomain([-2.05, 2.05]),
      vg.yDomain([-1.15, 1.15]),
      vg.marginLeft(0),
      vg.marginRight(0),
      vg.marginTop(0),
      vg.marginBottom(0),
      (plot: { attributes: Record<string, unknown> }) => {
        plot.attributes.colorScale = "diverging";
        plot.attributes.colorRange = [
          "#3b82f6",
          palette.background,
          "#ef4444",
        ];
        plot.attributes.colorPivot = 0;
        plot.attributes.colorDomain = [-tempClipUK, tempClipUK];
        plot.attributes.xAxis = null;
        plot.attributes.yAxis = null;
        plot.attributes.aspectRatio = 1;
        plot.attributes.style = "background: transparent;";
      },
    ],
    [tempClipUK, projectedLandmarks, palette],
  );

  return (
    <PlotSection
      index={3}
      title="CMB map: the photograph of the early universe"
      question="What does the sky look like at 2.725 K, and what are those red and blue patches?"
      summary={
        <Text>
          A Mollweide projection of the cosmic microwave background (CMB),
          with the mean temperature and dipole removed. Red regions are
          slightly hotter than 2.725 K, blue slightly cooler; the typical
          anisotropy is ~100 μK on top of the 2.7 K mean. These tiny ripples
          are the seeds of every galaxy you've ever heard of: gravitational
          growth from these initial overdensities built the cosmic web over
          14 Gyr. A few famous spots are marked, hover for details.
        </Text>
      }
      math={
        <>
          <MathBlock ariaLabel="CMB spherical harmonic expansion">{`T(\\hat{n}) \\;=\\; \\sum_{\\ell, m} a_{\\ell m} \\, Y_{\\ell m}(\\hat{n}) \\qquad C_\\ell \\;=\\; \\langle |a_{\\ell m}|^2 \\rangle_m`}</MathBlock>
          <Text fontFamily="body" fontSize="sm" lineHeight="1.7">
            <MathInline>{`Y_{\\ell m}`}</MathInline> are spherical harmonics;
            the variance of the <MathInline>{`a_{\\ell m}`}</MathInline>{" "}
            coefficients is the angular power spectrum{" "}
            <MathInline>{`C_\\ell`}</MathInline> plotted in the next section.
          </Text>
        </>
      }
      plot={
        error !== null ? (
          <PlotError message={error} />
        ) : (
          <MosaicPlot
            spec={spec}
            enabled={ready}
            ariaLabel="Planck SMICA CMB temperature anomaly, Mollweide projection"
            height={PLOT_HEIGHT}
            aspectRatio={2}
          />
        )
      }
      controls={
        <VStack align="stretch" gap={5}>
          <ParamSlider
            label="Temperature scale"
            unit="±μK"
            description="Clip the diverging colormap. Lower values bring out faint anisotropies; higher values let the Galactic plane saturate."
            min={50}
            max={500}
            step={10}
            value={tempClipUK}
            onChange={setTempClipUK}
          />
          <Box>
            <Text
              fontFamily="heading"
              fontSize="xs"
              fontWeight="medium"
              color="fg.subtle"
              letterSpacing="0.08em"
              textTransform="uppercase"
              mb={2}
            >
              Landmarks
            </Text>
            <VStack align="stretch" gap={2}>
              {LANDMARKS.map((lm) => (
                <HStack key={lm.name} align="flex-start" gap={2}>
                  <Box
                    w="8px"
                    h="8px"
                    mt="6px"
                    borderRadius="full"
                    borderWidth="1.5px"
                    borderColor="fg"
                    flexShrink={0}
                  />
                  <Box>
                    <Text fontFamily="mono" fontSize="xs" color="fg">
                      {lm.name}
                    </Text>
                    <Text fontFamily="body" fontSize="xs" color="fg.muted" lineHeight="1.4">
                      {lm.note}
                    </Text>
                  </Box>
                </HStack>
              ))}
            </VStack>
          </Box>
        </VStack>
      }
      rules={
        <RulesInOut
          rulesIn={[
            "Anisotropies at the 10⁻⁵ level on top of a 2.725 K monopole.",
            "Statistical isotropy (no preferred direction beyond known foregrounds).",
            "Adiabatic Gaussian initial conditions (the speckle is consistent with a Gaussian random field).",
          ]}
          rulesOut={[
            "Topological-defect-seeded structure formation (pattern would be non-Gaussian).",
            "Strong non-Gaussianity (limits from Planck < ~10⁻³ for f_NL).",
            "A simple steady-state universe (would have no thermal background at 2.7 K).",
          ]}
        />
      }
      citation={
        <Citation title="Data source and provenance">
          <Text>
            Mollweide projection of the Planck 2018 SMICA all-sky temperature
            map, downsampled from the native HEALPix Nside=2048 grid to a
            720×360 (x, y) raster and rendered in-browser via Mosaic{" "}
            <Code>vg.raster</Code>. Real source: Planck 2018 results IV,
            A&amp;A 641, A4. The CSV at{" "}
            <Code>/public/data/cmb_mollweide.csv</Code> is produced by{" "}
            <Code>/scripts/fetch/cmb_map_to_csv.py</Code> from the SMICA FITS
            via <Code>healpy</Code>.
          </Text>
        </Citation>
      }
    />
  );
}
