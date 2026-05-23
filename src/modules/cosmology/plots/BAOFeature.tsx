import { Link, Stack, Text } from "@chakra-ui/react";
import { useMemo, useState } from "react";
import * as vg from "@uwdata/vgplot";

import { Citation } from "../../../components/Citation";
import { MathBlock, MathInline } from "../../../components/MathBlock";
import { MosaicPlot } from "../../../components/MosaicPlot";
import { ParamSlider } from "../../../components/ParamSlider";
import { PlotError } from "../../../components/PlotError";
import { PlotSection } from "../../../components/PlotSection";
import { RulesInOut } from "../../../components/RulesInOut";

import { TABLES } from "../data/tables";
import { useDataTable } from "../../../mosaic/useDataTable";
import { vgFrame } from "../../../mosaic/vgHelpers";
import { SOUND_HORIZON_FIDUCIAL_MPC, baoCurve } from "../physics/bao";
import { CHART_HEIGHT } from "../../../theme/chartDimensions";
import { useChartPalette } from "../../../theme/palette";

const PLOT_HEIGHT = CHART_HEIGHT.standard;

export function BAOFeature() {
  const palette = useChartPalette();
  const { ready, error } = useDataTable(TABLES.bossXi.name, TABLES.bossXi.url, { skipHeaderLines: TABLES.bossXi.skipHeaderLines });
  const [rd, setRd] = useState<number>(SOUND_HORIZON_FIDUCIAL_MPC);
  const modelCurve = useMemo(
    () => baoCurve(rd, { sMinMpc: 50, sMaxMpc: 200, samples: 400 }).map((row) => ({ s: row.s, xi: row.xi })),
    [rd],
  );
  const spec = useMemo(() => [
    vg.ruleX(vg.from(TABLES.bossXi.name), { x: "s_mpc", y1: "xi_lower", y2: "xi_upper", stroke: palette.errorStroke, strokeWidth: 1.2, strokeOpacity: 0.7 }),
    vg.dot(vg.from(TABLES.bossXi.name), { x: "s_mpc", y: "xi", r: 4, fill: palette.dataFill, stroke: palette.dataStroke }),
    vg.line(modelCurve, { x: "s", y: "xi", stroke: palette.modelStroke, strokeWidth: 2 }),
    vg.ruleX([{ x: rd }], { x: "x", stroke: palette.highlightStroke, strokeWidth: 1.2, strokeDasharray: "4,3", strokeOpacity: 0.7 }),
    vg.ruleY([0], { stroke: palette.axisStroke, strokeOpacity: 0.4 }),
    ...vgFrame({
      xLabel: "Separation s (Mpc) →",
      yLabel: "↑ ξ(s)",
      xDomain: [50, 200],
      yDomain: [-0.001, 0.012],
      margins: { left: 90 },
    }),
  ], [modelCurve, rd, palette]);

  return (
    <PlotSection
      index={7}
      title="BAO, the universe's standard ruler"
      question="Why is there a 150 Mpc bump in galaxy correlations?"
      summary={<Text>Before recombination, sound waves rippled through the photon-baryon plasma, baryon acoustic oscillations (BAO). At decoupling these waves froze in place at a comoving radius r_d ≈ 150 Mpc. Galaxies are slightly more likely to sit at that separation than at neighbouring scales, a feature you can measure today by counting pairs. The bump shifts left or right with r_d, giving an independent geometric ruler on the expansion history.</Text>}
      math={<>
        <MathBlock ariaLabel="comoving distance integral">{`r_d \\;=\\; \\int_{z_{\\rm drag}}^{\\infty} \\frac{c_s(z)}{H(z)} \\, dz`}</MathBlock>
        <Text fontFamily="body" fontSize="sm" lineHeight="1.7"><MathInline>{`c_s`}</MathInline> is the photon-baryon plasma sound speed; <MathInline>{`H(z)`}</MathInline> the Hubble rate. The integral gives the sound horizon at the drag epoch (z ≈ 1060). At late times it appears as the dashed vertical guide moving with the slider.</Text>
      </>}
      plot={error !== null ? <PlotError message={error} /> : <MosaicPlot spec={spec} enabled={ready} ariaLabel="BAO correlation function with a bump near 150 Mpc" height={PLOT_HEIGHT} />}
      controls={
        <Stack direction={{ base: "column", md: "row" }} gap={6}>
          <ParamSlider label="Sound horizon r_d" unit="Mpc" description="Where the BAO bump sits. Planck prefers ~147.8 Mpc; varying it slides the dashed guide and theory curve." min={120} max={180} step={0.5} value={rd} onChange={setRd} />
        </Stack>
      }
      rules={<RulesInOut rulesIn={["A standard ruler at 150 Mpc, independent of CMB → low-z cross-check.", "Early-universe baryon-photon coupling, same plasma that made the CMB peaks."]} rulesOut={["Pure dark-matter universes with no baryon-acoustic phase.", "Featureless ΛCDM-without-baryons correlation functions."]} />}
      citation={<Citation title="Data source & provenance"><Text>BOSS DR12 post-reconstruction ξ(s) monopole (Ross et al. 2016, high-z CMASS bin), converted from Mpc/h to Mpc with h = 0.676 and cropped to s ∈ [50, 200] Mpc. Real source: Alam et al. (2017) MNRAS 470, 2617; doi:10.1093/mnras/stx721. <Link href="https://github.com/karthikbadam/known-universe/blob/main/scripts/fetch/bao.md" target="_blank" rel="noopener noreferrer">fetch.md</Link> has the BOSS data URL.</Text></Citation>}
    />
  );
}
