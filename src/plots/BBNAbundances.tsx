import { Code, Link, SimpleGrid, Text } from "@chakra-ui/react";
import { useMemo, useState } from "react";
import * as vg from "@uwdata/vgplot";

import { Citation } from "../components/Citation";
import { MathBlock, MathInline } from "../components/MathBlock";
import { MosaicPlot } from "../components/MosaicPlot";
import { ParamSlider } from "../components/ParamSlider";
import { PlotSection } from "../components/PlotSection";
import { RulesInOut } from "../components/RulesInOut";
import { type DataStatus } from "../components/DataStatusBadge";

import {
  BBN_OBSERVED,
  N_EFF_STANDARD,
  bbnDoverH,
  bbnLi7overH,
  bbnYp,
} from "../physics/bbn";
import { chartPalette } from "../theme/palette";

const dataStatus: DataStatus = "simulated";

const N_SAMPLES = 240;
const OMEGA_BH2_MIN = 0.005;
const OMEGA_BH2_MAX = 0.05;
const YP_SCALE = 1e-4;

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

export function BBNAbundances(): JSX.Element {
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
      rows.push({ omegaBh2: x, value: bbnYp(x, nEff) * YP_SCALE, species: "Y_p (×10⁻⁴)" });
      rows.push({ omegaBh2: x, value: bbnLi7overH(x, nEff), species: "⁷Li/H" });
    }
    return rows;
  }, [nEff]);

  const observedMarkers = useMemo<ObservedMarker[]>(
    () => [
      { x: omegaBh2, y: BBN_OBSERVED.dH.value, species: "D/H" },
      { x: omegaBh2, y: BBN_OBSERVED.yp.value * YP_SCALE, species: "Y_p (×10⁻⁴)" },
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
        stroke: chartPalette.modelStroke,
        strokeWidth: 1.5,
      }),
      vg.line(verticalGuide, {
        x: "x",
        y: "y",
        stroke: chartPalette.highlightStroke,
        strokeOpacity: 0.6,
        strokeWidth: 1.5,
        strokeDasharray: "4,3",
      }),
      vg.xLabel("Ω_b h² →"),
      vg.yLabel("↑ abundance (log scale)"),
      vg.xDomain([OMEGA_BH2_MIN, OMEGA_BH2_MAX]),
      vg.yDomain([1e-12, 3e-4]),
      vg.width(820),
      vg.height(460),
      vg.marginLeft(80),
      vg.marginBottom(50),
    ],
    [curves, observedMarkers, verticalGuide],
  );

  return (
    <PlotSection
      index={2}
      title="BBN — three numbers from the first three minutes"
      question="How does the baryon density determine the universe's primordial light-element budget?"
      dataStatus={dataStatus}
      summary={
        <Text>
          When the universe was three minutes old, it briefly became a fusion
          reactor. The yields — deuterium, helium-4, lithium-7 — all depend on
          one number: the baryon density Ω_b h². Slide it and watch the curves
          shift. The cross-over where all three theory curves match observed
          measurements is the BBN constraint on Ω_b h² ≈ 0.022, in perfect
          agreement with the CMB above. The lithium curve sits ~3× above its
          observed band: the unsolved "lithium problem".
        </Text>
      }
      math={
        <>
          <MathBlock ariaLabel="Saha-like ratio">
            {`\\frac{n_B}{n_\\gamma} \\equiv \\eta \\approx 273.5 \\cdot \\Omega_b h^2 \\cdot 10^{-10}`}
          </MathBlock>
          <Text fontSize="sm" color="navy.200">
            More baryons (larger η) → less deuterium survives (it photoionises
            into helium), more <MathInline>{`Y_p`}</MathInline>, more lithium.
            The abundances come from solving Boltzmann/coupled rate equations
            for the freeze-out of a dozen nuclear species. We ship calibrated
            analytical fits in <Code>src/physics/bbn.ts</Code>; full PArthENoPE
            grids can be swapped in (see fetch.md).
          </Text>
        </>
      }
      plot={
        <MosaicPlot
          spec={spec}
          ariaLabel="BBN light element abundances vs baryon density"
          minHeight="460px"
        />
      }
      controls={
        <SimpleGrid columns={{ base: 1, md: 2 }} spacing={5}>
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
        </SimpleGrid>
      }
      rules={
        <RulesInOut
          rulesIn={[
            "A baryon density Ω_b h² ≈ 0.022 — the same number the CMB gives.",
            "Three real neutrino species — N_eff > 4 or < 2 wrecks Y_p.",
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
            (2015) JCAP 07, 011 for Y_p; Sbordone et al. (2010) A&A 522, A26
            for ⁷Li/H.
          </Text>
          <Text mt={2}>
            See{" "}
            <Link
              href="https://github.com/karthikbadam/known-universe/blob/main/scripts/fetch/bbn.md"
              isExternal
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
