import { Box, Code, Link, Stack, Text } from "@chakra-ui/react";
import { useEffect, useMemo, useRef, useState } from "react";
import * as vg from "@uwdata/vgplot";

import { Citation } from "../components/Citation";
import { MathBlock, MathInline } from "../components/MathBlock";
import { ParamSlider } from "../components/ParamSlider";
import { PlotSection } from "../components/PlotSection";
import { RulesInOut } from "../components/RulesInOut";
import { type DataStatus } from "../components/DataStatusBadge";

import { ensureCoordinator, loadTable } from "../mosaic/coordinator";
import {
  SOUND_HORIZON_FIDUCIAL_MPC,
  baoCurve,
} from "../physics/bao";

const dataStatus: DataStatus = "simulated";
const BOSS_TABLE = "boss_xi";

export function BAOFeature(): JSX.Element {
  const plotRef = useRef<HTMLDivElement | null>(null);
  const [ready, setReady] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [rd, setRd] = useState<number>(SOUND_HORIZON_FIDUCIAL_MPC);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        ensureCoordinator();
        await loadTable(BOSS_TABLE, "/data/boss_xi.csv", { skipHeaderLines: 6 });
        if (!cancelled) setReady(true);
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : String(e));
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const modelCurve = useMemo(() => baoCurve(rd, { sMinMpc: 50, sMaxMpc: 200, samples: 400 }), [rd]);

  useEffect(() => {
    if (!ready || plotRef.current === null) return;
    const modelData = modelCurve.map((row) => ({ s: row.s, xi: row.xi }));
    const element = vg.plot(
      vg.ruleX(vg.from(BOSS_TABLE), {
        x: "s_mpc",
        y1: "xi_lower",
        y2: "xi_upper",
        stroke: "#a3b3d2",
        strokeWidth: 1.2,
        strokeOpacity: 0.7,
      }),
      vg.dot(vg.from(BOSS_TABLE), {
        x: "s_mpc",
        y: "xi",
        r: 4,
        fill: "#f1c156",
        stroke: "#e8ad2a",
      }),
      vg.line(modelData, { x: "s", y: "xi", stroke: "#e9eef7", strokeWidth: 2 }),
      vg.ruleX([{ x: rd }], {
        x: "x",
        stroke: "#e8ad2a",
        strokeWidth: 1.2,
        strokeDasharray: "4,3",
        strokeOpacity: 0.7,
      }),
      vg.ruleY([0], { stroke: "#5a72ac", strokeOpacity: 0.4 }),
      vg.xLabel("Separation s (Mpc) →"),
      vg.yLabel("↑ ξ(s)"),
      vg.xDomain([50, 200]),
      vg.yDomain([-0.001, 0.012]),
      vg.width(820),
      vg.height(440),
      vg.marginLeft(75),
      vg.marginBottom(50),
    );
    const host = plotRef.current;
    host.replaceChildren(element as Node);
    return () => {
      host.replaceChildren();
    };
  }, [ready, modelCurve, rd]);

  return (
    <PlotSection
      index={7}
      title="BAO — the universe's standard ruler"
      question="Why is there a 150 Mpc bump in galaxy correlations?"
      dataStatus={dataStatus}
      summary={
        <Text>
          Before recombination, sound waves rippled through the photon-baryon
          plasma. At decoupling these waves froze in place at a comoving radius
          r_d ≈ 150 Mpc. Galaxies are slightly more likely to sit at that
          separation than at neighbouring scales — a feature you can measure
          today by counting pairs. The bump shifts left or right with r_d,
          giving an independent geometric ruler on the expansion history.
        </Text>
      }
      math={
        <>
          <MathBlock ariaLabel="comoving distance integral">
            {`r_d \\;=\\; \\int_{z_{\\rm drag}}^{\\infty} \\frac{c_s(z)}{H(z)} \\, dz`}
          </MathBlock>
          <Text fontSize="sm" color="navy.200">
            <MathInline>{`c_s`}</MathInline> is the photon-baryon plasma sound
            speed; <MathInline>{`H(z)`}</MathInline> the Hubble rate. The
            integral gives the sound horizon at the drag epoch (z ≈ 1060). At
            late times it appears as the dashed vertical guide moving with the
            slider.
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
            aria-label="BAO correlation function with a bump near 150 Mpc"
            role="img"
          />
        )
      }
      controls={
        <Stack direction={{ base: "column", md: "row" }} spacing={6}>
          <Box flex="1">
            <ParamSlider
              label="Sound horizon r_d"
              unit="Mpc"
              description="Where the BAO bump sits. Planck prefers ~147.8 Mpc; varying it slides the dashed guide and theory curve."
              min={120}
              max={180}
              step={0.5}
              value={rd}
              onChange={setRd}
            />
          </Box>
        </Stack>
      }
      rules={
        <RulesInOut
          rulesIn={[
            "A standard ruler at 150 Mpc, independent of CMB → low-z cross-check.",
            "Early-universe baryon-photon coupling — same plasma that made the CMB peaks.",
          ]}
          rulesOut={[
            "Pure dark-matter universes with no baryon-acoustic phase.",
            "Featureless ΛCDM-without-baryons correlation functions.",
          ]}
        />
      }
      citation={
        <Citation title="Data source & provenance">
          <Text>
            Simulated BOSS DR12-like ξ(s) (30 bins, s ∈ [50, 200] Mpc),
            generated by <Code>scripts/simulate/bao.ts</Code> from the model
            in <Code>src/physics/bao.ts</Code>. Real source: Alam et al.
            (2017) MNRAS 470, 2617; doi:10.1093/mnras/stx721.{" "}
            <Link
              href="https://github.com/karthikbadam/known-universe/blob/main/scripts/fetch/bao.md"
              isExternal
            >
              fetch.md
            </Link>{" "}
            has the BOSS data URL.
          </Text>
        </Citation>
      }
    />
  );
}
