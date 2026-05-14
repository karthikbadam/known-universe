import { Box, Code, Heading, SimpleGrid, Text, VStack } from "@chakra-ui/react";
import { useEffect, useMemo, useRef, useState } from "react";
import * as vg from "@uwdata/vgplot";

import { MathBlock, MathInline } from "../components/MathBlock";
import { ParamSlider } from "../components/ParamSlider";

import { cmbModelCurve } from "../physics/cmb";
import { muCurve } from "../physics/luminosity";

const PLANCK_2018 = {
  H0: 67.4,
  omegaM: 0.315,
  omegaBh2: 0.02237,
  nS: 0.9649,
  tau: 0.054,
  AsLog: 3.044,
};

const PARAM_DESCRIPTIONS: { name: string; key: keyof typeof PLANCK_2018; controls: string }[] = [
  { name: "Ω_b h²", key: "omegaBh2", controls: "BBN curves; CMB peak heights; baryon ruler in BAO." },
  { name: "Ω_c h²", key: "omegaM", controls: "Sound horizon size; CMB peak positions; rotation-curve halos." },
  { name: "H₀", key: "H0", controls: "Hubble line slope; SN distance ladder; CMB peak ℓ_1 placement." },
  { name: "τ", key: "tau", controls: "Optical depth to reionization; CMB low-ℓ polarization amplitude." },
  { name: "ln(10¹⁰ A_s)", key: "AsLog", controls: "Overall amplitude of primordial perturbations." },
  { name: "n_s", key: "nS", controls: "Spectral tilt; CMB high-ℓ tail; tilts the matter power spectrum." },
];

export function LCDMSynthesis(): JSX.Element {
  const [H0, setH0] = useState<number>(PLANCK_2018.H0);
  const [omegaBh2, setOmegaBh2] = useState<number>(PLANCK_2018.omegaBh2);
  const [omegaCh2, setOmegaCh2] = useState<number>(0.120);
  const [tau, setTau] = useState<number>(PLANCK_2018.tau);
  const [As, setAs] = useState<number>(PLANCK_2018.AsLog);
  const [nS, setNS] = useState<number>(PLANCK_2018.nS);

  const omegaM = useMemo(() => {
    const h = H0 / 100;
    return (omegaBh2 + omegaCh2) / (h * h);
  }, [H0, omegaBh2, omegaCh2]);

  const cmbRef = useRef<HTMLDivElement | null>(null);
  const snRef = useRef<HTMLDivElement | null>(null);

  const cmbData = useMemo(
    () => cmbModelCurve({ H0, omegaM, omegaBh2, nS }, { samples: 500, ellMax: 2500 }),
    [H0, omegaM, omegaBh2, nS],
  );
  const snData = useMemo(
    () =>
      muCurve({ H0, omegaM, omegaLambda: 1 - omegaM }, {
        zMin: 0.005,
        zMax: 2.3,
        samples: 200,
      }),
    [H0, omegaM],
  );

  const cmbScaled = useMemo(
    () =>
      cmbData.map((r) => ({
        ell: r.ell,
        Dl: r.Dl * Math.exp(As - PLANCK_2018.AsLog),
      })),
    [cmbData, As],
  );

  useEffect(() => {
    if (cmbRef.current === null) return;
    const el = vg.plot(
      vg.line(cmbScaled, { x: "ell", y: "Dl", stroke: "#f1c156", strokeWidth: 2 }),
      vg.xLabel("Multipole ℓ →"),
      vg.yLabel("↑ Dℓ (μK²)"),
      vg.xDomain([0, 2500]),
      vg.yDomain([0, 8000]),
      vg.width(420),
      vg.height(220),
      vg.marginLeft(55),
      vg.marginBottom(35),
    );
    cmbRef.current.replaceChildren(el as Node);
    return () => {
      cmbRef.current?.replaceChildren();
    };
  }, [cmbScaled]);

  useEffect(() => {
    if (snRef.current === null) return;
    const el = vg.plot(
      vg.line(snData, { x: "z", y: "mu", stroke: "#f1c156", strokeWidth: 2 }),
      vg.xLabel("Redshift z →"),
      vg.yLabel("↑ Distance modulus μ"),
      vg.xDomain([0.005, 2.3]),
      vg.yDomain([30, 47]),
      vg.width(420),
      vg.height(220),
      vg.marginLeft(55),
      vg.marginBottom(35),
    );
    snRef.current.replaceChildren(el as Node);
    return () => {
      snRef.current?.replaceChildren();
    };
  }, [snData]);

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
            ΛCDM sliders below and the CMB power spectrum and supernova
            Hubble line shift to match. The other plots scale the same way
            (re-mount this page to compose them).
          </Text>
        </VStack>

        <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6} mb={6}>
          <Box>
            <Text color="navy.300" fontSize="sm" mb={2}>
              CMB Dℓ vs ℓ
            </Text>
            <Box ref={cmbRef} minH="220px" />
          </Box>
          <Box>
            <Text color="navy.300" fontSize="sm" mb={2}>
              SN Hubble diagram μ(z)
            </Text>
            <Box ref={snRef} minH="220px" />
          </Box>
        </SimpleGrid>

        <MathBlock ariaLabel="ΛCDM six parameter set">
          {`\\{\\Omega_b h^2,\\; \\Omega_c h^2,\\; H_0,\\; \\tau,\\; A_s,\\; n_s\\}`}
        </MathBlock>
        <Text fontSize="sm" color="navy.200" mb={6}>
          Plus the derived <MathInline>{`\\Omega_m = (\\Omega_b h^2 + \\Omega_c h^2)/h^2`}</MathInline>
          {" "}— currently {omegaM.toFixed(3)} — and{" "}
          <MathInline>{`\\Omega_\\Lambda = 1 - \\Omega_m`}</MathInline> for a flat universe.
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
            value={As}
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
