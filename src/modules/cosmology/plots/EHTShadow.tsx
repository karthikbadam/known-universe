import { Code, Link, Stat, Text, VStack } from "@chakra-ui/react";
import * as vg from "@uwdata/vgplot";
import { useMemo, useState } from "react";

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
import { CHART_HEIGHT } from "../../../theme/chartDimensions";
import { useChartPalette } from "../../../theme/palette";

import {
  M87_OBSERVED,
  inclinationFactor,
  shadowDiameterUas,
} from "../physics/blackHoleShadow";

const PLOT_HEIGHT = CHART_HEIGHT.standard;
const FOV_UAS = 100;
const COLOR_PREDICTED = "#ff7a1a";
const COLOR_OBSERVED = "#9aa0a6";

const ORANGE_RAMP_DARK = ["#0a0a0a", "#ff7a1a", "#ffd089"];
const ORANGE_RAMP_LIGHT = ["#ffffff", "#ff7a1a", "#5c1f00"];

const vgX = vg as unknown as {
  raster: (source: unknown, options: Record<string, unknown>) => unknown;
  max: (col: string) => unknown;
};

function circlePoints(
  radiusUas: number,
  n = 180,
): ReadonlyArray<{ x: number; y: number }> {
  const out: { x: number; y: number }[] = [];
  for (let i = 0; i <= n; i++) {
    const t = (i / n) * 2 * Math.PI;
    out.push({ x: radiusUas * Math.cos(t), y: radiusUas * Math.sin(t) });
  }
  return out;
}

const OBSERVED_CIRCLE = circlePoints(M87_OBSERVED.shadowDiameterUas / 2);

export function EHTShadow() {
  const palette = useChartPalette();
  const { ready, error } = useDataTable(
    TABLES.ehtM87.name,
    TABLES.ehtM87.url,
    { skipHeaderLines: TABLES.ehtM87.skipHeaderLines },
  );
  const [massBillionSun, setMassBillionSun] = useState<number>(
    M87_OBSERVED.massSolar / 1e9,
  );
  const [distanceMpc, setDistanceMpc] = useState<number>(
    M87_OBSERVED.distanceMpc,
  );
  const [inclinationDeg, setInclinationDeg] = useState<number>(17);

  const predictedDiameterUas = useMemo(() => {
    const massSolar = massBillionSun * 1e9;
    return (
      shadowDiameterUas(massSolar, distanceMpc) *
      inclinationFactor(inclinationDeg)
    );
  }, [massBillionSun, distanceMpc, inclinationDeg]);

  const matches =
    Math.abs(predictedDiameterUas - M87_OBSERVED.shadowDiameterUas) <
    M87_OBSERVED.shadowSigmaUas;

  const predictedCircle = useMemo(
    () => circlePoints(predictedDiameterUas / 2),
    [predictedDiameterUas],
  );

  const spec = useMemo(
    () => [
      vgX.raster(vg.from(TABLES.ehtM87.name), {
        x: "x_uas",
        y: "y_uas",
        fill: vgX.max("intensity"),
        interpolate: "none",
        pixelSize: 1,
      }),
      vg.line(OBSERVED_CIRCLE, {
        x: "x",
        y: "y",
        stroke: COLOR_OBSERVED,
        strokeWidth: 1.2,
        strokeDasharray: "4,3",
      }),
      vg.line(predictedCircle, {
        x: "x",
        y: "y",
        stroke: COLOR_PREDICTED,
        strokeWidth: 1.6,
        strokeOpacity: matches ? 0.95 : 0.85,
      }),
      vg.xDomain([-FOV_UAS / 2, FOV_UAS / 2]),
      vg.yDomain([-FOV_UAS / 2, FOV_UAS / 2]),
      vg.marginLeft(0),
      vg.marginRight(0),
      vg.marginTop(0),
      vg.marginBottom(0),
      (plot: { attributes: Record<string, unknown> }) => {
        const isDark = palette.background !== "#ffffff";
        plot.attributes.colorScale = "diverging";
        plot.attributes.colorDomain = [0, 1];
        plot.attributes.colorPivot = 0.5;
        plot.attributes.colorRange = isDark
          ? ORANGE_RAMP_DARK
          : ORANGE_RAMP_LIGHT;
        plot.attributes.xAxis = null;
        plot.attributes.yAxis = null;
        plot.attributes.aspectRatio = 1;
        plot.attributes.style = "background: transparent;";
      },
    ],
    [predictedCircle, matches, palette],
  );

  return (
    <PlotSection
      index={8}
      title="EHT: photographing the photon ring"
      question="What's the apparent size of a billion-solar-mass black hole 17 Mpc away?"
      summary={
        <Text>
          The Event Horizon Telescope assembled an Earth-sized radio
          interferometer and resolved the photon ring of M87's central
          supermassive black hole. The dark disk's apparent diameter on the sky
          encodes only two numbers: the BH mass and its distance from us. Drag
          the mass slider and watch the predicted shadow grow; aim for the EHT
          measurement (42 ± 3 μas) and read off ~6.5 × 10⁹ M_☉.
        </Text>
      }
      math={
        <>
          <MathBlock ariaLabel="shadow diameter formula">{`\\theta_{\\rm sh} \\;=\\; \\frac{2 b_{\\rm crit}}{D} \\;=\\; \\frac{6\\sqrt{3}\\, G M}{c^2 D}`}</MathBlock>
          <Text
            fontFamily="body"
            fontSize="sm"
            color="fg.muted"
            lineHeight="1.7"
          >
            <MathInline>{`b_{\\rm crit} = 3\\sqrt{3}\\, G M / c^2`}</MathInline>{" "}
            is the critical impact parameter; light with smaller b is captured.
            The Schwarzschild radius <MathInline>{`R_s = 2GM/c^2`}</MathInline>{" "}
            is buried in there; the shadow is{" "}
            <MathInline>{`5.196 R_s`}</MathInline> across. For Kerr, spin shifts
            this by a few percent at modest inclinations.
          </Text>
        </>
      }
      plot={
        error !== null ? (
          <PlotError message={error} />
        ) : (
          <VStack align="stretch" gap={3}>
            <PlotLegend
              items={[
                {
                  name: "M87* image",
                  description: "EHT 2019 reconstruction; intensity rendered on an orange ramp",
                  color: COLOR_PREDICTED,
                  mark: "dot",
                },
                {
                  name: "Predicted shadow",
                  description: "Schwarzschild b_crit at your slider values",
                  color: COLOR_PREDICTED,
                  mark: "line",
                },
                {
                  name: "Observed shadow",
                  description: "EHT-measured 42 ± 3 μas reference",
                  color: COLOR_OBSERVED,
                  mark: "dashed-line",
                },
              ]}
            />
            <MosaicPlot
              spec={spec}
              enabled={ready}
              ariaLabel={`EHT M87* image with predicted shadow at ${predictedDiameterUas.toFixed(1)} μas`}
              height={PLOT_HEIGHT}
              aspectRatio={1}
            />
          </VStack>
        )
      }
      controls={
        <VStack align="stretch" gap={5}>
          <ParamSlider
            label="Mass M_BH"
            unit="× 10⁹ M_☉"
            description="Linear in shadow size. M87* sits at 6.5."
            min={1}
            max={15}
            step={0.1}
            value={massBillionSun}
            onChange={setMassBillionSun}
          />
          <ParamSlider
            label="Distance D"
            unit="Mpc"
            description="Inverse in shadow size. M87 is ~16.8 Mpc away."
            min={5}
            max={30}
            step={0.1}
            value={distanceMpc}
            onChange={setDistanceMpc}
          />
          <ParamSlider
            label="Viewing inclination"
            unit="°"
            description="Kerr correction; sub-percent effect at i ≲ 30°."
            min={0}
            max={90}
            step={1}
            value={inclinationDeg}
            onChange={setInclinationDeg}
          />
          <Stat.Root
            bg="bg.subtle"
            p={3}
            borderRadius="sm"
            borderWidth={1}
            borderColor="border"
          >
            <Stat.Label fontFamily="mono" fontSize="xs">
              Predicted shadow diameter
            </Stat.Label>
            <Stat.ValueText color={matches ? "accent" : "fg"} fontFamily="mono">
              {predictedDiameterUas.toFixed(1)} μas
            </Stat.ValueText>
            <Text fontSize="xs" mt={1}>
              EHT measured: 42 ± 3 μas
            </Text>
          </Stat.Root>
        </VStack>
      }
      rules={
        <RulesInOut
          rulesIn={[
            "General relativity at horizon scale: shadow size matches the GR prediction to ~10%.",
            "M87's central object is a Schwarzschild-like BH with M ≈ 6.5 × 10⁹ M_☉.",
            "No Newtonian source can produce a ring this compact.",
          ]}
          rulesOut={[
            "Naked singularities (no event horizon means no dark central disk).",
            "Wormholes with photon-trapping cross-sections inconsistent with EHT's circular ring.",
            "Modified gravity theories that predict shadow size ≫ 5.2 R_s.",
          ]}
        />
      }
      citation={
        <Citation title="Data source & provenance">
          <Text>
            The intensity grid in <Code>/public/data/eht_m87.csv</Code> is the
            published 2019 EHT M87* reconstruction, transcoded from the ESO
            press-release JPG (<Code>eso1907a</Code>) into a 200×200 (x_uas,
            y_uas, intensity) raster by{" "}
            <Code>/scripts/fetch/eht_m87_to_csv.py</Code> and rendered in-browser
            via Mosaic <Code>vg.raster</Code>. Real source: EHT Collaboration et
            al. (2019) ApJL 875, L1.{" "}
            <Link
              href="https://github.com/karthikbadam/known-universe/blob/main/scripts/fetch/eht_m87.md"
              target="_blank"
              rel="noopener noreferrer"
            >
              /scripts/fetch/eht_m87.md
            </Link>{" "}
            documents the provenance and the path to upgrade to a true FITS via
            the eht-imaging pipeline.
          </Text>
          <Text mt={2}>
            Shadow physics in <Code>src/physics/blackHoleShadow.ts</Code>:
            Schwarzschild b_crit, with M87 mass and distance from the EHT paper.
          </Text>
        </Citation>
      }
    />
  );
}
