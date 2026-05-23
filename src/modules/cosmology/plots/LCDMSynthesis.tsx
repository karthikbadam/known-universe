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
import { useChartPalette } from "../../../theme/palette";

// Extra parameters not in the canonical CmbParams type (the CMB model
// currently ignores tau and rolls As into the curve amplitude downstream).
const PLANCK_TAU = 0.054;
const PLANCK_AS_LOG = 3.044;
const THUMB_HEIGHT = CHART_HEIGHT.thumb;

interface ParamDescriptor {
  name: string;
  controls: string;
}

const PARAM_DESCRIPTIONS: ReadonlyArray<ParamDescriptor> = [
  {
    name: "Ω_b h²",
    controls: "BBN curves; CMB peak heights; baryon ruler in BAO.",
  },
  {
    name: "Ω_c h²",
    controls: "Sound horizon size; CMB peak positions; rotation-curve halos.",
  },
  {
    name: "H₀",
    controls: "Hubble line slope; SN distance ladder; CMB peak ℓ_1 placement.",
  },
  {
    name: "τ",
    controls:
      "Optical depth to reionization; CMB low-ℓ polarization amplitude.",
  },
  {
    name: "ln(10¹⁰ A_s)",
    controls: "Overall amplitude of primordial perturbations.",
  },
  {
    name: "n_s",
    controls:
      "Spectral tilt; CMB high-ℓ tail; tilts the matter power spectrum.",
  },
];

export function LCDMSynthesis() {
  const palette = useChartPalette();
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
        stroke: palette.dataFill,
        strokeWidth: 2,
      }),
      ...vgFrame({
        xLabel: "Multipole ℓ →",
        yLabel: "↑ Dℓ (μK²)",
        xDomain: [0, 2500],
        yDomain: [0, 8000],
        margins: { left: 65, top: 35, bottom: 45 },
      }),
    ],
    [cmbScaled, palette],
  );

  const snSpec = useMemo(
    () => [
      vg.line(snData, {
        x: "z", y: "mu", stroke: palette.dataFill, strokeWidth: 2,
      }),
      ...vgFrame({
        xLabel: "Redshift z →",
        yLabel: "↑ Distance modulus μ",
        xDomain: [0.005, 2.3],
        yDomain: [30, 47],
        margins: { left: 65, top: 35, bottom: 45 },
      }),
    ],
    [snData, palette],
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
            Every observation above, the Hubble line, the BBN abundances, the
            CMB peaks, the supernova distances, the BAO ruler, the rotation
            curves, sits in the same parameter space, the six-parameter
            ΛCDM (Lambda-Cold Dark Matter) model. Drag any of the sliders
            below and the CMB power spectrum and supernova Hubble line shift
            to match. The other plots scale the same way (re-mount this page
            to compose them).
          </Text>
        </VStack>

        <SimpleGrid columns={{ base: 1, md: 2 }} gap={8} mb={8}>
          <Box>
            <Text
              fontFamily="mono"
              color="fg.subtle"
              fontSize="xs"
              letterSpacing="0.08em"
              mb={2}
            >
              CMB Dℓ vs ℓ
            </Text>
            <MosaicPlot
              spec={cmbSpec}
              ariaLabel="CMB Dℓ thumbnail"
              height={THUMB_HEIGHT}
            />
          </Box>
          <Box>
            <Text
              fontFamily="mono"
              color="fg.subtle"
              fontSize="xs"
              letterSpacing="0.08em"
              mb={2}
            >
              SN Hubble diagram μ(z)
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
          color="fg.muted"
          lineHeight="1.7"
          mb={6}
        >
          Plus the derived{" "}
          <MathInline>{`\\Omega_m = (\\Omega_b h^2 + \\Omega_c h^2)/h^2`}</MathInline>
          , currently {omegaM.toFixed(3)}, and{" "}
          <MathInline>{`\\Omega_\\Lambda = 1 - \\Omega_m`}</MathInline> for a
          flat universe.
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
            How each parameter touches the other plots
          </Heading>
          <VStack align="stretch" gap={3}>
            {PARAM_DESCRIPTIONS.map((p) => (
              <Text
                key={p.name}
                fontFamily="body"
                fontSize="md"
                color="fg"
                lineHeight="1.6"
              >
                <Code
                  bg="bg.canvas"
                  color="accent"
                  fontFamily="mono"
                  px={1.5}
                  py={0.5}
                >
                  {p.name}
                </Code>
                {", "}
                <Text as="span" color="fg.muted">
                  {p.controls}
                </Text>
              </Text>
            ))}
          </VStack>
        </Box>
      </Box>
    </Box>
  );
}
