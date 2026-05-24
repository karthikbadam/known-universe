import { Code, Link, Text, VStack } from "@chakra-ui/react";
import { useEffect, useMemo, useState } from "react";
import * as vg from "@uwdata/vgplot";

import { Citation } from "../../../components/Citation";
import { MathBlock, MathInline } from "../../../components/MathBlock";
import { MosaicPlot } from "../../../components/MosaicPlot";
import { ParamSlider } from "../../../components/ParamSlider";
import { PlotError } from "../../../components/PlotError";
import { PlotLegend } from "../../../components/PlotLegend";
import { PlotSection } from "../../../components/PlotSection";
import { RulesInOut } from "../../../components/RulesInOut";

import { TABLES } from "../data/tables";
import { ensureCoordinator } from "../../../mosaic/coordinator";
import { useDataTable } from "../../../mosaic/useDataTable";
import { useParam } from "../../../mosaic/useParam";
import { vgFrame } from "../../../mosaic/vgHelpers";
import { hubbleTimeGyr } from "../physics/friedmann";
import { CHART_HEIGHT } from "../../../theme/chartDimensions";
import { useChartPalette } from "../../../theme/palette";

const MAX_DISTANCE_MPC = 2.2;
const MODEL_GRID_TABLE = "hubble_model_grid";
const MODEL_GRID_POINTS = 45;
const PLOT_HEIGHT = CHART_HEIGHT.standard;
const HUBBLE_1929_H0 = 500;

const COLOR_MODERN = "#ff7a1a";
const COLOR_1929 = "#9aa0a6";


export function HubbleDiagram() {
  const palette = useChartPalette();
  const { ready, error } = useDataTable(
    TABLES.hubble1929.name,
    TABLES.hubble1929.url,
    { skipHeaderLines: TABLES.hubble1929.skipHeaderLines },
  );
  const [gridReady, setGridReady] = useState<boolean>(false);
  const { param: h0, value: h0Value, setValue: setH0 } = useParam(70);

  useEffect(() => {
    if (!ready) return;
    let cancelled = false;
    (async () => {
      try {
        const coord = ensureCoordinator();
        await coord.exec(`
          CREATE TABLE IF NOT EXISTS ${MODEL_GRID_TABLE} AS
          SELECT i * (${MAX_DISTANCE_MPC} / ${MODEL_GRID_POINTS - 1}.0) AS d
          FROM range(0, ${MODEL_GRID_POINTS}) tbl(i)
        `);
        if (!cancelled) setGridReady(true);
      } catch (_e) {
        // Falls under the parent error state.
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [ready]);

  const spec = useMemo(
    () => [
      vg.dot(vg.from(TABLES.hubble1929.name), {
        x: "distance_mpc",
        y: "velocity_km_s",
        r: 4,
        fill: palette.modelStroke,
        stroke: palette.modelStroke,
        strokeWidth: 1,
      }),
      vg.line(vg.from(MODEL_GRID_TABLE), {
        x: "d",
        y: vg.sql`${HUBBLE_1929_H0} * d`,
        stroke: COLOR_1929,
        strokeWidth: 1.5,
        strokeDasharray: "4,3",
      }),
      vg.line(vg.from(MODEL_GRID_TABLE), {
        x: "d",
        y: vg.sql`${h0} * d`,
        stroke: COLOR_MODERN,
        strokeWidth: 2,
      }),
      vg.ruleY([0], { stroke: palette.axisStroke, strokeOpacity: 0.4 }),
      vg.ruleX([0], { stroke: palette.axisStroke, strokeOpacity: 0.4 }),
      ...vgFrame({
        xLabel: "Distance (Mpc) →",
        yLabel: "↑ Recession velocity (km/s)",
        xDomain: [0, MAX_DISTANCE_MPC],
        yDomain: [-400, 1300],
      }),
    ],
    [h0, palette],
  );

  return (
    <PlotSection
      index={1}
      title="Hubble 1929, galaxies are receding"
      question="Are galaxy recession velocities proportional to distance?"
      summary={
        <Text>
          In 1929 Edwin Hubble plotted the distances and recession velocities
          of 24 nearby galaxies and saw that the farther a galaxy was, the
          faster it moved away. Through a noisy cloud of points, a clear
          positive slope: distance tracking velocity. That observation was the
          first direct evidence that the universe is expanding rather than
          static. The question the equation answers is what the slope of that
          line is — the constant of proportionality between distance and
          recession velocity — and what it implies about the universe.
        </Text>
      }
      math={
        <>
          <MathBlock ariaLabel="Hubble's law">{`v = H_0 \\, d`}</MathBlock>
          <Text fontFamily="body" fontSize="sm" lineHeight="1.7">
            <MathInline>{`v`}</MathInline> is the recession velocity in km/s,
            inferred from how far a galaxy's spectral lines are shifted toward
            red (cosmological redshift).{" "}
            <MathInline>{`d`}</MathInline> is the distance to the galaxy in
            megaparsecs, where one megaparsec (Mpc) is about 3.26 million
            light-years. <MathInline>{`H_0`}</MathInline> is the Hubble
            constant in km/s per Mpc, the slope of the relation and the
            current rate of cosmic expansion. On the plot, the x-axis is
            distance in Mpc and the y-axis is recession velocity in km/s.
            Each dot is one of Hubble's 24 galaxies. The solid orange line is
            the model{" "}
            <MathInline>{`v = H_0 \\, d`}</MathInline> at the slider's current{" "}
            <MathInline>{`H_0`}</MathInline>; the grey dashed line shows
            Hubble's original 1929 fit of{" "}
            <MathInline>{`H_0 \\approx 500`}</MathInline> km/s/Mpc. Inverting
            the equation gives a rough age of the universe, the Hubble time{" "}
            <MathInline>{`t_H = 1/H_0`}</MathInline> ≈{" "}
            {hubbleTimeGyr(h0Value).toFixed(2)} billion years at the slider's
            current position.
          </Text>
        </>
      }
      plot={
        error !== null ? (
          <PlotError message={error} />
        ) : (
          <MosaicPlot
            spec={spec}
            enabled={gridReady}
            ariaLabel="Scatter plot of recession velocity vs distance for Hubble's 24 galaxies, with a model line overlaid"
            height={PLOT_HEIGHT}
          />
        )
      }
      legend={
        <PlotLegend
          items={[
            {
              name: "1929 galaxies",
              description: "Hubble's 24 nebulae, distance vs. velocity",
              color: palette.modelStroke,
              mark: "dot",
            },
            {
              name: "Modern H₀",
              description: "Slope from your slider; today's value ≈ 70",
              color: COLOR_MODERN,
              mark: "line",
            },
            {
              name: "Hubble 1929",
              description: "Hubble's own eyeballed fit, H₀ ≈ 500",
              color: COLOR_1929,
              mark: "dashed-line",
            },
          ]}
        />
      }
      controls={
        <VStack align="stretch" gap={6}>
          <ParamSlider
            label="Hubble constant H₀"
            unit="km/s/Mpc"
            description="Slope of the model line. Modern value ≈ 70; Hubble's 1929 fit ≈ 500."
            min={20}
            max={650}
            step={1}
            value={h0Value}
            onChange={setH0}
          />
        </VStack>
      }
      rules={
        <RulesInOut
          rulesIn={[
            "An expanding universe — the linear velocity–distance relation is its signature.",
            "A finite age: 1/H₀ sets an upper bound on the time since expansion began.",
            "A roughly uniform expansion in this small local volume.",
          ]}
          rulesOut={[
            "A static universe (the line would be flat at v ≈ 0).",
            "A contracting universe (the slope would be negative).",
            "Distance scale precision: Hubble's slope is 7× too steep, and the points themselves can't tell you that.",
          ]}
        />
      }
      takeaway={
        <Text>
          Hubble's slope was wrong by about a factor of seven because his
          Cepheid distance calibration was off — Cepheids (pulsating stars
          whose period correlates with their intrinsic luminosity) turned out
          to come in two populations with different brightnesses, a
          distinction unrecognized until the 1950s. Modern{" "}
          <MathInline>{`H_0`}</MathInline> is measured along two independent
          chains. The local distance ladder builds outward step by step:
          trigonometric parallax to nearby stars calibrates Cepheids,
          Cepheid-bearing galaxies calibrate Type Ia supernovae, and
          supernovae extend out to galaxies in the Hubble flow, giving{" "}
          <MathInline>{`H_0 \\approx 73`}</MathInline> km/s/Mpc. The inverse
          ladder starts from the cosmic microwave background — the relic
          radiation released when the universe became transparent ≈380,000
          years after the Big Bang. The sound horizon imprinted at that epoch
          is a known physical length, and the Planck satellite's measurement
          of its angular size fixes{" "}
          <MathInline>{`H_0 \\approx 67`}</MathInline> km/s/Mpc. The two
          methods differ by about 5σ — a difference that current cosmology has
          not yet resolved.
        </Text>
      }
      citation={
        <Citation title="Data source & provenance">
          <Text>
            Real published values from Hubble, E. (1929).{" "}
            <em>
              A Relation Between Distance and Radial Velocity Among
              Extra-Galactic Nebulae
            </em>
            . PNAS, 15(3), 168–173. doi:10.1073/pnas.15.3.168 (public domain).
            Transcribed directly from Tables I + II of the original paper into{" "}
            <Code>/public/data/hubble1929.csv</Code>.
          </Text>
          <Text mt={2}>
            See{" "}
            <Link
              href="https://github.com/karthikbadam/known-universe/blob/main/scripts/fetch/hubble1929.md"
              target="_blank"
              rel="noopener noreferrer"
            >
              /scripts/fetch/hubble1929.md
            </Link>{" "}
            for re-fetch instructions.
          </Text>
        </Citation>
      }
    />
  );
}
