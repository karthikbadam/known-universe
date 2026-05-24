import { Box, Code, Link, Switch, Text, VStack } from "@chakra-ui/react";
import { useMemo, useState } from "react";
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
import { muCurve } from "../physics/luminosity";
import { CHART_HEIGHT } from "../../../theme/chartDimensions";
import { useChartPalette } from "../../../theme/palette";

const SAMPLES = 240;
const PLOT_HEIGHT = CHART_HEIGHT.standard;

const COLOR_LCDM = "#ff7a1a";
const COLOR_MATTER = "#9aa0a6";

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
  const matterOnlyCurve = useMemo(
    () =>
      muCurve(
        { H0: params.H0, omegaM: 1, omegaLambda: 0 },
        { zMin: 0.005, zMax: 2.3, samples: SAMPLES },
      ).map((row) => ({ z: row.z, mu: row.mu })),
    [params.H0],
  );
  const spec = useMemo(
    () => [
      vg.dot(vg.from(TABLES.pantheonPlus.name), {
        x: "z",
        y: "mu",
        r: 2,
        fill: palette.modelStroke,
        fillOpacity: 0.55,
      }),
      vg.line(matterOnlyCurve, {
        x: "z", y: "mu",
        stroke: COLOR_MATTER, strokeWidth: 1.5, strokeDasharray: "4,3",
      }),
      vg.line(modelCurve, {
        x: "z", y: "mu", stroke: COLOR_LCDM, strokeWidth: 2,
      }),
      ...vgFrame({
        xLabel: "Redshift z (log) →",
        yLabel: "↑ Distance modulus μ (mag)",
        xDomain: [0.005, 2.3],
        yDomain: [30, 48],
        margins: { left: 85 },
      }),
    ],
    [modelCurve, matterOnlyCurve, palette],
  );

  return (
    <PlotSection
      index={5}
      title="Pantheon+, supernovae prefer a flat, accelerating universe"
      question="Why are the most distant Type Ia supernovae fainter than gravity alone can explain?"
      summary={
        <Text>
          Type Ia supernovae are the explosions of white dwarf stars that
          have accreted matter from a companion and crossed a critical mass
          threshold. Because the threshold is universal, every Type Ia
          supernova releases nearly the same amount of light at peak —
          they are standard candles, objects of known intrinsic
          brightness. By comparing how bright a supernova appears to how
          bright it actually is, you measure how far away it is, and
          plotting distance against redshift traces the expansion history
          of the universe. If the only ingredient in the universe were
          matter, gravity would gradually slow the expansion over cosmic
          time, and supernovae at a given redshift should sit at a
          specific predicted brightness. In the late 1990s the most
          distant Type Ia supernovae were measured to be fainter than that
          — meaning they are farther away than gravity acting on matter
          alone can produce, which means the expansion has not been
          slowing down at all but accelerating.
        </Text>
      }
      math={
        <>
          <MathBlock ariaLabel="distance modulus and luminosity distance">{`\\mu(z) \\;=\\; 5\\log_{10}\\!\\left(\\frac{d_L(z)}{10\\text{ pc}}\\right) \\qquad d_L(z) \\;=\\; (1+z)\\,\\frac{c}{H_0}\\int_0^z \\frac{dz'}{E(z')}`}</MathBlock>
          <Text fontFamily="body" fontSize="sm" lineHeight="1.7">
            <MathInline>{`\\mu(z)`}</MathInline> is the distance modulus: the
            difference between a supernova's apparent magnitude and its
            absolute magnitude, which directly encodes the logarithm of its
            luminosity distance{" "}
            <MathInline>{`d_L(z)`}</MathInline> in units of 10 parsecs.{" "}
            <MathInline>{`z`}</MathInline> is the cosmological redshift, a
            dimensionless measure of how much the universe has expanded
            between emission and observation.{" "}
            <MathInline>{`c`}</MathInline> is the speed of light and{" "}
            <MathInline>{`H_0`}</MathInline> is the Hubble constant (the
            present-day expansion rate). The integral{" "}
            <MathInline>{`E(z) = \\sqrt{\\Omega_m(1+z)^3 + \\Omega_\\Lambda + \\Omega_k(1+z)^2}`}</MathInline>{" "}
            is the normalized Hubble parameter as a function of redshift,
            with <MathInline>{`\\Omega_m`}</MathInline> the matter density,{" "}
            <MathInline>{`\\Omega_\\Lambda`}</MathInline> the dark-energy
            (cosmological constant) density, and{" "}
            <MathInline>{`\\Omega_k`}</MathInline> the curvature contribution,
            all expressed as fractions of the critical density. On the plot,
            the x-axis is redshift (log scale) and the y-axis is distance
            modulus in magnitudes. Each small dot is one Type Ia supernova
            from the Pantheon+ catalog. The solid orange line is the
            best-fit ΛCDM model at the sliders' current values; the dashed
            grey line is the counterfactual matter-only universe (
            <MathInline>{`\\Omega_m = 1, \\Omega_\\Lambda = 0`}</MathInline>)
            at the same <MathInline>{`H_0`}</MathInline>, which sits below
            the data at high redshift.
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
      legend={
        <PlotLegend
          items={[
            { name: "Pantheon+ SNe", description: "1619 Type Ia supernovae, distance vs. redshift", color: palette.modelStroke, mark: "dot" },
            { name: "ΛCDM model", description: "Best fit with dark energy (Ω_Λ ≠ 0)", color: COLOR_LCDM, mark: "line" },
            { name: "Matter only", description: "Ω_Λ = 0, Ω_m = 1 — sits below the data at high z", color: COLOR_MATTER, mark: "dashed-line" },
          ]}
        />
      }
      legendPlacement="above-plot"
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
            "A dark-energy component with Ω_Λ ≈ 0.7, fitted jointly to supernovae, CMB, and BAO.",
            "A spatially flat, currently accelerating universe — the distance–redshift curve flattens at high z in exactly the predicted way.",
            "Type Ia supernovae as reliable standard candles, with intrinsic brightness consistent within ~0.1 magnitudes after light-curve calibration.",
          ]}
          rulesOut={[
            "A matter-only universe — its prediction sits ~0.3 magnitudes below the data at z ≈ 0.5.",
            "Coasting models (open Ω_m = 0 universes) — the curve shape is wrong at all redshifts.",
            "Strongly curved universes — disfavored by joint supernova + CMB fits.",
          ]}
        />
      }
      takeaway={
        <Text>
          The signal that distant Type Ia supernovae are fainter than a
          matter-only universe predicts is the basis of the 1998 dark-energy
          discovery. Fitting the equation above to the data requires{" "}
          <MathInline>{`\\Omega_\\Lambda \\neq 0`}</MathInline>; the joint
          best fit is{" "}
          <MathInline>{`\\Omega_m \\approx 0.3`}</MathInline> and{" "}
          <MathInline>{`\\Omega_\\Lambda \\approx 0.7`}</MathInline>. This
          same parameter pair is independently required by the CMB acoustic
          peak positions (previous two sections) and by the BAO ruler (the
          next section), and all three data sets converge on the same
          values. "Dark energy" is the name given to the component with
          negative pressure that drives the late-time acceleration; its
          equation-of-state parameter <MathInline>{`w`}</MathInline> is
          measured to be consistent with{" "}
          <MathInline>{`-1`}</MathInline>, the value expected for a
          cosmological constant. Whether{" "}
          <MathInline>{`\\Omega_\\Lambda`}</MathInline> is truly a constant
          or a slowly evolving field is the question that current and
          upcoming surveys (DESI, Euclid, Roman) are designed to answer.
        </Text>
      }
      citation={
        <Citation title="Data source & provenance">
          <Text>
            Pantheon+SH0ES distance-modulus catalogue (Brout et al. 2022), 1619
            spectroscopically-confirmed Type Ia SNe with calibrator galaxies
            excluded and z ≥ 0.005. Source: Brout et al. (2022) ApJ 938, 110;
            data file <Code>Pantheon+SH0ES.dat</Code>. See{" "}
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
