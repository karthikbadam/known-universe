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
const ORANGE_RAMP_LIGHT = ["#ffffff", "#ffd089", "#ff7a1a"];

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
      question="What does the size of M87's black hole shadow reveal about its mass?"
      summary={
        <Text>
          A black hole bends light so strongly that any photon passing
          within a critical distance of the event horizon spirals in and
          is lost. Photons that pass just outside that critical radius
          curve around the black hole and escape, forming a bright ring
          of light around a dark central disk — the photon ring and the
          shadow. The size of the shadow is set entirely by the black
          hole's mass and its distance from us: more massive means a
          bigger physical shadow, farther away means a smaller apparent
          one. In 2019 the Event Horizon Telescope, a planet-spanning
          radio interferometer, resolved the shadow of the supermassive
          black hole at the center of the galaxy M87. Reading the mass
          off the measured shadow size is the physics test this section
          demonstrates.
        </Text>
      }
      math={
        <>
          <MathBlock ariaLabel="shadow diameter formula">{`\\theta_{\\rm sh} \\;=\\; \\frac{2 b_{\\rm crit}}{D} \\;=\\; \\frac{6\\sqrt{3}\\, G M}{c^2 D}`}</MathBlock>
          <Text fontFamily="body" fontSize="sm" lineHeight="1.7">
            <MathInline>{`\\theta_{\\rm sh}`}</MathInline> is the angular
            diameter of the shadow as measured in microarcseconds (μas);
            one microarcsecond is one millionth of one sixty-thousandth of
            a degree.{" "}
            <MathInline>{`b_{\\rm crit} = 3\\sqrt{3}\\, GM/c^2`}</MathInline>{" "}
            is the critical impact parameter: light passing the black hole
            at this distance just barely escapes capture.{" "}
            <MathInline>{`G`}</MathInline> is the gravitational constant,{" "}
            <MathInline>{`M`}</MathInline> is the black-hole mass (in solar
            masses), <MathInline>{`c`}</MathInline> is the speed of light,
            and <MathInline>{`D`}</MathInline> is the distance from us to
            the black hole. The shadow diameter is{" "}
            <MathInline>{`5.196`}</MathInline> times the Schwarzschild
            radius <MathInline>{`R_s = 2GM/c^2`}</MathInline> — that
            constant of proportionality comes purely from general
            relativity. For a spinning (Kerr) black hole, the shadow
            shape changes by a few percent depending on the viewing
            inclination, captured by the inclination slider. On the plot,
            the x and y axes are angular position on the sky in
            microarcseconds (μas) relative to the brightness centroid.
            The orange-shaded image is the published EHT 2019
            reconstruction of M87*. The solid orange circle is the shadow
            diameter <MathInline>{`\\theta_{\\rm sh}`}</MathInline>{" "}
            predicted by the equation at the slider's current mass,
            distance, and inclination; the dashed grey circle is the EHT
            measurement (42 ± 3 μas) for comparison.
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
            ariaLabel={`EHT M87* image with predicted shadow at ${predictedDiameterUas.toFixed(1)} μas`}
            height={PLOT_HEIGHT}
            aspectRatio={1}
          />
        )
      }
      legend={
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
            "General relativity at horizon scale — the measured shadow diameter matches the GR prediction to about 10%.",
            "M87's central object is a Schwarzschild-like black hole with a mass of roughly 6.5 × 10⁹ solar masses.",
            "No Newtonian or stellar-cluster source can reproduce a feature this dark, this circular, and this small.",
          ]}
          rulesOut={[
            "Naked singularities — no event horizon means no dark central disk.",
            "Wormhole geometries with photon-trapping cross-sections that disagree with the observed circular ring.",
            "Modified gravity theories that predict a shadow much larger than 5.2 Schwarzschild radii.",
          ]}
        />
      }
      takeaway={
        <Text>
          The Event Horizon Telescope test is unusual in cosmology because
          it concerns a single object rather than a population, but the
          inference is direct: setting the predicted{" "}
          <MathInline>{`\\theta_{\\rm sh}`}</MathInline> equal to the
          measured 42 ± 3 μas at M87's known distance of ≈16.8 megaparsecs
          (~55 million light-years) gives a mass of{" "}
          <MathInline>{`(6.5 \\pm 0.7) \\times 10^9`}</MathInline> solar
          masses. This value agrees with two completely independent mass
          estimates of M87's central black hole: stellar dynamics in the
          galaxy's central cusp (Gebhardt et al. 2011) and gas-disk
          dynamics (Walsh et al. 2013). The agreement constitutes a test
          of general relativity in the strongest-field regime where it
          has been observationally probed. The same EHT collaboration has
          since imaged the much smaller (but much closer) supermassive
          black hole at the center of our own Galaxy, Sgr A*, with the
          same technique, and is now extending to polarimetric imaging
          that maps the magnetic field geometry of the photon ring.
        </Text>
      }
      citation={
        <Citation title="Data source & provenance">
          <Text>
            The intensity grid in <Code>/public/data/eht_m87.csv</Code> is the
            published 2019 EHT M87* reconstruction, transcoded from the ESO
            press-release JPG (<Code>eso1907a</Code>) into a 200×200 (x_uas,
            y_uas, intensity) raster by{" "}
            <Code>/scripts/fetch/eht_m87_to_csv.py</Code> and rendered
            in-browser via Mosaic <Code>vg.raster</Code>. Source: EHT
            Collaboration et al. (2019) ApJL 875, L1.{" "}
            <Link
              href="https://github.com/karthikbadam/known-universe/blob/main/scripts/fetch/eht_m87.md"
              target="_blank"
              rel="noopener noreferrer"
            >
              /scripts/fetch/eht_m87.md
            </Link>{" "}
            documents the provenance and the path to upgrade to a true
            FITS via the eht-imaging pipeline.
          </Text>
          <Text mt={2}>
            Shadow physics in <Code>src/physics/blackHoleShadow.ts</Code>:
            Schwarzschild b_crit, with M87 mass and distance from the EHT
            paper.
          </Text>
        </Citation>
      }
    />
  );
}
