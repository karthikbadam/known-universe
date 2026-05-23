import { Box, Code, HStack, Link, Text, VStack } from "@chakra-ui/react";
import * as vg from "@uwdata/vgplot";
import { useMemo, useState } from "react";

import { Citation } from "../../../components/Citation";
import { MathBlock, MathInline } from "../../../components/MathBlock";
import { MosaicPlot } from "../../../components/MosaicPlot";
import { ParamSlider } from "../../../components/ParamSlider";
import { PlotSection } from "../../../components/PlotSection";
import { RulesInOut } from "../../../components/RulesInOut";

import { vgFrame } from "../../../mosaic/vgHelpers";
import {
  BBN_OBSERVED,
  N_EFF_STANDARD,
  bbnDoverH,
  bbnLi7overH,
  bbnYp,
} from "../physics/bbn";
import { CHART_HEIGHT } from "../../../theme/chartDimensions";
import { useChartPalette } from "../../../theme/palette";

const N_SAMPLES = 240;
const OMEGA_BH2_MIN = 0.005;
const OMEGA_BH2_MAX = 0.05;
const YP_SCALE = 1e-4;
const PLOT_HEIGHT = CHART_HEIGHT.standard;

const SPECIES_ORDER = ["D/H", "Y_p (×10⁻⁴)", "⁷Li/H"] as const;
const SPECIES_COLOR: Record<(typeof SPECIES_ORDER)[number], string> = {
  "D/H": "#4c8bf5",
  "Y_p (×10⁻⁴)": "#e6c84a",
  "⁷Li/H": "#f06a5d",
};
const SPECIES_MEANING: Record<(typeof SPECIES_ORDER)[number], string> = {
  "D/H": "deuterium / hydrogen",
  "Y_p (×10⁻⁴)": "⁴He mass fraction (scaled)",
  "⁷Li/H": "lithium-7 / hydrogen",
};

interface CurveRow {
  omegaBh2: number;
  value: number;
  species: string;
}
interface ObservedMarker {
  x: number;
  y: number;
  species: string;
}

export function BBNAbundances() {
  const palette = useChartPalette();
  const [omegaBh2, setOmegaBh2] = useState<number>(0.022);
  const [nEff, setNEff] = useState<number>(N_EFF_STANDARD);

  const curves = useMemo<CurveRow[]>(() => {
    const rows: CurveRow[] = [];
    const logLo = Math.log(OMEGA_BH2_MIN);
    const logHi = Math.log(OMEGA_BH2_MAX);
    for (let i = 0; i < N_SAMPLES; i++) {
      const t = i / (N_SAMPLES - 1);
      const x = Math.exp(logLo + (logHi - logLo) * t);
      rows.push({ omegaBh2: x, value: bbnDoverH(x, nEff), species: "D/H" });
      rows.push({
        omegaBh2: x,
        value: bbnYp(x, nEff) * YP_SCALE,
        species: "Y_p (×10⁻⁴)",
      });
      rows.push({ omegaBh2: x, value: bbnLi7overH(x, nEff), species: "⁷Li/H" });
    }
    return rows;
  }, [nEff]);

  const observedMarkers = useMemo<ObservedMarker[]>(
    () => [
      { x: omegaBh2, y: BBN_OBSERVED.dH.value, species: "D/H" },
      {
        x: omegaBh2,
        y: BBN_OBSERVED.yp.value * YP_SCALE,
        species: "Y_p (×10⁻⁴)",
      },
      { x: omegaBh2, y: BBN_OBSERVED.li7H.value, species: "⁷Li/H" },
    ],
    [omegaBh2],
  );

  const verticalGuide = useMemo(
    () => [
      { x: omegaBh2, y: 1e-12 },
      { x: omegaBh2, y: 1e-3 },
    ],
    [omegaBh2],
  );

  const spec = useMemo(
    () => [
      vg.line(curves, {
        x: "omegaBh2",
        y: "value",
        stroke: "species",
        strokeWidth: 2,
        z: "species",
      }),
      vg.dot(observedMarkers, {
        x: "x",
        y: "y",
        r: 6,
        fill: "species",
        stroke: palette.modelStroke,
        strokeWidth: 1.5,
      }),
      vg.line(verticalGuide, {
        x: "x",
        y: "y",
        stroke: palette.highlightStroke,
        strokeOpacity: 0.6,
        strokeWidth: 1.5,
        strokeDasharray: "4,3",
      }),
      ...vgFrame({
        xLabel: "Ω_b h² →",
        yLabel: "↑ abundance (log scale)",
        xDomain: [OMEGA_BH2_MIN, OMEGA_BH2_MAX],
        yDomain: [1e-12, 3e-4],
        margins: { left: 45 },
        yLog: true,
      }),
      (plot: { attributes: Record<string, unknown> }) => {
        plot.attributes.colorDomain = [...SPECIES_ORDER];
        plot.attributes.colorRange = SPECIES_ORDER.map((s) => SPECIES_COLOR[s]);
      },
    ],
    [curves, observedMarkers, verticalGuide, palette],
  );

  return (
    <PlotSection
      index={2}
      title="BBN, three numbers from the first three minutes"
      question="How does the baryon density determine the universe's primordial light-element budget?"
      summary={
        <VStack align="stretch" gap={4}>
          <Text>
            When the universe was three minutes old, it briefly became a fusion
            reactor, an episode known as Big Bang Nucleosynthesis (BBN). The
            yields, deuterium, helium-4, lithium-7, all depend on one number:
            the baryon density Ω_b h². Slide it and watch the curves shift. At
            Ω_b h² ≈ 0.022 the D/H and Y_p dots sit right on their theory
            curves, in perfect agreement with the Cosmic Microwave Background
            (CMB) constraint that follows below. The ⁷Li/H dot intentionally
            does not: theory predicts ~3× the observed abundance, the unsolved
            "lithium problem".
          </Text>
          <Text>
            <Text as="span" color="fg" fontWeight="medium">
              Why the gap?
            </Text>{" "}
            Three candidates: old halo stars depleted their primordial ⁷Li via
            diffusion or mixing (the dots are too low), an under-measured ⁷Be
            destruction cross-section makes the prediction too high (the curve
            is wrong), or new physics, decaying relics or modified expansion at
            freeze-out, selectively burns ⁷Be (the model is wrong). Since BBN
            has no free parameters once Ω_b h² is fixed, this 4–5σ anomaly is
            one of the cleanest pointers we have to either under-modeled stellar
            astrophysics or new physics in the 1 keV–100 MeV range where
            dark-sector models live.
          </Text>
        </VStack>
      }
      math={
        <>
          <MathBlock ariaLabel="Saha-like ratio">{`\\frac{n_B}{n_\\gamma} \\equiv \\eta \\approx 273.5 \\cdot \\Omega_b h^2 \\cdot 10^{-10}`}</MathBlock>
          <Text fontFamily="body" fontSize="sm" lineHeight="1.7">
            More baryons (larger η) → less deuterium survives (it photoionises
            into helium), more <MathInline>{`Y_p`}</MathInline>, more lithium.
            The abundances come from solving Boltzmann/coupled rate equations
            for the freeze-out of a dozen nuclear species.
          </Text>
        </>
      }
      plot={
        <VStack align="stretch" gap={6}>
          <HStack gap={6} flexWrap="wrap" pl={1}>
            {SPECIES_ORDER.map((species) => (
              <HStack key={species} gap={2} align="flex-start">
                <Box
                  w="10px"
                  h="10px"
                  mt="5px"
                  borderRadius="full"
                  bg={SPECIES_COLOR[species]}
                  flexShrink={0}
                />
                <VStack align="flex-start" gap={0}>
                  <Text
                    fontFamily="mono"
                    fontSize="xs"
                    color="fg"
                    letterSpacing="0.04em"
                  >
                    {species}
                  </Text>
                  <Text fontFamily="body" fontSize="xs" lineHeight="1.3">
                    {SPECIES_MEANING[species]}
                  </Text>
                </VStack>
              </HStack>
            ))}
          </HStack>
          <MosaicPlot
            spec={spec}
            ariaLabel="BBN light element abundances vs baryon density"
            height={PLOT_HEIGHT}
          />
        </VStack>
      }
      controls={
        <VStack align="stretch" gap={5}>
          <ParamSlider
            label="Baryon density Ω_b h²"
            description="The vertical guide; watch where it intersects each theory curve vs observed dot."
            min={0.005}
            max={0.05}
            step={0.0005}
            value={omegaBh2}
            onChange={setOmegaBh2}
          />
          <ParamSlider
            label="Effective relativistic species N_eff"
            description="Standard model value is 3.046 (three neutrino species + small QED corrections)."
            min={2.5}
            max={4.5}
            step={0.05}
            value={nEff}
            onChange={setNEff}
          />
        </VStack>
      }
      rules={
        <RulesInOut
          rulesIn={[
            "A baryon density Ω_b h² ≈ 0.022, the same number the CMB gives.",
            "Three real neutrino species, N_eff > 4 or < 2 wrecks Y_p.",
            "Standard hot Big Bang: temperatures > 10⁹ K were once everywhere.",
          ]}
          rulesOut={[
            "Universes with much more or less baryonic matter (curves slide off-band).",
            "Extra relativistic species (e.g. light sterile neutrino) at the >2σ level.",
            "Trivially solved lithium problem: no Ω_b h² simultaneously matches all three with the simplest model.",
          ]}
        />
      }
      citation={
        <Citation title="Data source & provenance">
          <Text>
            Theory curves from analytical fits (Cyburt et al. 2016) in{" "}
            <Code>src/physics/bbn.ts</Code>; ~2-5% accuracy vs PArthENoPE under
            fiducial conditions. Observed values are real published
            measurements: Cooke et al. (2018) ApJ 855, 102 for D/H; Aver et al.
            (2015) JCAP 07, 011 for Y_p; Sbordone et al. (2010) A&A 522, A26 for
            ⁷Li/H.
          </Text>
          <Text mt={2}>
            See{" "}
            <Link
              href="https://github.com/karthikbadam/known-universe/blob/main/scripts/fetch/bbn.md"
              target="_blank"
              rel="noopener noreferrer"
            >
              /scripts/fetch/bbn.md
            </Link>{" "}
            for PArthENoPE-grade replacement.
          </Text>
        </Citation>
      }
    />
  );
}
