import { Box, Code, Link, Select, SimpleGrid, Text } from "@chakra-ui/react";
import { useEffect, useMemo, useRef, useState } from "react";
import * as vg from "@uwdata/vgplot";

import { Citation } from "../components/Citation";
import { MathBlock, MathInline } from "../components/MathBlock";
import { ParamSlider } from "../components/ParamSlider";
import { PlotSection } from "../components/PlotSection";
import { RulesInOut } from "../components/RulesInOut";
import { type DataStatus } from "../components/DataStatusBadge";

import { ensureCoordinator, loadTable } from "../mosaic/coordinator";
import { rotationCurve } from "../physics/nfw";

const dataStatus: DataStatus = "simulated";
const SPARC_TABLE = "sparc_galaxies";

interface GalaxyDefaults {
  diskMassSolar: number;
  scaleKpc: number;
  rsKpc: number;
  rhoSMsunPerKpc3: number;
  rMaxKpc: number;
  vMax: number;
}

const GALAXY_DEFAULTS: Record<string, GalaxyDefaults> = {
  "NGC 3198": { diskMassSolar: 3e10, scaleKpc: 2.6, rsKpc: 10, rhoSMsunPerKpc3: 9e6, rMaxKpc: 32, vMax: 200 },
  "DDO 154": { diskMassSolar: 2.5e8, scaleKpc: 0.8, rsKpc: 3.5, rhoSMsunPerKpc3: 8e6, rMaxKpc: 9, vMax: 60 },
  "UGC 2885": { diskMassSolar: 1.5e11, scaleKpc: 6, rsKpc: 24, rhoSMsunPerKpc3: 6e6, rMaxKpc: 64, vMax: 320 },
};

export function RotationCurves(): JSX.Element {
  const plotRef = useRef<HTMLDivElement | null>(null);
  const [ready, setReady] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [galaxy, setGalaxy] = useState<string>("NGC 3198");
  const defaults = GALAXY_DEFAULTS[galaxy]!;
  const [rsKpc, setRsKpc] = useState<number>(defaults.rsKpc);
  const [rhoLog, setRhoLog] = useState<number>(Math.log10(defaults.rhoSMsunPerKpc3));

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        ensureCoordinator();
        await loadTable(SPARC_TABLE, "/data/sparc_galaxies.csv", { skipHeaderLines: 6 });
        if (!cancelled) setReady(true);
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : String(e));
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    setRsKpc(defaults.rsKpc);
    setRhoLog(Math.log10(defaults.rhoSMsunPerKpc3));
  }, [galaxy, defaults]);

  const modelLines = useMemo(() => {
    const curve = rotationCurve(
      defaults.diskMassSolar,
      defaults.scaleKpc,
      { rsKpc, rhoSMsunPerKpc3: Math.pow(10, rhoLog) },
      { rMinKpc: 0.4, rMaxKpc: defaults.rMaxKpc, samples: 120 },
    );
    const tot = curve.map((r) => ({ r: r.r, v: r.vTot, kind: "total" }));
    const bar = curve.map((r) => ({ r: r.r, v: r.vBary, kind: "baryonic" }));
    const dm = curve.map((r) => ({ r: r.r, v: r.vDm, kind: "dark halo" }));
    return [...tot, ...bar, ...dm];
  }, [defaults, rsKpc, rhoLog]);

  useEffect(() => {
    if (!ready || plotRef.current === null) return;
    const element = vg.plot(
      vg.ruleX(vg.from(SPARC_TABLE), {
        x: "r_kpc",
        y1: vg.sql`v_kms - sigma_kms`,
        y2: vg.sql`v_kms + sigma_kms`,
        stroke: "#a3b3d2",
        strokeWidth: 1,
        strokeOpacity: 0.5,
      }),
      vg.dot(vg.from(SPARC_TABLE), {
        x: "r_kpc",
        y: "v_kms",
        r: 3,
        fill: "#f1c156",
        stroke: "#e8ad2a",
      }),
      vg.line(modelLines, {
        x: "r",
        y: "v",
        stroke: "kind",
        strokeWidth: 2,
        z: "kind",
      }),
      vg.xLabel("Radius (kpc) →"),
      vg.yLabel("↑ v (km/s)"),
      vg.xDomain([0, defaults.rMaxKpc]),
      vg.yDomain([0, defaults.vMax]),
      vg.width(820),
      vg.height(440),
      vg.marginLeft(60),
      vg.marginBottom(50),
    );
    const host = plotRef.current;
    host.replaceChildren(element as Node);
    return () => {
      host.replaceChildren();
    };
  }, [ready, modelLines, defaults]);

  return (
    <PlotSection
      index={6}
      title="Galaxy rotation curves — dark matter at the disk edge"
      question="Why do galaxies rotate as if there's invisible mass holding them together?"
      dataStatus={dataStatus}
      summary={
        <Text>
          Newtonian gravity predicts that, beyond the visible disk, the
          orbital speed of stars and gas should fall as 1/√r. SPARC data
          says it doesn't — the curves stay flat or even rise. Either gravity
          breaks at galactic scales, or an unseen halo of dark matter
          contributes extra enclosed mass. The dashed "baryonic" curve shows
          what visible mass alone predicts; the gap is what dark matter has
          to fill.
        </Text>
      }
      math={
        <>
          <MathBlock ariaLabel="Newtonian rotation velocity">
            {`v(r) \\;=\\; \\sqrt{\\frac{G M(<r)}{r}} \\qquad M_{\\rm NFW}(<r) \\;=\\; 4\\pi\\rho_s r_s^3 \\left[\\ln(1+x) - \\frac{x}{1+x}\\right]`}
          </MathBlock>
          <Text fontSize="sm" color="navy.200">
            <MathInline>{`x = r/r_s`}</MathInline>. The total enclosed mass
            is the baryonic disk plus an NFW halo. The two sliders pick the
            halo scale radius and characteristic density; the total curve
            (top) is the quadrature sum of baryonic and DM contributions.
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
            minH="440px"
            aria-label={`Rotation curve of ${galaxy} with model decomposition`}
            role="img"
          />
        )
      }
      controls={
        <SimpleGrid columns={{ base: 1, md: 3 }} spacing={5}>
          <Box>
            <Text color="navy.100" fontWeight="medium" mb={2}>
              Galaxy
            </Text>
            <Select
              size="sm"
              variant="filled"
              bg="navy.800"
              borderColor="navy.600"
              value={galaxy}
              onChange={(e) => setGalaxy(e.target.value)}
            >
              {Object.keys(GALAXY_DEFAULTS).map((g) => (
                <option key={g} value={g}>
                  {g}
                </option>
              ))}
            </Select>
          </Box>
          <ParamSlider
            label="NFW scale radius r_s"
            unit="kpc"
            description="Where the halo density profile transitions from ρ ∝ r⁻¹ to ρ ∝ r⁻³."
            min={1}
            max={40}
            step={0.5}
            value={rsKpc}
            onChange={setRsKpc}
          />
          <ParamSlider
            label="log₁₀(ρ_s)"
            unit="M_☉/kpc³"
            description="Characteristic NFW density. Calibrated per-galaxy in fits."
            min={5.5}
            max={8}
            step={0.05}
            value={rhoLog}
            onChange={setRhoLog}
          />
        </SimpleGrid>
      }
      rules={
        <RulesInOut
          rulesIn={[
            "Extra unseen mass at the galaxy edge — the modern view: cold dark matter.",
            "NFW profile fits the SPARC sample to ~5-10% across orders of magnitude in galaxy mass.",
            "The Bullet Cluster (1E 0657-558) shows DM and ordinary matter spatially separated in a collision — most direct DM evidence.",
          ]}
          rulesOut={[
            "Pure Newtonian gravity with only visible baryons (curves would fall as 1/√r).",
            "Some MOND-like modifications, where ρ_s wouldn't be needed at all.",
            "A universe with no dark matter (rotation curves should diverge by 5× at galaxy edges).",
          ]}
        />
      }
      citation={
        <Citation title="Data source & provenance">
          <Text>
            Simulated rotation curves for three template galaxies (dwarf
            DDO 154, MW-class NGC 3198, giant UGC 2885) generated by{" "}
            <Code>scripts/simulate/sparc.ts</Code> from the NFW + baryonic
            disk model in <Code>src/physics/nfw.ts</Code>. Real source:
            SPARC database, Lelli et al. (2016).{" "}
            <Link
              href="https://github.com/karthikbadam/known-universe/blob/main/scripts/fetch/sparc.md"
              isExternal
            >
              /scripts/fetch/sparc.md
            </Link>
            .
          </Text>
        </Citation>
      }
    />
  );
}
