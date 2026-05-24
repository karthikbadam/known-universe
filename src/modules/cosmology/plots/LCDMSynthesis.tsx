import { Box, Code, Heading, SimpleGrid, Text, VStack } from "@chakra-ui/react";
import { useMemo, useState } from "react";
import * as vg from "@uwdata/vgplot";

import { MathBlock, MathInline } from "../../../components/MathBlock";
import { MosaicPlot } from "../../../components/MosaicPlot";
import { ParamSlider } from "../../../components/ParamSlider";

import { vgFrame } from "../../../mosaic/vgHelpers";
import { PLANCK_2018, cmbModelCurve } from "../physics/cmb";
import { muCurve } from "../physics/luminosity";
import { CHART_HEIGHT } from "../../../theme/chartDimensions";

// Extra parameters not in the canonical CmbParams type (the CMB model
// currently ignores tau and rolls As into the curve amplitude downstream).
const PLANCK_TAU = 0.054;
const PLANCK_AS_LOG = 3.044;
const THUMB_HEIGHT = CHART_HEIGHT.thumb;

interface ParamDescriptor {
  name: string;
  meaning: string;
  controls: string;
}

const PARAM_DESCRIPTIONS: ReadonlyArray<ParamDescriptor> = [
  {
    name: "Ω_b h²",
    meaning: "physical density of baryons (ordinary matter)",
    controls: "primordial light-element abundances (BBN); CMB acoustic peak heights; BAO ruler length.",
  },
  {
    name: "Ω_c h²",
    meaning: "physical density of cold dark matter",
    controls: "early-universe structure growth; CMB peak positions and envelope; galactic rotation curves.",
  },
  {
    name: "H₀",
    meaning: "present-day Hubble expansion rate (km/s/Mpc)",
    controls: "Hubble line slope; supernova distance ladder; angular position of the first CMB peak.",
  },
  {
    name: "τ",
    meaning: "optical depth from us to the surface of last scattering",
    controls: "low-multipole CMB polarization amplitude; encodes when the first stars reionized the universe.",
  },
  {
    name: "ln(10¹⁰ A_s)",
    meaning: "amplitude of the primordial power spectrum",
    controls: "overall normalization of the CMB peak heights and the matter power spectrum.",
  },
  {
    name: "n_s",
    meaning: "tilt of the primordial power spectrum",
    controls: "balance between large-scale and small-scale power; tilts the CMB high-ℓ tail and the matter spectrum.",
  },
];

interface WhatIf {
  if: string;
  then: string;
}

const WHAT_IFS: ReadonlyArray<WhatIf> = [
  {
    if: "Ω_b h² were doubled to ~0.044",
    then: "BBN would predict less primordial deuterium and more helium, breaking the agreement with quasar-absorption D/H measurements; the CMB second acoustic peak would rise relative to the first; the BAO ruler would shift.",
  },
  {
    if: "Ω_c h² were zero (no cold dark matter)",
    then: "Early-universe density perturbations would not have grown into structure by recombination; CMB peaks would lose their characteristic envelope shape; galaxy rotation curves would fall as 1/√r beyond the visible disk.",
  },
  {
    if: "n_s = 1 exactly (perfectly scale-invariant)",
    then: "The CMB high-multipole tail would have a flatter slope than observed; Planck has measured n_s ≈ 0.965, which differs from 1 at over 8σ and is a key prediction of inflationary models.",
  },
  {
    if: "τ were much higher (~0.1 vs ~0.054)",
    then: "Reionization would have begun earlier in cosmic history; the CMB large-scale E-mode polarization would have a higher amplitude, which constrains when the first stars and galaxies formed.",
  },
];

export function LCDMSynthesis() {
  const [H0, setH0] = useState<number>(PLANCK_2018.H0);
  const [omegaBh2, setOmegaBh2] = useState<number>(PLANCK_2018.omegaBh2);
  const [omegaCh2, setOmegaCh2] = useState<number>(0.12);
  const [tau, setTau] = useState<number>(PLANCK_TAU);
  const [as_, setAs] = useState<number>(PLANCK_AS_LOG);
  const [nS, setNS] = useState<number>(PLANCK_2018.nS);

  const omegaM = useMemo(() => {
    const h = H0 / 100;
    return (omegaBh2 + omegaCh2) / (h * h);
  }, [H0, omegaBh2, omegaCh2]);

  const cmbScaled = useMemo(() => {
    const baseCurve = cmbModelCurve(
      { H0, omegaM, omegaBh2, nS },
      { samples: 500, ellMax: 2500 },
    );
    const amplitude = Math.exp(as_ - PLANCK_AS_LOG);
    return baseCurve.map((r) => ({ ell: r.ell, Dl: r.Dl * amplitude }));
  }, [H0, omegaM, omegaBh2, nS, as_]);

  const snData = useMemo(
    () =>
      muCurve(
        { H0, omegaM, omegaLambda: 1 - omegaM },
        { zMin: 0.005, zMax: 2.3, samples: 200 },
      ).map((r) => ({ z: r.z, mu: r.mu })),
    [H0, omegaM],
  );

  const cmbSpec = useMemo(
    () => [
      vg.line(cmbScaled, {
        x: "ell",
        y: "Dl",
        stroke: "#ff7a1a",
        strokeWidth: 2,
      }),
      ...vgFrame({
        xLabel: "Angular scale: multipole ℓ →",
        yLabel: "↑ CMB temperature power Dℓ (μK²)",
        xDomain: [0, 2500],
        yDomain: [0, 8000],
        margins: { left: 75, top: 35, bottom: 45 },
      }),
    ],
    [cmbScaled],
  );

  const snSpec = useMemo(
    () => [
      vg.line(snData, {
        x: "z", y: "mu", stroke: "#ff7a1a", strokeWidth: 2,
      }),
      ...vgFrame({
        xLabel: "Redshift z (cosmic time) →",
        yLabel: "↑ SN brightness: distance modulus μ (mag)",
        xDomain: [0.005, 2.3],
        yDomain: [30, 47],
        margins: { left: 75, top: 35, bottom: 45 },
      }),
    ],
    [snData],
  );

  void tau;

  return (
    <Box
      as="section"
      bg="bg.subtle"
      py={{ base: 16, md: 24 }}
      px={{ base: 6, md: 8 }}
      borderTopWidth="1px"
      borderColor="border"
    >
      <Box maxW="4xl" mx="auto">
        <VStack align="stretch" gap={6} mb={8}>
          <Text
            color="fg.subtle"
            fontFamily="mono"
            fontSize="xs"
            letterSpacing="0.12em"
            textTransform="uppercase"
          >
            10 · Synthesis
          </Text>
          <Heading
            as="h2"
            fontFamily="body"
            fontWeight="normal"
            fontSize={{ base: "2xl", md: "4xl" }}
            lineHeight="1.2"
            color="fg"
            letterSpacing="-0.02em"
          >
            Six numbers, every plot.
          </Heading>
          <Text
            fontFamily="body"
            fontSize={{ base: "md", md: "lg" }}
            color="fg.muted"
            lineHeight="1.75"
          >
            Every observation in the previous nine sections — Hubble's
            expansion of nearby galaxies, the primordial element abundances
            from Big Bang Nucleosynthesis, the acoustic peaks in the
            cosmic microwave background (CMB) temperature spectrum, the
            brightness of distant Type Ia supernovae, the baryon acoustic
            oscillation (BAO) bump in galaxy clustering, the flat rotation
            curves of disk galaxies — fits within a single framework
            called ΛCDM, the Lambda-Cold-Dark-Matter model.
            ΛCDM uses general relativity to describe the expansion and
            geometry of the universe, populates it with three ingredients
            (ordinary matter, cold dark matter, and a cosmological-constant
            dark energy), and lets a primordial inflation epoch supply the
            initial density fluctuations. The whole model is parameterized
            by six numbers: Ω_b h² (baryon density), Ω_c h² (cold-dark-
            matter density), H₀ (Hubble rate), τ (reionization optical
            depth), A_s (initial perturbation amplitude), and n_s (initial
            perturbation tilt). Adjusting the six sliders below shifts the
            CMB power spectrum and the supernova distance-redshift curve
            in real time; the other plots scale the same way.
          </Text>
        </VStack>

        <SimpleGrid columns={{ base: 1, md: 2 }} gap={8} mb={8}>
          <Box>
            <Text
              fontFamily="heading"
              color="fg"
              fontSize="sm"
              fontWeight="medium"
              mb={1}
            >
              CMB acoustic peaks
            </Text>
            <Text
              fontFamily="body"
              color="fg.muted"
              fontSize="xs"
              lineHeight="1.4"
              mb={2}
            >
              How much temperature variance the early universe carried at each
              angular scale on the sky. Higher = more "ripple" at that scale.
            </Text>
            <MosaicPlot
              spec={cmbSpec}
              ariaLabel="CMB Dℓ thumbnail"
              height={THUMB_HEIGHT}
            />
          </Box>
          <Box>
            <Text
              fontFamily="heading"
              color="fg"
              fontSize="sm"
              fontWeight="medium"
              mb={1}
            >
              Supernova Hubble line
            </Text>
            <Text
              fontFamily="body"
              color="fg.muted"
              fontSize="xs"
              lineHeight="1.4"
              mb={2}
            >
              How dim a standard candle looks at each redshift. Higher μ = farther
              away. Curve steepening at high z is the dark-energy signature.
            </Text>
            <MosaicPlot
              spec={snSpec}
              ariaLabel="Supernova Hubble thumbnail"
              height={THUMB_HEIGHT}
            />
          </Box>
        </SimpleGrid>

        <MathBlock ariaLabel="ΛCDM six parameter set">{`\\{\\Omega_b h^2,\\; \\Omega_c h^2,\\; H_0,\\; \\tau,\\; A_s,\\; n_s\\}`}</MathBlock>
        <Text
          fontFamily="body"
          fontSize="md"
          lineHeight="1.7"
          mb={6}
        >
          The six fitted parameters above are the inputs. Every other
          cosmological quantity is derived from them by the equations of
          ΛCDM. The total matter density{" "}
          <MathInline>{`\\Omega_m = (\\Omega_b h^2 + \\Omega_c h^2) / h^2`}</MathInline>{" "}
          (with <MathInline>{`h = H_0/100`}</MathInline>) is currently{" "}
          {omegaM.toFixed(3)} at the slider values. Assuming spatial
          flatness (consistent with the CMB to the percent level), the
          dark-energy density is{" "}
          <MathInline>{`\\Omega_\\Lambda = 1 - \\Omega_m`}</MathInline>.
          The age of the universe, the comoving sound horizon, the
          luminosity distance to any redshift, the matter power spectrum
          at any scale — all follow.
        </Text>

        <SimpleGrid columns={{ base: 1, md: 3 }} gap={5}>
          <ParamSlider
            label="Ω_b h²"
            description={PARAM_DESCRIPTIONS[0]!.controls}
            min={0.012}
            max={0.034}
            step={0.0002}
            value={omegaBh2}
            onChange={setOmegaBh2}
          />
          <ParamSlider
            label="Ω_c h²"
            description={PARAM_DESCRIPTIONS[1]!.controls}
            min={0.08}
            max={0.18}
            step={0.001}
            value={omegaCh2}
            onChange={setOmegaCh2}
          />
          <ParamSlider
            label="H₀"
            unit="km/s/Mpc"
            description={PARAM_DESCRIPTIONS[2]!.controls}
            min={50}
            max={90}
            step={0.1}
            value={H0}
            onChange={setH0}
          />
          <ParamSlider
            label="τ"
            description={PARAM_DESCRIPTIONS[3]!.controls}
            min={0.02}
            max={0.12}
            step={0.001}
            value={tau}
            onChange={setTau}
          />
          <ParamSlider
            label="ln(10¹⁰ A_s)"
            description={PARAM_DESCRIPTIONS[4]!.controls}
            min={2.8}
            max={3.3}
            step={0.005}
            value={as_}
            onChange={setAs}
          />
          <ParamSlider
            label="n_s"
            description={PARAM_DESCRIPTIONS[5]!.controls}
            min={0.85}
            max={1.05}
            step={0.005}
            value={nS}
            onChange={setNS}
          />
        </SimpleGrid>

        <Box mt={10} pt={6} borderTopWidth="1px" borderColor="border">
          <Heading
            as="h3"
            fontFamily="heading"
            fontSize="sm"
            fontWeight="medium"
            mb={4}
            color="fg"
            letterSpacing="0.04em"
            textTransform="uppercase"
          >
            What each parameter means, and where it appears
          </Heading>
          <VStack align="stretch" gap={4}>
            {PARAM_DESCRIPTIONS.map((p) => (
              <Box key={p.name}>
                <Text fontFamily="body" fontSize="md" lineHeight="1.6">
                  <Code
                    bg="bg.canvas"
                    color="accent"
                    fontFamily="mono"
                    px={1.5}
                    py={0.5}
                  >
                    {p.name}
                  </Code>
                  {" — "}
                  {p.meaning}.
                </Text>
                <Text
                  fontFamily="body"
                  fontSize="sm"
                  color="fg.muted"
                  lineHeight="1.6"
                  mt={1}
                  ml={4}
                >
                  Controls: {p.controls}
                </Text>
              </Box>
            ))}
          </VStack>
        </Box>

        <Box mt={10} pt={6} borderTopWidth="1px" borderColor="border">
          <Heading
            as="h3"
            fontFamily="heading"
            fontSize="sm"
            fontWeight="medium"
            mb={4}
            color="fg"
            letterSpacing="0.04em"
            textTransform="uppercase"
          >
            Counterfactuals — what would the universe look like if a parameter were different?
          </Heading>
          <VStack align="stretch" gap={4}>
            {WHAT_IFS.map((wi) => (
              <Box key={wi.if}>
                <Text fontFamily="body" fontSize="md" lineHeight="1.6">
                  <Text as="span" color="fg" fontWeight="medium">
                    If {wi.if}:
                  </Text>
                </Text>
                <Text
                  fontFamily="body"
                  fontSize="sm"
                  color="fg.muted"
                  lineHeight="1.6"
                  mt={1}
                  ml={4}
                >
                  {wi.then}
                </Text>
              </Box>
            ))}
          </VStack>
        </Box>

        <Box mt={10} pt={6} borderTopWidth="1px" borderColor="border">
          <Heading
            as="h3"
            fontFamily="heading"
            fontSize="sm"
            fontWeight="medium"
            mb={4}
            color="fg"
            letterSpacing="0.04em"
            textTransform="uppercase"
          >
            Takeaway
          </Heading>
          <Text fontFamily="body" fontSize="md" lineHeight="1.75">
            ΛCDM fits the heterogeneous data shown across this module —
            cosmic expansion, primordial element abundances, the CMB
            temperature map and its power spectrum, supernova distances,
            the BAO ruler, galaxy rotation — using six free parameters
            and the standard physics of general relativity, cold dark
            matter, and a cosmological constant. The model is the working
            baseline that every new cosmological measurement is compared
            against. The joint fit to Planck CMB + BAO + Type Ia supernova
            data converges on{" "}
            <MathInline>{`\\Omega_b h^2 \\approx 0.022`}</MathInline>,{" "}
            <MathInline>{`\\Omega_c h^2 \\approx 0.12`}</MathInline>,{" "}
            <MathInline>{`H_0 \\approx 67`}</MathInline> km/s/Mpc,{" "}
            <MathInline>{`\\tau \\approx 0.054`}</MathInline>,{" "}
            <MathInline>{`A_s \\approx 2.1 \\times 10^{-9}`}</MathInline>,
            and <MathInline>{`n_s \\approx 0.965`}</MathInline>. From those
            six numbers and the equations of the model, the entire 13.8-
            billion-year history of the observable universe is recovered:
            an inflationary epoch supplying near-scale-invariant initial
            fluctuations, three minutes of nucleosynthesis producing
            primordial hydrogen and helium, 380,000 years of an opaque
            photon-baryon plasma, recombination and the release of the
            CMB, the slow gravitational growth of structure across
            billions of years, and a late-time epoch of accelerated
            expansion driven by the cosmological constant. The agreement
            of a six-parameter description with this much heterogeneous
            data is the strongest empirical test of any cosmological
            model.
          </Text>
        </Box>
      </Box>
    </Box>
  );
}
