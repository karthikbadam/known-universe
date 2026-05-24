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
      question="What does the oldest light in the universe look like, and what causes its tiny temperature variations?"
      summary={
        <Text>
          If you point a sensitive enough radio antenna at any patch of empty
          sky, you find a faint glow — the same temperature, 2.725 K above
          absolute zero, in every direction. This is the cosmic microwave
          background (CMB): relic light emitted when the universe first
          became transparent, about 380,000 years after the Big Bang, and
          stretched by cosmic expansion into microwave wavelengths. The
          temperature is the same to about one part in 100,000 — but those
          tiny variations are not noise. They are the imprint of slight
          density differences in the early universe that, over the next 13.8
          billion years, gravitationally grew into every galaxy, cluster,
          and void.
        </Text>
      }
      math={
        <>
          <MathBlock ariaLabel="CMB spherical harmonic expansion">{`T(\\hat{n}) \\;=\\; \\sum_{\\ell, m} a_{\\ell m} \\, Y_{\\ell m}(\\hat{n}) \\qquad C_\\ell \\;=\\; \\langle |a_{\\ell m}|^2 \\rangle_m`}</MathBlock>
          <Text fontFamily="body" fontSize="sm" lineHeight="1.7">
            <MathInline>{`T(\\hat{n})`}</MathInline> is the CMB temperature in
            the direction <MathInline>{`\\hat{n}`}</MathInline> on the sky,
            after the uniform 2.725 K background and the dipole from our own
            motion have been subtracted. The function is decomposed into
            spherical harmonics <MathInline>{`Y_{\\ell m}(\\hat{n})`}</MathInline>{" "}
            — the natural basis for any field on a sphere, indexed by the
            multipole <MathInline>{`\\ell`}</MathInline> (which sets the
            angular scale ≈ 180°/<MathInline>{`\\ell`}</MathInline>) and the
            azimuthal order <MathInline>{`m`}</MathInline>. The coefficients{" "}
            <MathInline>{`a_{\\ell m}`}</MathInline> carry the strength of
            each mode; the angular power spectrum{" "}
            <MathInline>{`C_\\ell`}</MathInline> is the variance of those
            coefficients across <MathInline>{`m`}</MathInline> at a given{" "}
            <MathInline>{`\\ell`}</MathInline>, and is plotted in the next
            section. On the plot itself, the all-sky map is shown in a
            Mollweide projection — the standard equal-area projection that
            takes the celestial sphere and flattens it into an ellipse. Red
            regions are slightly hotter than the 2.725 K mean (the typical
            excursion is ±100 μK, or 10⁻⁵ of the mean) and blue regions
            slightly cooler. Three landmarks are highlighted: the Cold Spot
            (an anomalously cold ~10° patch), the Galactic Center (residual
            foreground emission from our own galaxy), and the Dipole apex
            (the direction the Sun moves through the CMB rest frame at ~370
            km/s, with that motion already subtracted from the map).
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
            "Anisotropies at the 10⁻⁵ level on top of a uniform 2.725 K background.",
            "Statistical isotropy: no preferred direction beyond known galactic foregrounds.",
            "Adiabatic Gaussian initial conditions — the spotty pattern is consistent with a Gaussian random field.",
          ]}
          rulesOut={[
            "Structure seeded by topological defects (which would imprint a non-Gaussian pattern).",
            "Strong primordial non-Gaussianity (Planck constrains it to <10⁻³ in the standard amplitude parameter).",
            "A steady-state universe with no hot early phase — there would be no thermal background at 2.7 K.",
          ]}
        />
      }
      takeaway={
        <Text>
          What you are looking at is the oldest electromagnetic signal in the
          universe — a photograph of the cosmos at age 380,000 years, taken
          when hot ionized plasma cooled enough for electrons and protons to
          combine into neutral hydrogen and let photons free-stream for the
          first time. Three layers have been stripped from the raw signal:
          the 2.725 K uniform background (which would otherwise dominate any
          contrast scale), the 3.4 mK dipole induced by the Sun's motion
          through the CMB rest frame, and most of the foreground emission
          from our own Galaxy (the SMICA pipeline combines Planck's frequency
          channels to isolate the cosmological component). What remains are
          the 10⁻⁵-level anisotropies — the seed density variations that
          gravitational growth amplified into the present-day cosmic web. The
          next section transforms this map into its angular power spectrum,
          where the geometry of the universe, the matter content, and the
          baryon fraction each leave distinct fingerprints in the heights
          and positions of acoustic peaks.
        </Text>
      }
      citation={
        <Citation title="Data source and provenance">
          <Text>
            Mollweide projection of the Planck 2018 SMICA all-sky temperature
            map, downsampled from the native HEALPix Nside=2048 grid to a
            720×360 (x, y) raster and rendered in-browser via Mosaic{" "}
            <Code>vg.raster</Code>. Source: Planck 2018 results IV, A&amp;A
            641, A4. The CSV at{" "}
            <Code>/public/data/cmb_mollweide.csv</Code> is produced by{" "}
            <Code>/scripts/fetch/cmb_map_to_csv.py</Code> from the SMICA FITS
            via <Code>healpy</Code>.
          </Text>
        </Citation>
      }
    />
  );
}
