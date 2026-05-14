import { Box, Code, Heading, SimpleGrid, Text, VStack } from "@chakra-ui/react";
import { useMemo, useState } from "react";
import * as vg from "@uwdata/vgplot";

import { MathBlock, MathInline } from "../components/MathBlock";
import { MosaicPlot } from "../components/MosaicPlot";
import { ParamSlider } from "../components/ParamSlider";

import { cmbModelCurve } from "../physics/cmb";
import { muCurve } from "../physics/luminosity";
import { chartPalette } from "../theme/palette";

const PLANCK_2018 = {
  H0: 67.4,
  omegaM: 0.315,
  omegaBh2: 0.02237,
  nS: 0.9649,
  tau: 0.054,
  AsLog: 3.044,
};

interface ParamDescriptor {
  name: string;
  controls: string;
}

const PARAM_DESCRIPTIONS: ReadonlyArray<ParamDescriptor> = [
  { name: "Ω_b h²", controls: "BBN curves; CMB peak heights; baryon ruler in BAO." },
  { name: "Ω_c h²", controls: "Sound horizon size; CMB peak positions; rotation-curve halos." },
  { name: "H₀", controls: "Hubble line slope; SN distance ladder; CMB peak ℓ_1 placement." },
  { name: "τ", controls: "Optical depth to reionization; CMB low-ℓ polarization amplitude." },
  { name: "ln(10¹⁰ A_s)", controls: "Overall amplitude of primordial perturbations." },
  { name: "n_s", controls: "Spectral tilt; CMB high-ℓ tail; tilts the matter power spectrum." },
];

export function LCDMSynthesis(): JSX.Element {
  const [H0, setH0] = useState<number>(PLANCK_2018.H0);
  const [omegaBh2, setOmegaBh2] = useState<number>(PLANCK_2018.omegaBh2);
  const [omegaCh2, setOmegaCh2] = useState<number>(0.120);
  const [tau, setTau] = useState<number>(PLANCK_2018.tau);
  const [as_, setAs] = useState<number>(PLANCK_2018.AsLog);
  const [nS, setNS] = useState<number>(PLANCK_2018.nS);

  const omegaM = useMemo(() => {
    const h = H0 / 100;
    return (omegaBh2 + omegaCh2) / (h * h);
  }, [H0, omegaBh2, omegaCh2]);

  const cmbScaled = useMemo(() => {
    const baseCurve = cmbModelCurve({ H0, omegaM, omegaBh2, nS }, { samples: 500, ellMax: 2500 });
    const amplitude = Math.exp(as_ - PLANCK_2018.AsLog);
    return baseCurve.map((r) => ({ ell: r.ell, Dl: r.Dl * amplitude }));
  }, [H0, omegaM, omegaBh2, nS, as_]);

  const snData = useMemo(
    () =>
      muCurve({ H0, omegaM, omegaLambda: 1 - omegaM }, {
        zMin: 0.005,
        zMax: 2.3,
        samples: 200,
      }),
    [H0, omegaM],
  );

  const cmbSpec = useMemo(
    () => [
      vg.line(cmbScaled, {
        x: "ell",
        y: "Dl",
        stroke: chartPalette.dataFill,
        strokeWidth: 2,
      }),
      vg.xLabel("Multipole ℓ →"),
      vg.yLabel("↑ Dℓ (μK²)"),
      vg.xDomain([0, 2500]),
      vg.yDomain([0, 8000]),
      vg.width(420),
      vg.height(220),
      vg.marginLeft(55),
      vg.marginBottom(35),
    ],
    [cmbScaled],
  );

  const snSpec = useMemo(
    () => [
      vg.line(snData.map((r) => ({ z: r.z, mu: r.mu })), {
        x: "z",
        y: "mu",
        stroke: chartPalette.dataFill,
        strokeWidth: 2,
      }),
      vg.xLabel("Redshift z →"),
      vg.yLabel("↑ Distance modulus μ"),
      vg.xDomain([0.005, 2.3]),
      vg.yDomain([30, 47]),
      vg.width(420),
      vg.height(220),
      vg.marginLeft(55),
      vg.marginBottom(35),
    ],
    [snData],
  );

  // tau slider has no current effect on these two thumbnails (it drives
  // CMB polarization, not the temperature D_ℓ). Referenced here so the
  // setter stays alive and so the cheat sheet below has a value to show.
  void tau;

  return (
    <Box as="section" bg="navy.800" py={{ base: 12, md: 16 }} px={{ base: 4, md: 6 }}>
      <Box maxW="6xl" mx="auto">
        <VStack align="stretch" spacing={4} mb={6}>
          <Text
            color="gold.400"
            fontSize="sm"
            letterSpacing="widest"
            textTransform="uppercase"
            fontFamily="mono"
          >
            10 · Synthesis
          </Text>
          <Heading as="h2" size="xl" lineHeight="short">
            Six numbers, every plot.
          </Heading>
          <Text fontSize="md" color="navy.100" lineHeight="tall">
            Every observation above — the Hubble line, the BBN abundances, the
            CMB peaks, the supernova distances, the BAO ruler, the rotation
            curves — sits in the same parameter space. Drag any of the six
            ΛCDM sliders below and the CMB power spectrum and supernova Hubble
            line shift to match. The other plots scale the same way (re-mount
            this page to compose them).
          </Text>
        </VStack>

        <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6} mb={6}>
          <Box>
            <Text color="navy.300" fontSize="sm" mb={2}>CMB Dℓ vs ℓ</Text>
            <MosaicPlot spec={cmbSpec} ariaLabel="CMB Dℓ thumbnail" minHeight="220px" />
          </Box>
          <Box>
            <Text color="navy.300" fontSize="sm" mb={2}>SN Hubble diagram μ(z)</Text>
            <MosaicPlot spec={snSpec} ariaLabel="Supernova Hubble thumbnail" minHeight="220px" />
          </Box>
        </SimpleGrid>

        <MathBlock ariaLabel="ΛCDM six parameter set">
          {`\\{\\Omega_b h^2,\\; \\Omega_c h^2,\\; H_0,\\; \\tau,\\; A_s,\\; n_s\\}`}
        </MathBlock>
        <Text fontSize="sm" color="navy.200" mb={6}>
          Plus the derived{" "}
          <MathInline>{`\\Omega_m = (\\Omega_b h^2 + \\Omega_c h^2)/h^2`}</MathInline>{" "}
          — currently {omegaM.toFixed(3)} — and{" "}
          <MathInline>{`\\Omega_\\Lambda = 1 - \\Omega_m`}</MathInline> for a
          flat universe.
        </Text>

        <SimpleGrid columns={{ base: 1, md: 3 }} spacing={5}>
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

        <Box mt={8} p={4} bg="navy.900" borderRadius="md" borderWidth={1} borderColor="navy.700">
          <Heading as="h3" size="sm" mb={3} color="gold.300">
            How each parameter touches the other plots
          </Heading>
          <VStack align="stretch" spacing={2}>
            {PARAM_DESCRIPTIONS.map((p) => (
              <Text key={p.name} fontSize="sm" color="navy.100">
                <Code bg="navy.800" color="gold.300">{p.name}</Code>
                {" — "}
                {p.controls}
              </Text>
            ))}
          </VStack>
        </Box>
      </Box>
    </Box>
  );
}
