import { Code, Link, SimpleGrid, Text } from "@chakra-ui/react";
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
import { GW150914_FIDUCIAL, chirpWaveform } from "../physics/chirp";
import { chartPalette } from "../theme/palette";

const dataStatus: DataStatus = "simulated";
const T_C = GW150914_FIDUCIAL.tc;
const SAMPLES = 600;

export function GW150914() {
  const { ready, error } = useDataTable(TABLES.gw150914.name, TABLES.gw150914.url, { skipHeaderLines: TABLES.gw150914.skipHeaderLines });
  const [chirpMass, setChirpMass] = useState<number>(GW150914_FIDUCIAL.chirpMassSolar);
  const [phaseOffset, setPhaseOffset] = useState<number>(0);
  const modelLine = useMemo(() => {
    const ts: number[] = [];
    for (let i = 0; i < SAMPLES; i++) ts.push((i / (SAMPLES - 1)) * 0.5);
    const h = chirpWaveform(ts, T_C, chirpMass, phaseOffset);
    return ts.map((t, i) => ({ t, h: h[i]! * 1e21 }));
  }, [chirpMass, phaseOffset]);
  const spec = useMemo(() => [
    vg.line(vg.from(TABLES.gw150914.name), { x: "t_s", y: "strain", stroke: chartPalette.errorStroke, strokeWidth: 0.6, strokeOpacity: 0.7 }),
    vg.line(modelLine, { x: "t", y: "h", stroke: chartPalette.dataFill, strokeWidth: 2 }),
    vg.ruleX([{ x: T_C }], { x: "x", stroke: chartPalette.dataStroke, strokeOpacity: 0.5, strokeDasharray: "4,3" }),
    vg.xLabel("Time (s) →"), vg.yLabel("↑ strain × 10⁻²¹"),
    vg.xDomain([0, 0.5]), vg.yDomain([-1.8, 1.8]),
    vg.width(820), vg.height(420), vg.marginLeft(65), vg.marginBottom(50),
  ], [modelLine]);

  return (
    <PlotSection
      index={9}
      title="GW150914 — first sound of merging black holes"
      question="Can two black holes nine billion light years away ring spacetime loudly enough to hear?"
      dataStatus={dataStatus}
      summary={<Text>On 14 September 2015 LIGO detected a tenth-of-a-second chirp — strain rising from ~10⁻²² to 10⁻²¹ as the frequency swept from 35 to 250 Hz before flat-lining at merger. Slide M_c to fit the model line (gold) against the noisy strain (grey); the published chirp mass is ≈ 30 M_☉, implying two 30-M_☉ BHs spiralling together.</Text>}
      math={<>
        <MathBlock ariaLabel="chirp frequency evolution">{`f_{\\rm gw}(t) \\;=\\; \\frac{1}{\\pi}\\left(\\frac{5}{256}\\right)^{3/8}\\left(\\frac{G M_c}{c^3}\\right)^{-5/8} (t_c - t)^{-3/8}`}</MathBlock>
        <Text fontSize="sm" color="navy.200"><MathInline>{`M_c = (m_1 m_2)^{3/5}/(m_1+m_2)^{1/5}`}</MathInline> is the "chirp mass" — the only combination of the binary masses the inspiral waveform depends on at leading PN order. Fitting it measures the source mass without ever resolving the two components.</Text>
      </>}
      plot={error !== null ? <PlotError message={error} /> : <MosaicPlot spec={spec} enabled={ready} ariaLabel="GW150914 strain time series with chirp model overlay" minHeight="420px" />}
      controls={
        <SimpleGrid columns={{ base: 1, md: 2 }} gap={5}>
          <ParamSlider label="Chirp mass M_c" unit="M_☉" description="Higher M_c → slower frequency rise. Published GW150914: 30.6 M_☉." min={10} max={60} step={0.2} value={chirpMass} onChange={setChirpMass} />
          <ParamSlider label="Inspiral phase offset" unit="rad" description="Rotates the waveform; doesn't change frequency evolution." min={-3.14} max={3.14} step={0.05} value={phaseOffset} onChange={setPhaseOffset} />
        </SimpleGrid>
      }
      rules={<RulesInOut rulesIn={["Two compact masses (≈ 30 M_☉ each) inspiralling and merging at the speed of light.", "Gravitational waves carry energy — strain falls as 1/D, observed at D ≈ 410 Mpc.", "General relativity in the strong, dynamical regime."]} rulesOut={["Newtonian gravity (cannot produce GW emission).", "Sources at galactic distances (nearby strain would be much larger).", "Non-BH compact objects of this mass (no neutron stars > 3 M_☉)."]} />}
      citation={<Citation title="Data source & provenance"><Text>Simulated strain via <Code>scripts/simulate/gw150914.ts</Code> from the chirp waveform in <Code>src/physics/chirp.ts</Code>. Real source: Abbott et al. (LIGO 2016) PRL 116, 061102. Public GWOSC HDF5 available; see <Link href="https://github.com/karthikbadam/known-universe/blob/main/scripts/fetch/gw150914.md" target="_blank" rel="noopener noreferrer">/scripts/fetch/gw150914.md</Link>.</Text></Citation>}
    />
  );
}
