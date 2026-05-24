import { Button, Code, HStack, Link, Text, VStack } from "@chakra-ui/react";
import { useCallback, useMemo, useRef, useState } from "react";
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
import { useDataTable } from "../../../mosaic/useDataTable";
import { vgFrame } from "../../../mosaic/vgHelpers";
import { GW150914_FIDUCIAL, chirpWaveform } from "../physics/chirp";
import { CHART_HEIGHT } from "../../../theme/chartDimensions";
import { useChartPalette } from "../../../theme/palette";

const T_C = GW150914_FIDUCIAL.tc;
const SAMPLES = 600;
const PLOT_HEIGHT = CHART_HEIGHT.standard;

const COLOR_MODEL = "#ff7a1a";
const COLOR_GUIDE = "#9aa0a6";

const vgX = vg as unknown as {
  text: (source: unknown, options: Record<string, unknown>) => unknown;
};

const GW_LABEL = [{ name: "Merger", x: T_C, y: 1.65 }];

const CHIRP_WAV_URL = `${import.meta.env.BASE_URL}data/gw150914_chirp.wav`;

interface ChirpAudio {
  play: () => void;
  audioRef: React.RefObject<HTMLAudioElement | null>;
}

function useChirpAudio(): ChirpAudio {
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const play = useCallback(() => {
    const el = audioRef.current;
    if (!el) return;
    el.currentTime = 0;
    void el.play();
  }, []);

  return { play, audioRef };
}

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
  const audio = useChirpAudio();
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
        stroke: palette.modelStroke,
        strokeWidth: 0.6,
        strokeOpacity: 0.7,
      }),
      vg.line(modelLine, {
        x: "t",
        y: "h",
        stroke: COLOR_MODEL,
        strokeWidth: 2,
      }),
      vg.ruleX([{ x: T_C }], {
        x: "x",
        stroke: COLOR_GUIDE,
        strokeOpacity: 0.7,
        strokeDasharray: "4,3",
      }),
      vgX.text(GW_LABEL, {
        x: "x", y: "y", text: "name",
        fill: palette.modelStroke, fontSize: 11, fontWeight: 500,
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
          General relativity predicts that any accelerating mass radiates
          gravitational waves — ripples in the curvature of spacetime
          itself, traveling outward at the speed of light and stretching
          and squeezing space as they pass. The waves carry energy away
          from their source, but the strain (the fractional length change
          they induce in a detector) falls off with distance. For a pair
          of black holes spiraling together billions of light-years away,
          the predicted strain at Earth is on the order of 10⁻²¹: a
          fractional length change of one part in a thousand billion
          billion. On 14 September 2015, LIGO (the Laser Interferometer
          Gravitational-Wave Observatory) made the first direct
          measurement of such a wave — a tenth-of-a-second chirp whose
          frequency swept from 35 Hz to 250 Hz before flat-lining at the
          moment of merger.
        </Text>
      }
      math={
        <>
          <MathBlock ariaLabel="chirp frequency evolution">{`f_{\\rm gw}(t) \\;=\\; \\frac{1}{\\pi}\\left(\\frac{5}{256}\\right)^{3/8}\\left(\\frac{G M_c}{c^3}\\right)^{-5/8} (t_c - t)^{-3/8}`}</MathBlock>
          <Text fontFamily="body" fontSize="sm" lineHeight="1.7">
            <MathInline>{`f_{\\rm gw}(t)`}</MathInline> is the
            gravitational-wave frequency in Hz as a function of time before
            the merger.{" "}
            <MathInline>{`t_c`}</MathInline> is the coalescence time
            (when the inspiral terminates and the two black holes merge);{" "}
            <MathInline>{`G`}</MathInline> is the gravitational constant
            and <MathInline>{`c`}</MathInline> is the speed of light. The
            mass combination{" "}
            <MathInline>{`M_c = (m_1 m_2)^{3/5} / (m_1 + m_2)^{1/5}`}</MathInline>{" "}
            is called the chirp mass, and is the only combination of the
            two black-hole masses{" "}
            <MathInline>{`m_1, m_2`}</MathInline> that the leading-order
            inspiral waveform depends on. That means fitting the chirp
            measures the source mass without ever needing to resolve the
            two components individually. On the plot, the x-axis is time
            in seconds and the y-axis is strain (the fractional length
            change at the detector) scaled by{" "}
            <MathInline>{`10^{21}`}</MathInline> for legibility. The thin
            orange trace is the actual LIGO Hanford strain (whitened and
            band-passed to 35–350 Hz), while the heavier orange line is
            the model inspiral waveform at the slider's current chirp
            mass. The dashed grey vertical guide marks the coalescence
            time <MathInline>{`t_c`}</MathInline> where the analytical
            inspiral formula breaks down.
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
      legend={
        <PlotLegend
          items={[
            { name: "LIGO strain", description: "Hanford detector, whitened + bandpassed 35–350 Hz", color: palette.modelStroke, mark: "line" },
            { name: "Chirp model", description: "Leading-order inspiral waveform; slider-controlled M_c", color: COLOR_MODEL, mark: "line" },
            { name: "Merger time", description: "Vertical guide at t_c where the inspiral terminates", color: COLOR_GUIDE, mark: "dashed-line" },
          ]}
        />
      }
      controls={
        <VStack align="stretch" gap={5}>
          <HStack gap={3} align="center">
            <Button
              size="sm"
              variant="solid"
              colorPalette="orange"
              onClick={audio.play}
            >
              ▶ Play merger
            </Button>
            <audio
              ref={audio.audioRef}
              src={CHIRP_WAV_URL}
              preload="auto"
              style={{ display: "none" }}
            />
            <Text fontSize="xs" color="fg.subtle" lineHeight="1.3">
              Real H1 strain, ~0.45 s. The chirp sweeps 35→250 Hz — audible without pitch-shifting.
            </Text>
          </HStack>
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
            "Two compact masses of roughly 30 solar masses each, inspiraling and merging at speeds approaching the speed of light.",
            "Gravitational waves carry energy and have strain that falls as 1/distance; this source is at roughly 410 megaparsecs (~1.3 billion light-years).",
            "General relativity in the strong-field, dynamical regime — the same theory that fits the EHT shadow now fits a relativistic two-body merger.",
          ]}
          rulesOut={[
            "Newtonian gravity, which has no mechanism for producing gravitational radiation.",
            "Galactic-distance sources, which would produce strains many orders of magnitude larger.",
            "Non-black-hole compact objects at this mass, since stable neutron stars are limited to roughly 2–3 solar masses.",
          ]}
        />
      }
      takeaway={
        <Text>
          Fitting the inspiral waveform to the strain data measures{" "}
          <MathInline>{`M_c \\approx 30.6`}</MathInline> solar masses. The
          near-equal masses needed to produce that chirp mass place each
          component at roughly 30 solar masses, consistent with stellar-
          origin black holes. The strain amplitude pins the distance to
          the source at roughly 410 megaparsecs (about 1.3 billion
          light-years), which means the chirp now visible at Earth was
          radiated when the universe was about 10 billion years old. Since
          GW150914, the LIGO–Virgo–KAGRA network has detected more than
          90 compact binary mergers across three observing runs, and the
          resulting population — black hole and neutron star binaries
          spanning two orders of magnitude in mass — has opened a new
          observational channel into stellar end-states and a new
          standard-siren method for measuring{" "}
          <MathInline>{`H_0`}</MathInline> independent of the
          electromagnetic distance ladder.
        </Text>
      }
      citation={
        <Citation title="Data source & provenance">
          <Text>
            LIGO H1 strain around GW150914 from GWOSC (
            <Code>H-H1_LOSC_4_V2-1126259446-32.hdf5</Code>), whitened against
            the Welch PSD, Butterworth-bandpassed 35–350 Hz, decimated 4096 →
            512 Hz, then scaled to units of 10⁻²¹ to match the published
            strain amplitude. Source: Abbott et al. (LIGO 2016) PRL 116,
            061102. See{" "}
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
