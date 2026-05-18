import { Code, Link, Text, VStack } from "@chakra-ui/react";
import { useMemo, useState } from "react";
import * as vg from "@uwdata/vgplot";

import { Citation } from "../components/Citation";
import { MathBlock, MathInline } from "../components/MathBlock";
import { MosaicPlot } from "../components/MosaicPlot";
import { ParamSlider } from "../components/ParamSlider";
import { PlotError } from "../components/PlotError";
import { PlotSection } from "../components/PlotSection";
import { RulesInOut } from "../components/RulesInOut";

import { TABLES } from "../data/loaders";
import { useDataTable } from "../mosaic/useDataTable";
import { vgFrame } from "../mosaic/vgHelpers";
import { GW150914_FIDUCIAL, chirpWaveform } from "../physics/chirp";
import { CHART_HEIGHT } from "../theme/chartDimensions";
import { useChartPalette } from "../theme/palette";

const T_C = GW150914_FIDUCIAL.tc;
const SAMPLES = 600;
const PLOT_HEIGHT = CHART_HEIGHT.standard;

export function GW150914() {
  const palette = useChartPalette();
  const { ready, error } = useDataTable(
    TABLES.gw150914.name,
    TABLES.gw150914.url,
    { skipHeaderLines: TABLES.gw150914.skipHeaderLines },
  );
  const [chirpMass, setChirpMass] = useState<number>(
    GW150914_FIDUCIAL.chirpMassSolar,
  );
  const [phaseOffset, setPhaseOffset] = useState<number>(0);
  const modelLine = useMemo(() => {
    const ts: number[] = [];
    for (let i = 0; i < SAMPLES; i++) ts.push((i / (SAMPLES - 1)) * 0.5);
    const h = chirpWaveform(ts, T_C, chirpMass, phaseOffset);
    return ts.map((t, i) => ({ t, h: h[i]! * 1e21 }));
  }, [chirpMass, phaseOffset]);
  const spec = useMemo(
    () => [
      vg.line(vg.from(TABLES.gw150914.name), {
        x: "t_s",
        y: "strain",
        stroke: palette.errorStroke,
        strokeWidth: 0.6,
        strokeOpacity: 0.7,
      }),
      vg.line(modelLine, {
        x: "t",
        y: "h",
        stroke: palette.dataFill,
        strokeWidth: 2,
      }),
      vg.ruleX([{ x: T_C }], {
        x: "x",
        stroke: palette.dataStroke,
        strokeOpacity: 0.5,
        strokeDasharray: "4,3",
      }),
      ...vgFrame({
        xLabel: "Time (s) →",
        yLabel: "↑ strain × 10⁻²¹",
        xDomain: [0, 0.5],
        yDomain: [-1.8, 1.8],
      }),
    ],
    [modelLine, palette],
  );

  return (
    <PlotSection
      index={9}
      title="GW150914, first sound of merging black holes"
      question="Can two black holes nine billion light years away ring spacetime loudly enough to hear?"
      summary={
        <Text>
          On 14 September 2015 LIGO detected a tenth-of-a-second chirp, strain
          rising from ~10⁻²² to 10⁻²¹ as the frequency swept from 35 to 250 Hz
          before flat-lining at merger. Slide M_c to fit the model line against
          the noisy strain; the published chirp mass is ≈ 30 M_☉, implying two
          30-M_☉ BHs spiralling together.
        </Text>
      }
      math={
        <>
          <MathBlock ariaLabel="chirp frequency evolution">{`f_{\\rm gw}(t) \\;=\\; \\frac{1}{\\pi}\\left(\\frac{5}{256}\\right)^{3/8}\\left(\\frac{G M_c}{c^3}\\right)^{-5/8} (t_c - t)^{-3/8}`}</MathBlock>
          <Text
            fontFamily="body"
            fontSize="sm"
            color="fg.muted"
            lineHeight="1.7"
          >
            <MathInline>{`M_c = (m_1 m_2)^{3/5}/(m_1+m_2)^{1/5}`}</MathInline>{" "}
            is the "chirp mass", the only combination of the binary masses the
            inspiral waveform depends on at leading PN order. Fitting it
            measures the source mass without ever resolving the two components.
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
            ariaLabel="GW150914 strain time series with chirp model overlay"
            height={PLOT_HEIGHT}
          />
        )
      }
      controls={
        <VStack align="stretch" gap={5}>
          <ParamSlider
            label="Chirp mass M_c"
            unit="M_☉"
            description="Higher M_c → slower frequency rise. Published GW150914: 30.6 M_☉."
            min={10}
            max={60}
            step={0.2}
            value={chirpMass}
            onChange={setChirpMass}
          />
          <ParamSlider
            label="Inspiral phase offset"
            unit="rad"
            description="Rotates the waveform; doesn't change frequency evolution."
            min={-3.14}
            max={3.14}
            step={0.05}
            value={phaseOffset}
            onChange={setPhaseOffset}
          />
        </VStack>
      }
      rules={
        <RulesInOut
          rulesIn={[
            "Two compact masses (≈ 30 M_☉ each) inspiralling and merging at the speed of light.",
            "Gravitational waves carry energy, strain falls as 1/D, observed at D ≈ 410 Mpc.",
            "General relativity in the strong, dynamical regime.",
          ]}
          rulesOut={[
            "Newtonian gravity (cannot produce GW emission).",
            "Sources at galactic distances (nearby strain would be much larger).",
            "Non-BH compact objects of this mass (no neutron stars > 3 M_☉).",
          ]}
        />
      }
      citation={
        <Citation title="Data source & provenance">
          <Text>
            LIGO H1 strain around GW150914 from GWOSC (
            <Code>H-H1_LOSC_4_V2-1126259446-32.hdf5</Code>), whitened against
            the Welch PSD, Butterworth-bandpassed 35–350 Hz, decimated 4096 →
            512 Hz, then rescaled so the noise standard deviation matches the
            simulated convention. Real source: Abbott et al. (LIGO 2016) PRL
            116, 061102. See{" "}
            <Link
              href="https://github.com/karthikbadam/known-universe/blob/main/scripts/fetch/gw150914.md"
              target="_blank"
              rel="noopener noreferrer"
            >
              /scripts/fetch/gw150914.md
            </Link>
            .
          </Text>
        </Citation>
      }
    />
  );
}
