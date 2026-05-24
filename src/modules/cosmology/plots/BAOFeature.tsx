import { Link, Stack, Text } from "@chakra-ui/react";
import { useMemo, useState } from "react";
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
import { SOUND_HORIZON_FIDUCIAL_MPC, baoCurve } from "../physics/bao";
import { CHART_HEIGHT } from "../../../theme/chartDimensions";
import { useChartPalette } from "../../../theme/palette";

const PLOT_HEIGHT = CHART_HEIGHT.standard;

const COLOR_MODEL = "#ff7a1a";
const COLOR_GUIDE = "#9aa0a6";

const vgX = vg as unknown as {
  text: (source: unknown, options: Record<string, unknown>) => unknown;
};

function xiAtS(
  curve: ReadonlyArray<{ s: number; xi: number }>,
  s: number,
): number {
  let best = curve[0];
  let bestDist = Infinity;
  for (const p of curve) {
    const d = Math.abs(p.s - s);
    if (d < bestDist) {
      bestDist = d;
      best = p;
    }
  }
  return best?.xi ?? 0;
}

export function BAOFeature() {
  const palette = useChartPalette();
  const { ready, error } = useDataTable(TABLES.bossXi.name, TABLES.bossXi.url, { skipHeaderLines: TABLES.bossXi.skipHeaderLines });
  const [rd, setRd] = useState<number>(SOUND_HORIZON_FIDUCIAL_MPC);
  const modelCurve = useMemo(
    () => baoCurve(rd, { sMinMpc: 50, sMaxMpc: 200, samples: 400 }).map((row) => ({ s: row.s, xi: row.xi })),
    [rd],
  );
  const baoLandmarks = useMemo(
    () => [{ name: "BAO bump", x: rd, y: xiAtS(modelCurve, rd) }],
    [modelCurve, rd],
  );
  const spec = useMemo(() => [
    vg.ruleX(vg.from(TABLES.bossXi.name), { x: "s_mpc", y1: "xi_lower", y2: "xi_upper", stroke: palette.errorStroke, strokeWidth: 1.2, strokeOpacity: 0.7 }),
    vg.dot(vg.from(TABLES.bossXi.name), { x: "s_mpc", y: "xi", r: 4, fill: palette.modelStroke, stroke: palette.modelStroke }),
    vg.line(modelCurve, { x: "s", y: "xi", stroke: COLOR_MODEL, strokeWidth: 2 }),
    vg.ruleX([{ x: rd }], { x: "x", stroke: COLOR_GUIDE, strokeWidth: 1.2, strokeDasharray: "4,3", strokeOpacity: 0.8 }),
    vg.dot(baoLandmarks, { x: "x", y: "y", r: 7, fill: "transparent", stroke: palette.modelStroke, strokeWidth: 1.5, title: "name" }),
    vgX.text(baoLandmarks, { x: "x", y: "y", text: "name", dy: -14, fill: palette.modelStroke, fontSize: 11, fontWeight: 500 }),
    vg.ruleY([0], { stroke: palette.axisStroke, strokeOpacity: 0.4 }),
    ...vgFrame({
      xLabel: "Separation s (Mpc) →",
      yLabel: "↑ ξ(s)",
      xDomain: [50, 200],
      yDomain: [-0.001, 0.012],
      margins: { left: 90 },
    }),
  ], [modelCurve, rd, baoLandmarks, palette]);

  return (
    <PlotSection
      index={7}
      title="Baryon Acoustic Oscillations: the universe's standard ruler"
      question="Why does the distribution of galaxies show a preferred separation of about 500 million light-years?"
      summary={
        <Text>
          In the first 380,000 years of the universe, temperatures were
          high enough that protons and electrons could not combine into
          neutral atoms — light scattered off the free electrons like fog,
          and ordinary matter and photons were locked together as a single
          fluid that could vibrate as one. Wherever this fluid had a
          slight overdensity (a seed for a future galaxy), the extra
          pressure pushed outward and launched a spherical sound wave —
          like dropping a stone in a pond, except in three dimensions and
          inside a hot plasma. The wave traveled outward at the speed of
          sound in this fluid (about 60% of the speed of light) until the
          universe cooled enough for atoms to form and photons to stop
          scattering. At that moment the fluid stopped behaving as one,
          and the sound wave froze in place. Every original overdensity
          was left surrounded by a thin spherical shell of ordinary
          matter at a fixed comoving distance — the distance the wave had
          traveled by then, about 150 megaparsecs (~500 million
          light-years). Over the next 13 billion years, galaxies formed
          preferentially both at the original overdensities and on those
          shells. So today, if you take every pair of galaxies in a large
          survey and count how many pairs sit at each separation, you
          find a small but real excess at the shell distance. That excess
          is the baryon acoustic oscillation (BAO) feature, and because
          the shell radius is a known physical length set by sound-speed
          physics, it works as a standard ruler — a known length whose
          observed size at any redshift directly measures the geometry of
          the universe.
        </Text>
      }
      math={
        <>
          <MathBlock ariaLabel="sound horizon integral">{`r_d \\;=\\; \\int_{z_{\\rm drag}}^{\\infty} \\frac{c_s(z)}{H(z)} \\, dz`}</MathBlock>
          <Text fontFamily="body" fontSize="sm" lineHeight="1.7">
            <MathInline>{`r_d`}</MathInline> is the sound horizon at the
            drag epoch — the comoving distance a sound wave could travel
            through the photon-baryon plasma between the Big Bang and the
            moment baryons decoupled from photons (drag epoch redshift{" "}
            <MathInline>{`z_{\\rm drag} \\approx 1060`}</MathInline>, slightly
            later than recombination).{" "}
            <MathInline>{`c_s(z)`}</MathInline> is the sound speed of the
            photon-baryon plasma at redshift{" "}
            <MathInline>{`z`}</MathInline> (which depends on the baryon-to-
            photon ratio and falls from{" "}
            <MathInline>{`c/\\sqrt{3}`}</MathInline> at early times as
            baryons load the plasma);{" "}
            <MathInline>{`H(z)`}</MathInline> is the Hubble expansion rate
            at that redshift. On the plot, the x-axis is the comoving
            galaxy-pair separation{" "}
            <MathInline>{`s`}</MathInline> in megaparsecs (Mpc), and the
            y-axis is the two-point correlation function{" "}
            <MathInline>{`\\xi(s)`}</MathInline> — the fractional excess
            probability over random of finding two galaxies separated by{" "}
            <MathInline>{`s`}</MathInline>. The orange dots are BOSS DR12
            measurements of <MathInline>{`\\xi(s)`}</MathInline> with 1σ
            error bars; the solid orange line is the ΛCDM theory model with
            a bump centered at the slider's current{" "}
            <MathInline>{`r_d`}</MathInline>; the dashed grey vertical
            guide marks the slider position; and the small circle marks
            the bump itself on the theory curve.
          </Text>
        </>
      }
      plot={error !== null ? <PlotError message={error} /> : (
        <MosaicPlot spec={spec} enabled={ready} ariaLabel="BAO correlation function with a bump near 150 Mpc" height={PLOT_HEIGHT} />
      )}
      legend={
        <PlotLegend
          items={[
            { name: "BOSS ξ(s)", description: "DR12 galaxy two-point correlation, 1σ error bars", color: palette.modelStroke, mark: "dot" },
            { name: "ΛCDM theory", description: "Acoustic-bump model, slider-controlled r_d", color: COLOR_MODEL, mark: "line" },
            { name: "r_d guide", description: "Vertical line tracking the slider's sound-horizon value", color: COLOR_GUIDE, mark: "dashed-line" },
          ]}
        />
      }
      controls={
        <Stack direction={{ base: "column", md: "row" }} gap={6}>
          <ParamSlider label="Sound horizon r_d" unit="Mpc" description="Where the BAO bump sits. Planck prefers ~147.8 Mpc; varying it slides the dashed guide and theory curve." min={120} max={180} step={0.5} value={rd} onChange={setRd} />
        </Stack>
      }
      rules={
        <RulesInOut
          rulesIn={[
            "A standard ruler at ~150 megaparsecs imprinted by baryon-photon coupling in the early universe — a low-redshift cross-check on the cosmic-microwave-background distance scale.",
            "The same photon-baryon plasma that produced the cosmic microwave background acoustic peaks: BAO and the CMB are two views of one physical process.",
          ]}
          rulesOut={[
            "Universes with no baryons coupled to photons — no acoustic phase, no bump.",
            "Featureless correlation functions that do not encode a sound horizon.",
          ]}
        />
      }
      takeaway={
        <Text>
          The BAO bump is the late-universe counterpart of the CMB
          acoustic peaks: the same sound waves, recorded in two different
          physical observables, separated by 13 billion years of cosmic
          time. The CMB measures the angular size of the sound horizon at
          recombination from the position of the first acoustic peak; BAO
          measures the comoving length of the sound horizon directly from
          galaxy clustering at low redshift. The two are perpendicular
          slices through the same geometry, and they agree. Combining BAO
          with the CMB constrains the expansion history{" "}
          <MathInline>{`H(z)`}</MathInline> over the redshift range{" "}
          <MathInline>{`0 < z < 1100`}</MathInline> with sufficient
          precision to determine the dark-energy density{" "}
          <MathInline>{`\\Omega_\\Lambda`}</MathInline> independently of the
          supernova distance ladder. The next generation of surveys (DESI,
          Euclid) is measuring BAO across millions of galaxies to test
          whether the dark-energy equation of state is exactly{" "}
          <MathInline>{`w = -1`}</MathInline> or evolves with redshift.
        </Text>
      }
      citation={
        <Citation title="Data source & provenance">
          <Text>
            BOSS DR12 post-reconstruction <MathInline>{`\\xi(s)`}</MathInline>{" "}
            monopole (Ross et al. 2016, high-z CMASS bin), converted from
            Mpc/h to Mpc with <MathInline>{`h = 0.676`}</MathInline> and
            cropped to <MathInline>{`s \\in [50, 200]`}</MathInline> Mpc.
            Source: Alam et al. (2017) MNRAS 470, 2617;
            doi:10.1093/mnras/stx721.{" "}
            <Link
              href="https://github.com/karthikbadam/known-universe/blob/main/scripts/fetch/bao.md"
              target="_blank"
              rel="noopener noreferrer"
            >
              fetch.md
            </Link>{" "}
            has the BOSS data URL.
          </Text>
        </Citation>
      }
    />
  );
}
