import { Code, Link, Text, VStack } from "@chakra-ui/react";
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
import { PLANCK_2018, cmbModelCurve, type CmbParams } from "../physics/cmb";
import { CHART_HEIGHT } from "../../../theme/chartDimensions";
import { useChartPalette } from "../../../theme/palette";

const MODEL_SAMPLES = 600;
const PLOT_HEIGHT = CHART_HEIGHT.standard;

const COLOR_MODEL = "#ff7a1a";

export function CMBPowerSpectrum() {
  const palette = useChartPalette();
  const { ready, error } = useDataTable(
    TABLES.planckDl.name,
    TABLES.planckDl.url,
    { skipHeaderLines: TABLES.planckDl.skipHeaderLines },
  );

  const [H0, setH0] = useState<number>(PLANCK_2018.H0);
  const [omegaM, setOmegaM] = useState<number>(PLANCK_2018.omegaM);
  const [omegaBh2, setOmegaBh2] = useState<number>(PLANCK_2018.omegaBh2);
  const [nS, setNS] = useState<number>(PLANCK_2018.nS);

  const modelCurve = useMemo(() => {
    const params: CmbParams = { H0, omegaM, omegaBh2, nS };
    return cmbModelCurve(params, { ellMin: 2, ellMax: 2500, samples: MODEL_SAMPLES })
      .map((row) => ({ ell: row.ell, Dl: row.Dl }));
  }, [H0, omegaM, omegaBh2, nS]);

  const spec = useMemo(
    () => [
      vg.ruleX(vg.from(TABLES.planckDl.name), {
        x: "ell", y1: "Dl_lower", y2: "Dl_upper",
        stroke: palette.errorStroke, strokeWidth: 1.2, strokeOpacity: 0.7,
      }),
      vg.dot(vg.from(TABLES.planckDl.name), {
        x: "ell", y: "Dl", r: 3,
        fill: palette.modelStroke, stroke: palette.modelStroke, strokeWidth: 1,
      }),
      vg.line(modelCurve, {
        x: "ell", y: "Dl", stroke: COLOR_MODEL, strokeWidth: 2,
      }),
      ...vgFrame({
        xLabel: "Multipole ℓ →",
        yLabel: "↑ Dℓ = ℓ(ℓ+1)Cℓ/2π  (μK²)",
        xDomain: [0, 2550],
        yDomain: [0, 7000],
      }),
    ],
    [modelCurve, palette],
  );

  return (
    <PlotSection
      index={4}
      title="CMB power spectrum, six numbers, seven peaks"
      question="Why does the CMB temperature show a regular pattern of peaks at specific angular scales?"
      summary={
        <Text>
          The previous section showed the all-sky CMB temperature map.
          Decompose that map into spherical harmonics and the variance at
          each angular scale forms a curve — the angular power spectrum —
          that is not flat. It shows a sequence of sharply defined peaks at
          specific multipoles (specific angular scales on the sky). The
          peaks are not an artifact of any particular line of sight: they
          are a global property of the temperature field, and their
          positions and heights encode the geometry and composition of the
          universe at recombination. Why are there peaks at all, and why at
          those particular scales?
        </Text>
      }
      math={
        <>
          <MathBlock ariaLabel="Definition of D_ell">{`D_\\ell \\;=\\; \\frac{\\ell(\\ell+1)}{2\\pi}\\, C_\\ell \\qquad\\text{where}\\qquad \\langle a_{\\ell m} a^{*}_{\\ell' m'}\\rangle = C_\\ell\\, \\delta_{\\ell\\ell'}\\delta_{mm'}`}</MathBlock>
          <Text fontFamily="body" fontSize="sm" lineHeight="1.7">
            <MathInline>{`D_\\ell`}</MathInline> is the conventional way to
            plot the angular power spectrum:{" "}
            <MathInline>{`C_\\ell`}</MathInline> (the variance of the
            spherical-harmonic coefficients{" "}
            <MathInline>{`a_{\\ell m}`}</MathInline> at multipole{" "}
            <MathInline>{`\\ell`}</MathInline>, from the previous section) is
            multiplied by{" "}
            <MathInline>{`\\ell(\\ell+1)/2\\pi`}</MathInline> to flatten the
            visual rise across orders of magnitude in{" "}
            <MathInline>{`\\ell`}</MathInline>. Multipole{" "}
            <MathInline>{`\\ell`}</MathInline> is the angular-scale index:
            small <MathInline>{`\\ell`}</MathInline> is large angular scales
            (broad patches), large <MathInline>{`\\ell`}</MathInline> is
            small angular scales (fine detail), with the correspondence
            angular scale ≈ 180°/<MathInline>{`\\ell`}</MathInline>. On the
            plot, the x-axis is <MathInline>{`\\ell`}</MathInline> and the
            y-axis is <MathInline>{`D_\\ell`}</MathInline> in microkelvin²
            (the natural unit of variance for temperature fluctuations).
            Each dot is a band of Planck's measurement averaged over a range
            of <MathInline>{`\\ell`}</MathInline> values, with vertical bars
            showing the 1σ uncertainty. The orange line is the theoretical
            prediction for the six-parameter ΛCDM model at the sliders' current
            values. The peaks themselves are acoustic oscillations: before
            recombination, the photon-baryon plasma supported pressure waves
            whose phase at recombination became frozen into the temperature
            pattern. Modes that caught a full compression became the
            odd-numbered (compression) peaks; modes that caught a full
            rarefaction became the even-numbered (rarefaction) peaks. The
            first peak at <MathInline>{`\\ell \\approx 220`}</MathInline>{" "}
            corresponds to a mode that completed exactly half an oscillation
            between the Big Bang and recombination, and its angular position
            directly measures the geometry of the universe.
          </Text>
        </>
      }
      plot={error !== null ? <PlotError message={error} /> : (
        <MosaicPlot spec={spec} enabled={ready} ariaLabel="CMB angular power spectrum: binned Dℓ data with error bars and ΛCDM theory line" height={PLOT_HEIGHT} />
      )}
      legend={
        <PlotLegend
          items={[
            { name: "Planck data", description: "Binned Dℓ with 1σ error bars (TT spectrum)", color: palette.modelStroke, mark: "dot" },
            { name: "ΛCDM theory", description: "Parameterized analytical fit; slider-controlled", color: COLOR_MODEL, mark: "line" },
          ]}
        />
      }
      legendPlacement="above-plot"
      controls={
        <VStack align="stretch" gap={5}>
          <ParamSlider label="Hubble constant H₀" unit="km/s/Mpc" description="Higher H₀ shrinks the angular-diameter distance, shifting peaks left." min={50} max={90} step={0.1} value={H0} onChange={setH0} />
          <ParamSlider label="Matter density Ω_m" description="More matter pushes the sound horizon down, shifting peaks right; weak overall." min={0.15} max={0.55} step={0.005} value={omegaM} onChange={setOmegaM} />
          <ParamSlider label="Baryon density Ω_b h²" description="More baryons boost odd (compression) peaks, suppress even (rarefaction) peaks." min={0.012} max={0.034} step={0.0002} value={omegaBh2} onChange={setOmegaBh2} />
          <ParamSlider label="Spectral index n_s" description="n_s < 1 tilts power red (toward low ℓ); n_s > 1 tilts blue." min={0.85} max={1.05} step={0.005} value={nS} onChange={setNS} />
        </VStack>
      }
      rules={
        <RulesInOut
          rulesIn={[
            "A spatially flat universe — the first peak at ℓ ≈ 220 fixes the geometry to flat at the percent level.",
            "A baryon-to-photon ratio of ~6 × 10⁻¹⁰, fixed by the asymmetry between odd (compression) and even (rarefaction) peaks.",
            "Adiabatic, nearly scale-invariant initial perturbations from the large-scale plateau plus the coherence of the peak pattern.",
            "Cold dark matter — without it, the peaks would sit at the wrong angular scales by roughly 30%.",
          ]}
          rulesOut={[
            "Universes whose initial perturbations are purely isocurvature — the peak phases would be shifted.",
            "Strongly open or closed universes — the first peak would sit at the wrong multipole.",
            "Cosmologies with only baryons and no dark matter — the relative peak heights would be completely different.",
          ]}
        />
      }
      takeaway={
        <Text>
          The six-parameter ΛCDM model fits roughly 3,000 independent Planck
          data points across nearly two orders of magnitude in angular scale
          (<MathInline>{`\\ell`}</MathInline> from ~2 to ~2,500), with each
          of the six parameters leaving a distinct fingerprint on the curve.
          The angular position of the first peak fixes the geometry of the
          universe. The ratio of the second peak height to the first fixes
          the baryon density{" "}
          <MathInline>{`\\Omega_b h^2`}</MathInline>, and that value matches
          the independent measurement from BBN (the previous section). The
          overall amplitude of the peak envelope relative to the large-scale
          plateau fixes the cold-dark-matter density{" "}
          <MathInline>{`\\Omega_c h^2`}</MathInline>. The slope of the
          large-scale plateau (the Sachs–Wolfe portion at low{" "}
          <MathInline>{`\\ell`}</MathInline>) measures the tilt{" "}
          <MathInline>{`n_s`}</MathInline> of the primordial power spectrum,
          which has been measured to differ from perfect scale invariance
          (<MathInline>{`n_s = 1`}</MathInline>) at high statistical
          significance — a key prediction of inflationary models. The power
          spectrum is the single most constraining cosmological data set we
          have, and it is where most of the ΛCDM parameter values are
          actually pinned down.
        </Text>
      }
      citation={
        <Citation title="Data source & provenance">
          <Text>
            Planck 2018 binned TT power spectrum (
            <Code>COM_PowerSpect_CMB-TT-binned_R3.01.txt</Code> from the
            Planck Legacy Archive), 83 ℓ-bins spanning{" "}
            <MathInline>{`\\ell \\in [48, 2499]`}</MathInline>. Source:
            Planck Collab. (2020) A&A 641, A6;
            doi:10.1051/0004-6361/201833910.
          </Text>
          <Text mt={2}>
            The theory curve comes from a parameterized analytical model in{" "}
            <Code>src/physics/cmb.ts</Code> (~5–15% accurate vs CAMB);{" "}
            <Link
              href="https://github.com/karthikbadam/known-universe/blob/main/scripts/fetch/cmb_powerspectrum.md"
              target="_blank"
              rel="noopener noreferrer"
            >
              /scripts/fetch/cmb_powerspectrum.md
            </Link>{" "}
            describes upgrading to a CAMB grid.
          </Text>
        </Citation>
      }
    />
  );
}
