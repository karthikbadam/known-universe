import { Box, Code, Link, NativeSelect, Text, VStack } from "@chakra-ui/react";
import { useEffect, useMemo, useState } from "react";
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
import { rotationCurve } from "../physics/nfw";
import { CHART_HEIGHT } from "../../../theme/chartDimensions";
import { useChartPalette } from "../../../theme/palette";

const PLOT_HEIGHT = CHART_HEIGHT.standard;

const KIND_ORDER = ["total", "baryonic", "dark halo"] as const;
const KIND_COLOR: Record<(typeof KIND_ORDER)[number], string> = {
  total: "#ff7a1a",
  baryonic: "#e6c84a",
  "dark halo": "#9aa0a6",
};
const KIND_MEANING: Record<(typeof KIND_ORDER)[number], string> = {
  total: "Combined: baryons + NFW halo (quadrature)",
  baryonic: "Visible mass only (disk + gas + bulge)",
  "dark halo": "NFW dark-matter halo contribution",
};

interface GalaxyDefaults {
  diskMassSolar: number; scaleKpc: number; rsKpc: number;
  rhoSMsunPerKpc3: number; rMaxKpc: number; vMax: number;
}

const GALAXY_DEFAULTS: Record<string, GalaxyDefaults> = {
  "NGC 3198": { diskMassSolar: 3e10, scaleKpc: 2.6, rsKpc: 10, rhoSMsunPerKpc3: 9e6, rMaxKpc: 32, vMax: 200 },
  "DDO 154": { diskMassSolar: 2.5e8, scaleKpc: 0.8, rsKpc: 3.5, rhoSMsunPerKpc3: 8e6, rMaxKpc: 9, vMax: 60 },
  "UGC 2885": { diskMassSolar: 1.5e11, scaleKpc: 6, rsKpc: 24, rhoSMsunPerKpc3: 6e6, rMaxKpc: 64, vMax: 320 },
};

export function RotationCurves() {
  const palette = useChartPalette();
  const { ready, error } = useDataTable(TABLES.sparcGalaxies.name, TABLES.sparcGalaxies.url, { skipHeaderLines: TABLES.sparcGalaxies.skipHeaderLines });
  const [galaxy, setGalaxy] = useState<string>("NGC 3198");
  const defaults = GALAXY_DEFAULTS[galaxy]!;
  const [rsKpc, setRsKpc] = useState<number>(defaults.rsKpc);
  const [rhoLog, setRhoLog] = useState<number>(Math.log10(defaults.rhoSMsunPerKpc3));

  useEffect(() => {
    setRsKpc(defaults.rsKpc);
    setRhoLog(Math.log10(defaults.rhoSMsunPerKpc3));
  }, [galaxy, defaults]);

  const modelLines = useMemo(() => {
    const curve = rotationCurve(defaults.diskMassSolar, defaults.scaleKpc,
      { rsKpc, rhoSMsunPerKpc3: Math.pow(10, rhoLog) },
      { rMinKpc: 0.4, rMaxKpc: defaults.rMaxKpc, samples: 120 });
    return [
      ...curve.map((r) => ({ r: r.r, v: r.vTot, kind: "total" })),
      ...curve.map((r) => ({ r: r.r, v: r.vBary, kind: "baryonic" })),
      ...curve.map((r) => ({ r: r.r, v: r.vDm, kind: "dark halo" })),
    ];
  }, [defaults, rsKpc, rhoLog]);

  const spec = useMemo(() => [
    vg.ruleX(vg.from(TABLES.sparcGalaxies.name), {
      x: "r_kpc", y1: vg.sql`v_kms - sigma_kms`, y2: vg.sql`v_kms + sigma_kms`,
      stroke: palette.errorStroke, strokeWidth: 1, strokeOpacity: 0.5,
    }),
    vg.dot(vg.from(TABLES.sparcGalaxies.name), {
      x: "r_kpc", y: "v_kms", r: 3, fill: palette.modelStroke, stroke: palette.modelStroke,
    }),
    vg.line(modelLines, { x: "r", y: "v", stroke: "kind", strokeWidth: 2, z: "kind" }),
    ...vgFrame({
      xLabel: "Radius (kpc) →",
      yLabel: "↑ v (km/s)",
      xDomain: [0, defaults.rMaxKpc],
      yDomain: [0, defaults.vMax],
    }),
    (plot: { attributes: Record<string, unknown> }) => {
      plot.attributes.colorDomain = [...KIND_ORDER];
      plot.attributes.colorRange = KIND_ORDER.map((k) => KIND_COLOR[k]);
    },
  ], [modelLines, defaults, palette]);

  return (
    <PlotSection
      index={6}
      title="Galaxy rotation curves, dark matter at the disk edge"
      question="Why do stars at the edges of galaxies orbit faster than the visible mass can account for?"
      summary={
        <Text>
          For an object in a circular orbit, gravity sets the speed: the
          farther out you go beyond the bulk of the mass, the slower the
          orbit should be. Specifically, beyond the visible edge of a
          galaxy's disk, orbital speed should fall off as 1 over the square
          root of radius — the same way planets in the outer solar system
          orbit slower than planets in the inner solar system. But when you
          measure orbital speeds of stars and gas at the outskirts of real
          galaxies, the curves do not fall off. They stay flat or even
          rise. Either Newtonian gravity breaks at galactic scales, or
          there is unseen mass continuing to contribute well past the
          visible edge.
        </Text>
      }
      math={
        <>
          <MathBlock ariaLabel="Newtonian rotation velocity">{`v(r) \\;=\\; \\sqrt{\\frac{G\\, M(<r)}{r}} \\qquad M_{\\rm NFW}(<r) \\;=\\; 4\\pi\\rho_s r_s^3 \\left[\\ln(1+x) - \\frac{x}{1+x}\\right]`}</MathBlock>
          <Text fontFamily="body" fontSize="sm" lineHeight="1.7">
            <MathInline>{`v(r)`}</MathInline> is the orbital speed in km/s
            at a radius <MathInline>{`r`}</MathInline> from the galactic
            center, set by the total mass{" "}
            <MathInline>{`M(<r)`}</MathInline> enclosed within that radius
            and the gravitational constant <MathInline>{`G`}</MathInline>.
            In the visible-matter-only picture,{" "}
            <MathInline>{`M(<r)`}</MathInline> stops growing once you pass
            the disk and bulge, so <MathInline>{`v(r)`}</MathInline> falls
            as <MathInline>{`1/\\sqrt{r}`}</MathInline>. To match the flat
            curves, an additional dark-matter halo is added with the NFW
            density profile (Navarro–Frenk–White): two parameters set the
            halo, the scale radius{" "}
            <MathInline>{`r_s`}</MathInline> (where the profile transitions
            from <MathInline>{`\\rho \\propto r^{-1}`}</MathInline> to{" "}
            <MathInline>{`\\rho \\propto r^{-3}`}</MathInline>) and the
            characteristic density{" "}
            <MathInline>{`\\rho_s`}</MathInline>, with{" "}
            <MathInline>{`x = r/r_s`}</MathInline>. On the plot, the x-axis
            is galactocentric radius in kiloparsecs (one kpc ≈ 3,260
            light-years) and the y-axis is rotation velocity in km/s. The
            orange dots are observations of the selected galaxy from the
            Spitzer Photometry & Accurate Rotation Curves (SPARC) survey,
            with
            vertical 1σ uncertainty bars. The three curves decompose the
            model: yellow is the baryonic contribution (visible disk + gas
            + bulge), grey is the NFW dark-halo contribution, and orange is
            their quadrature sum — the total predicted rotation curve at
            the slider values.
          </Text>
        </>
      }
      plot={error !== null ? <PlotError message={error} /> : (
        <MosaicPlot spec={spec} enabled={ready} ariaLabel={`Rotation curve of ${galaxy} with model decomposition`} height={PLOT_HEIGHT} />
      )}
      legend={
        <PlotLegend
          items={[
            { name: "V_obs", description: "Observed orbital speeds (SPARC, with 1σ bars)", color: palette.modelStroke, mark: "dot" },
            ...KIND_ORDER.map((kind) => ({
              name: `V_${kind.replace(" halo", "")}`,
              description: KIND_MEANING[kind],
              color: KIND_COLOR[kind],
              mark: "line" as const,
            })),
          ]}
        />
      }
      controls={
        <VStack align="stretch" gap={5}>
          <Box>
            <Text fontFamily="heading" color="fg" fontWeight="medium" fontSize="sm" mb={2}>Galaxy</Text>
            <NativeSelect.Root size="sm" bg="bg.canvas" borderColor="border">
              <NativeSelect.Field value={galaxy} onChange={(e) => setGalaxy(e.target.value)} fontFamily="mono">
                {Object.keys(GALAXY_DEFAULTS).map((g) => <option key={g} value={g}>{g}</option>)}
              </NativeSelect.Field>
              <NativeSelect.Indicator />
            </NativeSelect.Root>
          </Box>
          <ParamSlider label="NFW scale radius r_s" unit="kpc" description="Where the halo density profile transitions from ρ ∝ r⁻¹ to ρ ∝ r⁻³." min={1} max={40} step={0.5} value={rsKpc} onChange={setRsKpc} />
          <ParamSlider label="log₁₀(ρ_s)" unit="M_☉/kpc³" description="Characteristic NFW density. Calibrated per-galaxy in fits." min={5.5} max={8} step={0.05} value={rhoLog} onChange={setRhoLog} />
        </VStack>
      }
      rules={
        <RulesInOut
          rulesIn={[
            "An additional, unseen mass component extending well past the visible galaxy edge — the modern interpretation is cold dark matter.",
            "The NFW halo profile fits the SPARC sample to roughly 5–10% accuracy across orders of magnitude in galaxy mass.",
            "The Bullet Cluster (1E 0657-558) shows the dark mass spatially separated from ordinary matter after a cluster collision — the most direct observational evidence for dark matter.",
          ]}
          rulesOut={[
            "Pure Newtonian gravity with only visible matter — orbital speeds would fall as 1/√r beyond the disk.",
            "A universe with no dark matter at all — rotation curves at galaxy edges would be about 5× lower than observed.",
          ]}
        />
      }
      takeaway={
        <Text>
          Across the SPARC sample of 175 disk galaxies (and similar data
          from many other surveys), the same pattern holds: visible-matter
          gravity alone consistently under-predicts rotation speeds beyond
          the bright stellar disk by roughly a factor of five. Adding an
          NFW halo with two fit parameters per galaxy reproduces the
          observed curves at the 5–10% level. The independent line of
          evidence is the Bullet Cluster: in this colliding pair of galaxy
          clusters, the X-ray-emitting gas (most of the ordinary matter)
          is offset from the gravitational mass (mapped via weak lensing),
          which means the gravitating mass is something other than the gas.
          Together with the cosmic-microwave-background acoustic-peak
          amplitudes that fix{" "}
          <MathInline>{`\\Omega_c h^2 \\approx 0.12`}</MathInline> at
          recombination, rotation curves and the Bullet Cluster make cold
          dark matter the most strongly constrained component of the
          ΛCDM (Lambda-Cold-Dark-Matter) model after baryons themselves. What dark matter actually is — a
          weakly interacting massive particle, an axion, a sterile
          neutrino, primordial black holes — remains an open question being
          attacked by direct-detection, collider, and astrophysical
          searches.
        </Text>
      }
      citation={
        <Citation title="Data source & provenance">
          <Text>
            SPARC rotation curves for DDO 154 (dwarf), NGC 3198 (MW-class),
            and UGC 2885 (giant), from <Code>table2.dat</Code> on VizieR;
            <MathInline>{` V_{obs}`}</MathInline>,{" "}
            <MathInline>{`\\sigma_V`}</MathInline>, and a signed-quadrature{" "}
            <MathInline>{`V_{baryonic} = \\sqrt{V_{gas}^2 + V_{disk}^2 + V_{bulge}^2}`}</MathInline>{" "}
            at <MathInline>{`M/L = 1`}</MathInline>. Source: Lelli,
            McGaugh, Schombert (2016) AJ 152, 157. See{" "}
            <Link
              href="https://github.com/karthikbadam/known-universe/blob/main/scripts/fetch/sparc.md"
              target="_blank"
              rel="noopener noreferrer"
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
