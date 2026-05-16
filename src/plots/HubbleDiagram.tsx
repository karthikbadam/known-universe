import { Box, Code, Link, Stack, Text } from "@chakra-ui/react";
import { useEffect, useMemo, useState } from "react";
import * as vg from "@uwdata/vgplot";

import { Citation } from "../components/Citation";
import { MathBlock, MathInline } from "../components/MathBlock";
import { MosaicPlot } from "../components/MosaicPlot";
import { ParamSlider } from "../components/ParamSlider";
import { PlotError } from "../components/PlotError";
import { PlotSection } from "../components/PlotSection";
import { RulesInOut } from "../components/RulesInOut";

import { TABLES } from "../data/loaders";
import { ensureCoordinator } from "../mosaic/coordinator";
import { useDataTable } from "../mosaic/useDataTable";
import { useParam } from "../mosaic/useParam";
import { vgFrame } from "../mosaic/vgHelpers";
import { hubbleTimeGyr } from "../physics/friedmann";
import { CHART_HEIGHT } from "../theme/chartDimensions";
import { useChartPalette } from "../theme/palette";


const MAX_DISTANCE_MPC = 2.2;
const MODEL_GRID_TABLE = "hubble_model_grid";
const MODEL_GRID_POINTS = 45;
const PLOT_HEIGHT = CHART_HEIGHT.standard;

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
        fill: palette.dataFill,
        stroke: palette.dataStroke,
        strokeWidth: 1,
      }),
      vg.line(vg.from(MODEL_GRID_TABLE), {
        x: "d",
        y: vg.sql`${h0} * d`,
        stroke: palette.modelStroke,
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
          Hubble's 24 galaxies show velocity rising roughly linearly with
          distance. That single line, fitted by eye to a noisy cloud,           is the first evidence that the universe is expanding. The slope is
          the Hubble constant <MathInline>{`H_0`}</MathInline>.
          Drag the slider to see why Hubble himself read off{" "}
          <MathInline>{`H_0 \\approx 500`}</MathInline> km/s/Mpc (a distance
          scale wrong by a factor of seven, the modern value sits near 70).
        </Text>
      }
      math={
        <>
          <MathBlock ariaLabel="Hubble's law">{`v = H_0 \\, d`}</MathBlock>
          <Text fontFamily="body" fontSize="sm" color="fg.muted" lineHeight="1.7">
            <MathInline>{`v`}</MathInline> is recession velocity (km/s),{" "}
            <MathInline>{`d`}</MathInline> is distance (Mpc),{" "}
            <MathInline>{`H_0`}</MathInline> is the Hubble constant in
            km/s/Mpc. Inverting it gives a rough age of the universe, the
            Hubble time{" "}
            <MathInline>{`t_H = 1/H_0`}</MathInline> ≈{" "}
            {hubbleTimeGyr(h0Value).toFixed(2)} Gyr for your current slider
            position.
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
      controls={
        <Stack direction={{ base: "column", md: "row" }} gap={6} align="stretch">
          <Box flex="1">
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
          </Box>
        </Stack>
      }
      rules={
        <RulesInOut
          rulesIn={[
            "An expanding universe, the linear v–d relation is its signature.",
            "A finite age: 1/H₀ sets an upper bound on the time since expansion began.",
            "A roughly uniform expansion in this small local volume.",
          ]}
          rulesOut={[
            "A static universe (the line would be flat at v ≈ 0).",
            "A contracting universe (the slope would be negative).",
            "Distance scale precision: Hubble's slope is 7× too steep, the points themselves can't tell you that.",
          ]}
        />
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
            Transcribed directly from Tables I + II of the original paper
            into <Code>/public/data/hubble1929.csv</Code>.
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
            for re-fetch instructions. A simulated fallback is available via{" "}
            <Code>npm run simulate:hubble</Code>.
          </Text>
        </Citation>
      }
    />
  );
}
