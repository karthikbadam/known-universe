import {
  Box,
  Code,
  Link,
  Stack,
  Text,
  useToken,
} from "@chakra-ui/react";
import { useEffect, useRef, useState } from "react";
import * as vg from "@uwdata/vgplot";

import { Citation } from "../components/Citation";
import { MathBlock, MathInline } from "../components/MathBlock";
import { ParamSlider } from "../components/ParamSlider";
import { PlotSection } from "../components/PlotSection";
import { RulesInOut } from "../components/RulesInOut";
import { type DataStatus } from "../components/DataStatusBadge";

import { HUBBLE_1929_TABLE, loadHubble1929 } from "../data/loaders";
import { ensureCoordinator } from "../mosaic/coordinator";
import { useParam } from "../mosaic/useParam";
import { hubbleTimeGyr } from "../physics/friedmann";

// dataStatus: "real" because /public/data/hubble1929.csv is transcribed
// directly from Hubble (1929) Tables I+II. To regenerate as simulated,
// run `npm run simulate:hubble` and flip this to "simulated".
// See /scripts/fetch/hubble1929.md for the swap procedure.
const dataStatus: DataStatus = "real";

const MAX_DISTANCE_MPC = 2.2;
const MODEL_GRID_TABLE = "hubble_model_grid";

export function HubbleDiagram(): JSX.Element {
  const plotRef = useRef<HTMLDivElement | null>(null);
  const [ready, setReady] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const { param: h0, value: h0Value, setValue: setH0 } = useParam(70);

  const [navy50, navy400, gold300, gold400] = useToken("colors", [
    "navy.50",
    "navy.400",
    "gold.300",
    "gold.400",
  ]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const coord = ensureCoordinator();
        await loadHubble1929();
        await coord.exec(`
          CREATE TABLE IF NOT EXISTS ${MODEL_GRID_TABLE} AS
          SELECT i * (${MAX_DISTANCE_MPC} / 44.0) AS d
          FROM range(0, 45) tbl(i)
        `);
        if (!cancelled) setReady(true);
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : String(e));
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!ready || plotRef.current === null) return;

    const element = vg.plot(
      vg.dot(vg.from(HUBBLE_1929_TABLE), {
        x: "distance_mpc",
        y: "velocity_km_s",
        r: 4,
        fill: gold300,
        stroke: gold400,
        strokeWidth: 1,
      }),
      vg.line(vg.from(MODEL_GRID_TABLE), {
        x: "d",
        y: vg.sql`${h0} * d`,
        stroke: navy50,
        strokeWidth: 2,
      }),
      vg.ruleY([0], { stroke: navy400, strokeOpacity: 0.4 }),
      vg.ruleX([0], { stroke: navy400, strokeOpacity: 0.4 }),
      vg.xLabel("Distance (Mpc) →"),
      vg.yLabel("↑ Recession velocity (km/s)"),
      vg.xDomain([0, MAX_DISTANCE_MPC]),
      vg.yDomain([-400, 1300]),
      vg.width(720),
      vg.height(440),
      vg.marginLeft(60),
      vg.marginBottom(50),
    );

    const host = plotRef.current;
    host.replaceChildren(element as Node);

    return () => {
      host.replaceChildren();
    };
  }, [ready, h0, gold300, gold400, navy50, navy400]);

  return (
    <PlotSection
      index={1}
      title="Hubble 1929 — galaxies are receding"
      question="Are galaxy recession velocities proportional to distance?"
      dataStatus={dataStatus}
      summary={
        <Text>
          Hubble's 24 galaxies show velocity rising roughly linearly with
          distance. That single line — fitted by eye to a noisy cloud —
          is the first evidence that the universe is expanding. The slope is
          the Hubble constant <MathInline>{`H_0`}</MathInline>.
          Drag the slider to see why Hubble himself read off{" "}
          <MathInline>{`H_0 \\approx 500`}</MathInline> km/s/Mpc (a distance
          scale wrong by a factor of seven — the modern value sits near 70).
        </Text>
      }
      math={
        <>
          <MathBlock ariaLabel="Hubble's law">
            {`v = H_0 \\, d`}
          </MathBlock>
          <Text fontSize="sm" color="navy.200">
            <MathInline>{`v`}</MathInline> is recession velocity (km/s),{" "}
            <MathInline>{`d`}</MathInline> is distance (Mpc),{" "}
            <MathInline>{`H_0`}</MathInline> is the Hubble constant in
            km/s/Mpc. Inverting it gives a rough age of the universe — the
            Hubble time{" "}
            <MathInline>{`t_H = 1/H_0`}</MathInline> ≈ {hubbleTimeGyr(h0Value).toFixed(2)} Gyr
            for your current slider position.
          </Text>
        </>
      }
      plot={
        error !== null ? (
          <Box color="red.300" p={4}>
            <Text fontWeight="bold">Plot failed to initialize</Text>
            <Code mt={2} display="block" whiteSpace="pre-wrap" bg="navy.800">
              {error}
            </Code>
          </Box>
        ) : (
          <Box
            ref={plotRef}
            w="100%"
            overflowX="auto"
            sx={{ "& > .plot": { mx: "auto" } }}
            minH="440px"
            aria-label="Scatter plot of recession velocity vs distance for Hubble's 24 galaxies, with a model line overlaid"
            role="img"
          />
        )
      }
      controls={
        <Stack
          direction={{ base: "column", md: "row" }}
          spacing={6}
          align="stretch"
        >
          <Box flex="1">
            <ParamSlider
              label="Hubble constant H₀"
              unit="km/s/Mpc"
              description={`Slope of the model line. Modern value ≈ 70; Hubble's 1929 fit ≈ 500.`}
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
            "An expanding universe — the linear v–d relation is its signature.",
            "A finite age: 1/H₀ sets an upper bound on the time since expansion began.",
            "A roughly uniform expansion in this small local volume.",
          ]}
          rulesOut={[
            "A static universe (the line would be flat at v ≈ 0).",
            "A contracting universe (the slope would be negative).",
            "Distance scale precision: Hubble's slope is 7× too steep — the points themselves can't tell you that.",
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
            Transcribed directly from Tables I + II of the original paper into{" "}
            <Code>/public/data/hubble1929.csv</Code>.
          </Text>
          <Text mt={2}>
            See{" "}
            <Link
              href="https://github.com/karthikbadam/known-universe/blob/feat/cosmology-clean/scripts/fetch/hubble1929.md"
              isExternal
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
