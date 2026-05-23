import { Code, Link, Text } from "@chakra-ui/react";
import * as vg from "@uwdata/vgplot";
import { useMemo } from "react";

import { Citation } from "../../../components/Citation";
import { MathBlock, MathInline } from "../../../components/MathBlock";
import { MosaicPlot } from "../../../components/MosaicPlot";
import { PlotError } from "../../../components/PlotError";
import { PlotSection } from "../../../components/PlotSection";
import { RulesInOut } from "../../../components/RulesInOut";

import { TABLES } from "../data/tables";
import { useDataTable } from "../../../mosaic/useDataTable";
import { CHART_HEIGHT } from "../../../theme/chartDimensions";

const PLOT_HEIGHT = CHART_HEIGHT.standard;
const TEMP_CLIP_UK = 300;

// vgplot 0.26 type defs omit several real runtime functions
// (raster, sql aggregates, several axis/color attributes). Narrow cast
// keeps usage typed without an `any` blowout.
const vgX = vg as unknown as {
  raster: (source: unknown, options: Record<string, unknown>) => unknown;
  max: (col: string) => unknown;
};

export function CMBMap() {
  const { ready, error } = useDataTable(
    TABLES.cmbMollweide.name,
    TABLES.cmbMollweide.url,
    { skipHeaderLines: TABLES.cmbMollweide.skipHeaderLines },
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
      vg.xDomain([-2.05, 2.05]),
      vg.yDomain([-1.05, 1.05]),
      vg.marginLeft(0),
      vg.marginRight(0),
      vg.marginTop(0),
      vg.marginBottom(0),
      (plot: { attributes: Record<string, unknown> }) => {
        plot.attributes.colorScheme = "rdbu";
        plot.attributes.colorDomain = [-TEMP_CLIP_UK, TEMP_CLIP_UK];
        plot.attributes.colorReverse = true;
        plot.attributes.xAxis = null;
        plot.attributes.yAxis = null;
        plot.attributes.aspectRatio = 1;
        plot.attributes.style = "background: transparent;";
      },
    ],
    [],
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
          14 Gyr.
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
          />
        )
      }
      controls={null}
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
            480×240 (x, y) raster and rendered in-browser via Mosaic{" "}
            <Code>vg.raster</Code>. Real source: Planck 2018 results IV, A&amp;A
            641, A4.
          </Text>
          <Text mt={2}>
            The CSV at <Code>/public/data/cmb_mollweide.csv</Code> is produced
            by <Code>/scripts/fetch/cmb_map_to_csv.py</Code> (real Planck FITS
            → CSV via <Code>healpy</Code>) or its placeholder TypeScript twin{" "}
            <Code>/scripts/simulate/cmb_map.ts</Code> (procedural CMB-like
            field for dev). See{" "}
            <Link
              href="https://github.com/karthikbadam/known-universe/blob/main/scripts/fetch/cmb_map.md"
              target="_blank"
              rel="noopener noreferrer"
            >
              /scripts/fetch/cmb_map.md
            </Link>{" "}
            for the Planck FITS fetch procedure.
          </Text>
        </Citation>
      }
    />
  );
}
