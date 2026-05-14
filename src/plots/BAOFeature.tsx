import { Code, Link, Stack, Text } from "@chakra-ui/react";
import { useMemo, useState } from "react";
import * as vg from "@uwdata/vgplot";

import { Citation } from "../components/Citation";
import { MathBlock, MathInline } from "../components/MathBlock";
import { MosaicPlot } from "../components/MosaicPlot";
import { ParamSlider } from "../components/ParamSlider";
import { PlotError } from "../components/PlotError";
import { PlotSection } from "../components/PlotSection";
import { RulesInOut } from "../components/RulesInOut";
import { type DataStatus } from "../components/DataStatusBadge";

import { TABLES } from "../data/loaders";
import { useDataTable } from "../mosaic/useDataTable";
import { SOUND_HORIZON_FIDUCIAL_MPC, baoCurve } from "../physics/bao";
import { chartPalette } from "../theme/palette";

const dataStatus: DataStatus = "simulated";

export function BAOFeature(): JSX.Element {
  const { ready, error } = useDataTable(
    TABLES.bossXi.name,
    TABLES.bossXi.url,
    { skipHeaderLines: TABLES.bossXi.skipHeaderLines },
  );
  const [rd, setRd] = useState<number>(SOUND_HORIZON_FIDUCIAL_MPC);

  const modelCurve = useMemo(
    () => baoCurve(rd, { sMinMpc: 50, sMaxMpc: 200, samples: 400 }),
    [rd],
  );

  const spec = useMemo(
    () => [
      vg.ruleX(vg.from(TABLES.bossXi.name), {
        x: "s_mpc",
        y1: "xi_lower",
        y2: "xi_upper",
        stroke: chartPalette.errorStroke,
        strokeWidth: 1.2,
        strokeOpacity: 0.7,
      }),
      vg.dot(vg.from(TABLES.bossXi.name), {
        x: "s_mpc",
        y: "xi",
        r: 4,
        fill: chartPalette.dataFill,
        stroke: chartPalette.dataStroke,
      }),
      vg.line(modelCurve.map((row) => ({ s: row.s, xi: row.xi })), {
        x: "s",
        y: "xi",
        stroke: chartPalette.modelStroke,
        strokeWidth: 2,
      }),
      vg.ruleX([{ x: rd }], {
        x: "x",
        stroke: chartPalette.highlightStroke,
        strokeWidth: 1.2,
        strokeDasharray: "4,3",
        strokeOpacity: 0.7,
      }),
      vg.ruleY([0], { stroke: chartPalette.axisStroke, strokeOpacity: 0.4 }),
      vg.xLabel("Separation s (Mpc) →"),
      vg.yLabel("↑ ξ(s)"),
      vg.xDomain([50, 200]),
      vg.yDomain([-0.001, 0.012]),
      vg.width(820),
      vg.height(440),
      vg.marginLeft(75),
      vg.marginBottom(50),
    ],
    [modelCurve, rd],
  );

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
          <PlotError message={error} />
        ) : (
          <MosaicPlot
            spec={spec}
            enabled={ready}
            ariaLabel="BAO correlation function with a bump near 150 Mpc"
            minHeight="440px"
          />
        )
      }
      controls={
        <Stack direction={{ base: "column", md: "row" }} spacing={6}>
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
            generated by <Code>scripts/simulate/bao.ts</Code> from the model in{" "}
            <Code>src/physics/bao.ts</Code>. Real source: Alam et al. (2017)
            MNRAS 470, 2617; doi:10.1093/mnras/stx721.{" "}
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
