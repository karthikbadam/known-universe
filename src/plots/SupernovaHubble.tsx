import { Box, Code, Link, SimpleGrid, Switch, Text } from "@chakra-ui/react";
import { useEffect, useMemo, useRef, useState } from "react";
import * as vg from "@uwdata/vgplot";

import { Citation } from "../components/Citation";
import { MathBlock, MathInline } from "../components/MathBlock";
import { ParamSlider } from "../components/ParamSlider";
import { PlotSection } from "../components/PlotSection";
import { RulesInOut } from "../components/RulesInOut";
import { type DataStatus } from "../components/DataStatusBadge";

import { ensureCoordinator, loadTable } from "../mosaic/coordinator";
import { muCurve } from "../physics/luminosity";

const dataStatus: DataStatus = "simulated";
const PANTHEON_TABLE = "pantheon_plus";
const SAMPLES = 240;

export function SupernovaHubble(): JSX.Element {
  const plotRef = useRef<HTMLDivElement | null>(null);
  const [ready, setReady] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [H0, setH0] = useState<number>(70);
  const [omegaM, setOmegaM] = useState<number>(0.3);
  const [omegaLambda, setOmegaLambda] = useState<number>(0.7);
  const [flat, setFlat] = useState<boolean>(true);

  const params = useMemo(() => {
    const ol = flat ? 1 - omegaM : omegaLambda;
    return { H0, omegaM, omegaLambda: ol };
  }, [H0, omegaM, omegaLambda, flat]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        ensureCoordinator();
        await loadTable(PANTHEON_TABLE, "/data/pantheon_plus.csv", { skipHeaderLines: 6 });
        if (!cancelled) setReady(true);
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : String(e));
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const modelCurve = useMemo(
    () => muCurve(params, { zMin: 0.005, zMax: 2.3, samples: SAMPLES }),
    [params],
  );

  useEffect(() => {
    if (!ready || plotRef.current === null) return;
    const modelData = modelCurve.map((row) => ({ z: row.z, mu: row.mu }));
    const element = vg.plot(
      vg.dot(vg.from(PANTHEON_TABLE), {
        x: "z",
        y: "mu",
        r: 2,
        fill: "#f1c156",
        fillOpacity: 0.55,
      }),
      vg.line(modelData, { x: "z", y: "mu", stroke: "#e9eef7", strokeWidth: 2 }),
      vg.xLabel("Redshift z (log) →"),
      vg.yLabel("↑ Distance modulus μ (mag)"),
      vg.xDomain([0.005, 2.3]),
      vg.yDomain([30, 48]),
      vg.width(820),
      vg.height(480),
      vg.marginLeft(70),
      vg.marginBottom(50),
    );
    const host = plotRef.current;
    host.replaceChildren(element as Node);
    return () => {
      host.replaceChildren();
    };
  }, [ready, modelCurve]);

  return (
    <PlotSection
      index={5}
      title="Pantheon+ — supernovae prefer a flat, accelerating universe"
      question="Why do high-z Type Ia supernovae sit above the matter-only line?"
      dataStatus={dataStatus}
      summary={
        <Text>
          Each dot is one Type Ia supernova: a stellar furnace fusion-bomb of
          calibrated luminosity. Plotted against redshift, their distance
          moduli trace the integrated expansion history. A matter-only
          universe predicts the dim straight asymptote at high z; the data
          sits above it. The best fit needs a non-zero{" "}
          <MathInline>{`\\Omega_\\Lambda`}</MathInline> — the dark-energy
          discovery of 1998.
        </Text>
      }
      math={
        <>
          <MathBlock ariaLabel="distance modulus and luminosity distance">
            {`\\mu(z) \\;=\\; 5\\log_{10}\\!\\left(\\frac{d_L(z)}{10\\text{ pc}}\\right) \\qquad d_L(z) \\;=\\; (1+z)\\,\\frac{c}{H_0}\\int_0^z \\frac{dz'}{E(z')}`}
          </MathBlock>
          <Text fontSize="sm" color="navy.200">
            <MathInline>{`E(z) = \\sqrt{\\Omega_m(1+z)^3 + \\Omega_\\Lambda + \\Omega_k(1+z)^2}`}</MathInline>.
            We integrate this with Simpson's rule (80 steps) in{" "}
            <Code>src/physics/luminosity.ts</Code>; curvature is folded in
            exactly via the sinh/sin closing.
          </Text>
        </>
      }
      plot={
        error !== null ? (
          <Box color="red.300" p={4}>
            <Text fontWeight="bold">Plot failed to initialize</Text>
            <Code mt={2} display="block" whiteSpace="pre-wrap" bg="navy.800">
              {error}
            </Code>
          </Box>
        ) : (
          <Box
            ref={plotRef}
            w="100%"
            overflowX="auto"
            sx={{ "& > .plot": { mx: "auto" } }}
            minH="480px"
            aria-label="Hubble diagram of Type Ia supernovae"
            role="img"
          />
        )
      }
      controls={
        <SimpleGrid columns={{ base: 1, md: 2 }} spacing={5}>
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
            bg="navy.800"
            borderRadius="md"
            p={4}
            borderWidth={1}
            borderColor="navy.700"
            display="flex"
            alignItems="center"
            justifyContent="space-between"
          >
            <Box>
              <Text color="navy.100" fontWeight="medium">Flat universe</Text>
              <Text color="navy.300" fontSize="xs">
                Enforces Ω_k = 0 (Ω_Λ = 1 - Ω_m).
              </Text>
            </Box>
            <Switch
              isChecked={flat}
              onChange={(e) => setFlat(e.target.checked)}
              colorScheme="yellow"
            />
          </Box>
        </SimpleGrid>
      }
      rules={
        <RulesInOut
          rulesIn={[
            "Dark energy: Ω_Λ ≈ 0.7 fits supernovae + CMB + BAO simultaneously.",
            "A flat, accelerating universe — Ω_k ≈ 0, dμ/d(ln z) flattens at high z.",
            "Distance modulus as a standard candle — same SN type, same intrinsic luminosity within ~0.1 mag.",
          ]}
          rulesOut={[
            "Matter-only universes (μ would lie ~0.3 mag below the data at z=0.5).",
            "Coasting models (open Ω_m = 0 universes) — the curve shape is wrong.",
            "Strongly curved universes — disfavoured by joint SN + CMB fits.",
          ]}
        />
      }
      citation={
        <Citation title="Data source & provenance">
          <Text>
            Simulated 250 Type Ia SNe drawn from fiducial ΛCDM (H0=70,
            Ω_m=0.3, Ω_Λ=0.7) via{" "}
            <Code>scripts/simulate/pantheon.ts</Code>. Real source:
            Pantheon+ (Brout et al. 2022) ApJ 938, 110. Public data is
            on GitHub; see{" "}
            <Link
              href="https://github.com/karthikbadam/known-universe/blob/main/scripts/fetch/pantheon.md"
              isExternal
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
