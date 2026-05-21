import { Box, Code, Link, Switch, Text, VStack } from "@chakra-ui/react";
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
import { muCurve } from "../physics/luminosity";
import { CHART_HEIGHT } from "../../../theme/chartDimensions";
import { useChartPalette } from "../../../theme/palette";

const SAMPLES = 240;
const PLOT_HEIGHT = CHART_HEIGHT.standard;

export function SupernovaHubble() {
  const palette = useChartPalette();
  const { ready, error } = useDataTable(
    TABLES.pantheonPlus.name,
    TABLES.pantheonPlus.url,
    { skipHeaderLines: TABLES.pantheonPlus.skipHeaderLines },
  );
  const [H0, setH0] = useState<number>(70);
  const [omegaM, setOmegaM] = useState<number>(0.3);
  const [omegaLambda, setOmegaLambda] = useState<number>(0.7);
  const [flat, setFlat] = useState<boolean>(true);
  const params = useMemo(
    () => ({ H0, omegaM, omegaLambda: flat ? 1 - omegaM : omegaLambda }),
    [H0, omegaM, omegaLambda, flat],
  );
  const modelCurve = useMemo(
    () => muCurve(params, { zMin: 0.005, zMax: 2.3, samples: SAMPLES })
      .map((row) => ({ z: row.z, mu: row.mu })),
    [params],
  );
  const spec = useMemo(
    () => [
      vg.dot(vg.from(TABLES.pantheonPlus.name), {
        x: "z",
        y: "mu",
        r: 2,
        fill: palette.dataFill,
        fillOpacity: 0.55,
      }),
      vg.line(modelCurve, {
        x: "z", y: "mu", stroke: palette.modelStroke, strokeWidth: 2,
      }),
      ...vgFrame({
        xLabel: "Redshift z (log) →",
        yLabel: "↑ Distance modulus μ (mag)",
        xDomain: [0.005, 2.3],
        yDomain: [30, 48],
        margins: { left: 85 },
      }),
    ],
    [modelCurve, palette],
  );

  return (
    <PlotSection
      index={5}
      title="Pantheon+, supernovae prefer a flat, accelerating universe"
      question="Why do high-z Type Ia supernovae sit above the matter-only line?"
      summary={
        <Text>
          Each dot is one Type Ia supernova: a stellar furnace fusion-bomb of
          calibrated luminosity. Plotted against redshift, their distance moduli
          trace the integrated expansion history. A matter-only universe
          predicts the dim straight asymptote at high z; the data sits above it.
          The best fit needs a non-zero{" "}
          <MathInline>{`\\Omega_\\Lambda`}</MathInline>, the dark-energy
          discovery of 1998.
        </Text>
      }
      math={
        <>
          <MathBlock ariaLabel="distance modulus and luminosity distance">{`\\mu(z) \\;=\\; 5\\log_{10}\\!\\left(\\frac{d_L(z)}{10\\text{ pc}}\\right) \\qquad d_L(z) \\;=\\; (1+z)\\,\\frac{c}{H_0}\\int_0^z \\frac{dz'}{E(z')}`}</MathBlock>
          <Text
            fontFamily="body"
            fontSize="sm"
            color="fg.muted"
            lineHeight="1.7"
          >
            <MathInline>{`E(z) = \\sqrt{\\Omega_m(1+z)^3 + \\Omega_\\Lambda + \\Omega_k(1+z)^2}`}</MathInline>
            . We integrate this with Simpson's rule (80 steps) in{" "}
            <Code>src/physics/luminosity.ts</Code>; curvature is folded in
            exactly via the sinh/sin closing.
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
            ariaLabel="Hubble diagram of Type Ia supernovae"
            height={PLOT_HEIGHT}
          />
        )
      }
      controls={
        <VStack align="stretch" gap={5}>
          <ParamSlider
            label="Hubble constant H₀"
            unit="km/s/Mpc"
            description="Anchors the low-z line. Best-fit Pantheon+ ≈ 73; Planck ≈ 67."
            min={50}
            max={85}
            step={0.5}
            value={H0}
            onChange={setH0}
          />
          <ParamSlider
            label="Matter density Ω_m"
            description="Fraction of critical density in matter. Best-fit Pantheon+ ≈ 0.33."
            min={0}
            max={1}
            step={0.01}
            value={omegaM}
            onChange={setOmegaM}
          />
          <ParamSlider
            label="Dark-energy density Ω_Λ"
            description="Disabled when flat toggle is on (Ω_Λ = 1 - Ω_m)."
            min={0}
            max={1.2}
            step={0.01}
            value={flat ? 1 - omegaM : omegaLambda}
            onChange={setOmegaLambda}
          />
          <Box
            bg="bg.subtle"
            borderRadius="sm"
            p={4}
            borderWidth={1}
            borderColor="border"
            display="flex"
            alignItems="center"
            justifyContent="space-between"
          >
            <Box>
              <Text
                fontFamily="heading"
                color="fg"
                fontWeight="medium"
                fontSize="sm"
              >
                Flat universe
              </Text>
              <Text fontFamily="body" fontSize="sm">
                Enforces Ω_k = 0 (Ω_Λ = 1 - Ω_m).
              </Text>
            </Box>
            <Switch.Root
              checked={flat}
              onCheckedChange={(d) => setFlat(d.checked)}
            >
              <Switch.HiddenInput />
              <Switch.Control>
                <Switch.Thumb />
              </Switch.Control>
            </Switch.Root>
          </Box>
        </VStack>
      }
      rules={
        <RulesInOut
          rulesIn={[
            "Dark energy: Ω_Λ ≈ 0.7 fits supernovae + CMB + BAO simultaneously.",
            "A flat, accelerating universe, Ω_k ≈ 0, dμ/d(ln z) flattens at high z.",
            "Distance modulus as a standard candle, same SN type, same intrinsic luminosity within ~0.1 mag.",
          ]}
          rulesOut={[
            "Matter-only universes (μ would lie ~0.3 mag below the data at z=0.5).",
            "Coasting models (open Ω_m = 0 universes), the curve shape is wrong.",
            "Strongly curved universes, disfavoured by joint SN + CMB fits.",
          ]}
        />
      }
      citation={
        <Citation title="Data source & provenance">
          <Text>
            Pantheon+SH0ES distance-modulus catalogue (Brout et al. 2022), 1619
            spectroscopically-confirmed Type Ia SNe with calibrator galaxies
            excluded and z ≥ 0.005. Real source: Brout et al. (2022) ApJ 938,
            110; data file <Code>Pantheon+SH0ES.dat</Code>. See{" "}
            <Link
              href="https://github.com/karthikbadam/known-universe/blob/main/scripts/fetch/pantheon.md"
              target="_blank"
              rel="noopener noreferrer"
            >
              /scripts/fetch/pantheon.md
            </Link>
            .
          </Text>
        </Citation>
      }
    />
  );
}
