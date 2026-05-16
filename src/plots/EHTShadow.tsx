import { Box, Code, Link, SimpleGrid, Stat, Text } from "@chakra-ui/react";
import { useMemo, useState } from "react";
import { useTheme } from "next-themes";

import { Citation } from "../components/Citation";
import { MathBlock, MathInline } from "../components/MathBlock";
import { ParamSlider } from "../components/ParamSlider";
import { PlotSection } from "../components/PlotSection";
import { RulesInOut } from "../components/RulesInOut";
import { CHART_HEIGHT } from "../theme/chartDimensions";
import { useChartPalette } from "../theme/palette";

import {
  M87_OBSERVED,
  inclinationFactor,
  shadowDiameterUas,
} from "../physics/blackHoleShadow";

const REAL_IMAGE_URL = `${import.meta.env.BASE_URL}data/eht_m87.jpg`;
// The ESO EHT image renders the bright ring (~42 μas across) roughly
// centred within the frame; ~0.4 of the image's vertical extent is filled
// by the ring. We size the background image accordingly.
const REAL_IMAGE_SCALE_UAS = 100;
const VIEW_BOX_UAS = 80;
const PLOT_HEIGHT = CHART_HEIGHT.standard;

export function EHTShadow() {
  const palette = useChartPalette();
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";
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

  const radiusInView = predictedDiameterUas / 2;
  const matches =
    Math.abs(predictedDiameterUas - M87_OBSERVED.shadowDiameterUas) <
    M87_OBSERVED.shadowSigmaUas;

  const targetStroke = matches ? palette.dataFill : palette.modelStroke;
  const scaleColor = isDark ? "#f5f5f5" : "#111111";

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
        <Box
          display="flex"
          justifyContent="center"
          alignItems="center"
          h={`${PLOT_HEIGHT}px`}
        >
          <svg
            viewBox={`-${VIEW_BOX_UAS / 2} -${VIEW_BOX_UAS / 2} ${VIEW_BOX_UAS} ${VIEW_BOX_UAS}`}
            style={{
              width: `min(100%, ${PLOT_HEIGHT}px)`,
              height: "100%",
              maxWidth: "100%",
              background: palette.background,
            }}
            role="img"
            aria-label={`EHT black hole shadow, predicted diameter ${predictedDiameterUas.toFixed(1)} μas`}
          >
            <image
              href={REAL_IMAGE_URL}
              x={-REAL_IMAGE_SCALE_UAS / 2}
              y={-REAL_IMAGE_SCALE_UAS / 2}
              width={REAL_IMAGE_SCALE_UAS}
              height={REAL_IMAGE_SCALE_UAS}
              preserveAspectRatio="xMidYMid slice"
            />
            <circle
              cx={0}
              cy={0}
              r={radiusInView}
              fill="none"
              stroke={targetStroke}
              strokeWidth={0.4}
              strokeOpacity={0.5}
            />
            <circle
              cx={0}
              cy={0}
              r={M87_OBSERVED.shadowDiameterUas / 2}
              fill="none"
              stroke={targetStroke}
              strokeWidth={0.6}
              strokeDasharray="2,1.5"
            />
            <text
              x={5}
              y={36}
              fill={scaleColor}
              textAnchor="middle"
            >
              20 μas
            </text>
          </svg>
        </Box>
      }
      controls={
        <SimpleGrid columns={{ base: 1, md: 3 }} gap={5}>
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
            <Stat.Label color="fg.muted" fontFamily="mono" fontSize="xs">
              Predicted shadow diameter
            </Stat.Label>
            <Stat.ValueText color={matches ? "accent" : "fg"} fontFamily="mono">
              {predictedDiameterUas.toFixed(1)} μas
            </Stat.ValueText>
            <Text color="fg.muted" fontSize="xs" mt={1}>
              EHT measured: 42 ± 3 μas
            </Text>
          </Stat.Root>
        </SimpleGrid>
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
            Real EHT M87* April 2019 image from ESO (<Code>eso1907a.jpg</Code>),
            overlaid with the dashed circle showing the predicted Schwarzschild
            shadow at the current slider values. Real source: EHT Collaboration
            (2019) ApJ 875, L1.{" "}
            <Link
              href="https://github.com/karthikbadam/known-universe/blob/main/scripts/fetch/eht_m87.md"
              target="_blank"
              rel="noopener noreferrer"
            >
              /scripts/fetch/eht_m87.md
            </Link>
            .
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
