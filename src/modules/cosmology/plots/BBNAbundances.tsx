import { Code, Link, Text, VStack } from "@chakra-ui/react";
import * as vg from "@uwdata/vgplot";
import { useMemo, useState } from "react";

import { Citation } from "../../../components/Citation";
import { MathBlock, MathInline } from "../../../components/MathBlock";
import { MosaicPlot } from "../../../components/MosaicPlot";
import { ParamSlider } from "../../../components/ParamSlider";
import { PlotLegend } from "../../../components/PlotLegend";
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
      title="Big Bang Nucleosynthesis: three numbers from the first three minutes"
      question="Why is the universe mostly hydrogen and helium, with only trace deuterium and lithium?"
      summary={
        <Text>
          For about three minutes after the Big Bang, the universe was hot
          enough to fuse nuclei together. Then it cooled past the threshold
          and the chemistry froze. What survived was almost entirely hydrogen
          and helium, with a trace of deuterium and lithium and essentially
          nothing heavier. This episode is called Big Bang Nucleosynthesis
          (BBN), and the abundance of each light isotope it produced depends
          on one number — how many protons and neutrons there were per
          photon. That single number fixes the entire primordial chemistry.
        </Text>
      }
      math={
        <>
          <MathBlock ariaLabel="Baryon-to-photon ratio">{`\\frac{n_B}{n_\\gamma} \\equiv \\eta \\approx 273.5 \\cdot \\Omega_b h^2 \\cdot 10^{-10}`}</MathBlock>
          <Text fontFamily="body" fontSize="sm" lineHeight="1.7">
            <MathInline>{`\\eta`}</MathInline> (eta) is the baryon-to-photon
            ratio — the number of baryons (protons and neutrons, collectively
            ordinary matter) per photon, observed to be about one baryon per{" "}
            <MathInline>{`10^9`}</MathInline> photons.{" "}
            <MathInline>{`\\Omega_b`}</MathInline> is the fraction of the
            universe's critical density made of baryons, and{" "}
            <MathInline>{`h`}</MathInline> is the Hubble constant in units of
            100 km/s/Mpc, so the combination{" "}
            <MathInline>{`\\Omega_b h^2`}</MathInline> absorbs the{" "}
            <MathInline>{`H_0`}</MathInline> dependence and is the quantity
            BBN directly constrains (with <MathInline>{`H_0`}</MathInline> the
            Hubble constant). On the plot, the x-axis is{" "}
            <MathInline>{`\\Omega_b h^2`}</MathInline> (controlled by the
            slider) and the y-axis is the abundance relative to hydrogen on a
            log scale. The three curves are theoretical yields from solving
            the freeze-out kinetics across the relevant nuclear reactions:
            blue for D/H (deuterium per hydrogen), yellow for{" "}
            <MathInline>{`Y_p`}</MathInline> (the helium-4 mass fraction,
            scaled by <MathInline>{`10^4`}</MathInline> to share the axes),
            and red for ⁷Li/H (lithium-7 per hydrogen). The three dots are the
            corresponding measured primordial abundances: D/H from absorption
            against distant quasars, <MathInline>{`Y_p`}</MathInline> from H
            II regions in metal-poor galaxies, ⁷Li/H from old halo stars in
            the Milky Way. The vertical guide marks the current{" "}
            <MathInline>{`\\Omega_b h^2`}</MathInline>; where it crosses each
            curve is the predicted abundance at that slider value.
          </Text>
        </>
      }
      plot={
        <MosaicPlot
          spec={spec}
          ariaLabel="BBN light element abundances vs baryon density"
          height={PLOT_HEIGHT}
        />
      }
      legend={
        <PlotLegend
          items={SPECIES_ORDER.map((species) => ({
            name: species,
            description: SPECIES_MEANING[species],
            color: SPECIES_COLOR[species],
            mark: "line" as const,
          }))}
        />
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
            "A baryon density Ω_b h² ≈ 0.022, the same value the cosmic microwave background gives independently (see the next two sections).",
            "Three light neutrino species; values of N_eff much above 4 or below 2 break the helium fit.",
            "A standard hot Big Bang: temperatures above ~10⁹ K were once everywhere.",
          ]}
          rulesOut={[
            "Universes with much more or less baryonic matter — all three curves slide off the data band.",
            "Extra relativistic species (e.g. a light sterile neutrino) at the level of one or more, at >2σ.",
            "A trivially solved lithium problem — no single Ω_b h² matches all three abundances within the simplest model.",
          ]}
        />
      }
      takeaway={
        <VStack align="stretch" gap={4}>
          <Text>
            Two things to take away. First, BBN and the cosmic microwave
            background measure the same{" "}
            <MathInline>{`\\Omega_b h^2`}</MathInline> through entirely
            different physics, separated by 380,000 years of cosmic time. The
            BBN measurement comes from the primordial deuterium and helium
            yields: more baryons during freeze-out means deuterium gets more
            efficiently fused into helium, leaving less of it behind. The CMB
            measurement comes from the acoustic peaks of the temperature
            spectrum: baryon loading of the photon-baryon plasma at
            recombination changes how it oscillates, raising the height of
            compression peaks (the odd-numbered ones, especially the third)
            relative to rarefaction peaks. Two independent observations, two
            independent forward models, and the same value{" "}
            <MathInline>{`\\Omega_b h^2 \\approx 0.022`}</MathInline> falls
            out.
          </Text>
          <Text>
            Second, the predicted ⁷Li abundance is about three times the
            observed value. Three explanations are actively considered:
            depletion of lithium in old halo stars over their multi-billion-
            year lifetimes, an under-measured nuclear cross-section for the
            destruction of ⁷Be (the dominant production pathway for ⁷Li), or
            new physics at the MeV energy scale where dark-sector models
            live. BBN has no free parameters once{" "}
            <MathInline>{`\\Omega_b h^2`}</MathInline> is fixed, so this gap
            is a real empirical mismatch rather than a fitting artifact.
          </Text>
        </VStack>
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
