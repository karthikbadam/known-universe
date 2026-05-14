import { Code, Link, SimpleGrid, Text } from "@chakra-ui/react";
import { useMemo, useState } from "react";
import * as vg from "@uwdata/vgplot";

import { Citation } from "../components/Citation";
import { MathBlock, MathInline } from "../components/MathBlock";
import { MosaicPlot } from "../components/MosaicPlot";
import { ParamSlider } from "../components/ParamSlider";
import { PlotError } from "../components/PlotError";
import { PlotSection } from "../components/PlotSection";
import { RulesInOut } from "../components/RulesInOut";
import { type DataStatus } from "../components/DataStatusBadge";

import { TABLES } from "../data/loaders";
import { useDataTable } from "../mosaic/useDataTable";
import { PLANCK_2018, cmbModelCurve, type CmbParams } from "../physics/cmb";
import { chartPalette } from "../theme/palette";

const dataStatus: DataStatus = "simulated";
const MODEL_SAMPLES = 600;

export function CMBPowerSpectrum(): JSX.Element {
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
    return cmbModelCurve(params, {
      ellMin: 2,
      ellMax: 2500,
      samples: MODEL_SAMPLES,
    });
  }, [H0, omegaM, omegaBh2, nS]);

  const spec = useMemo(
    () => [
      vg.ruleX(vg.from(TABLES.planckDl.name), {
        x: "ell",
        y1: "Dl_lower",
        y2: "Dl_upper",
        stroke: chartPalette.errorStroke,
        strokeWidth: 1.2,
        strokeOpacity: 0.7,
      }),
      vg.dot(vg.from(TABLES.planckDl.name), {
        x: "ell",
        y: "Dl",
        r: 3,
        fill: chartPalette.dataFill,
        stroke: chartPalette.dataStroke,
        strokeWidth: 1,
      }),
      vg.line(modelCurve.map((row) => ({ ell: row.ell, Dl: row.Dl })), {
        x: "ell",
        y: "Dl",
        stroke: chartPalette.modelStroke,
        strokeWidth: 2,
      }),
      vg.xLabel("Multipole ℓ →"),
      vg.yLabel("↑ Dℓ = ℓ(ℓ+1)Cℓ/2π  (μK²)"),
      vg.xDomain([0, 2550]),
      vg.yDomain([0, 7000]),
      vg.width(820),
      vg.height(480),
      vg.marginLeft(65),
      vg.marginBottom(50),
    ],
    [modelCurve],
  );

  return (
    <PlotSection
      index={4}
      title="CMB power spectrum — six numbers, seven peaks"
      question="What does the cosmic microwave background tell us about the early universe?"
      dataStatus={dataStatus}
      summary={
        <Text>
          Each dot is the average angular power of CMB temperature fluctuations
          in a band of multipoles ℓ — equivalently, how much "ripple" the early
          universe carried at angular scale π/ℓ. The peaks are acoustic
          oscillations of the photon-baryon plasma at recombination, frozen in
          when the universe became transparent. Their positions encode geometry;
          their relative heights encode composition. Drag the sliders to see
          which slider moves which peak.
        </Text>
      }
      math={
        <>
          <MathBlock ariaLabel="Definition of D_ell">
            {`D_\\ell \\;=\\; \\frac{\\ell(\\ell+1)}{2\\pi}\\, C_\\ell \\qquad\\text{where}\\qquad \\langle a_{\\ell m} a^{*}_{\\ell' m'}\\rangle = C_\\ell\\, \\delta_{\\ell\\ell'}\\delta_{mm'}`}
          </MathBlock>
          <Text fontSize="sm" color="navy.200">
            <MathInline>{`C_\\ell`}</MathInline> is the variance of the ℓ-th
            multipole of the temperature map; multiplying by{" "}
            <MathInline>{`\\ell(\\ell+1)/2\\pi`}</MathInline> gives a curve
            whose features sit at roughly the same{" "}
            <MathInline>{`D_\\ell`}</MathInline> across many decades of ℓ. The
            first peak position{" "}
            <MathInline>{`\\ell_1 \\approx 220`}</MathInline> sets the angular
            size of the sound horizon at last scattering and therefore the
            geometry of the universe; the peak ratios fix the baryon density.
          </Text>
        </>
      }
      plot={
        error !== null ? (
          <PlotError message={error} />
        ) : (
          <MosaicPlot
            spec={spec}
            enabled={ready}
            ariaLabel="CMB angular power spectrum: binned Dℓ data with error bars and ΛCDM theory line"
            minHeight="480px"
          />
        )
      }
      controls={
        <SimpleGrid columns={{ base: 1, md: 2 }} spacing={5}>
          <ParamSlider
            label="Hubble constant H₀"
            unit="km/s/Mpc"
            description="Higher H₀ shrinks the angular-diameter distance, shifting peaks left."
            min={50}
            max={90}
            step={0.1}
            value={H0}
            onChange={setH0}
          />
          <ParamSlider
            label="Matter density Ω_m"
            description="More matter pushes the sound horizon down, shifting peaks right; weak overall."
            min={0.15}
            max={0.55}
            step={0.005}
            value={omegaM}
            onChange={setOmegaM}
          />
          <ParamSlider
            label="Baryon density Ω_b h²"
            description="More baryons boost odd (compression) peaks, suppress even (rarefaction) peaks."
            min={0.012}
            max={0.034}
            step={0.0002}
            value={omegaBh2}
            onChange={setOmegaBh2}
          />
          <ParamSlider
            label="Spectral index n_s"
            description="n_s < 1 tilts power red (toward low ℓ); n_s > 1 tilts blue."
            min={0.85}
            max={1.05}
            step={0.005}
            value={nS}
            onChange={setNS}
          />
        </SimpleGrid>
      }
      rules={
        <RulesInOut
          rulesIn={[
            "Flat spatial geometry (the first peak at ℓ ≈ 220 rules in Ω_k ≈ 0).",
            "A baryon-to-photon ratio of ~6 × 10⁻¹⁰ (the odd/even peak asymmetry).",
            "Adiabatic, nearly scale-invariant initial perturbations (the SW plateau + peak coherence).",
            "Cold dark matter: without it the peaks would be in the wrong place by ~ 30%.",
          ]}
          rulesOut={[
            "Universes with no acoustic horizon (e.g. pure isocurvature) — the peaks would be shifted.",
            "Very open or closed universes (peaks at the wrong ℓ).",
            "Baryon-only cosmologies (peak ratios totally different).",
          ]}
        />
      }
      citation={
        <Citation title="Data source & provenance">
          <Text>
            Simulated Planck-like binned TT spectrum (45 bins, ℓ ∈ [30, 2500])
            generated by <Code>scripts/simulate/cmb_powerspectrum.ts</Code> from
            the analytical model in <Code>src/physics/cmb.ts</Code>. Real
            source: Planck Collab. (2020), A&A 641, A6;
            doi:10.1051/0004-6361/201833910. The fiducial cosmology used for
            generation is Planck 2018 base-ΛCDM.
          </Text>
          <Text mt={2}>
            See{" "}
            <Link
              href="https://github.com/karthikbadam/known-universe/blob/main/scripts/fetch/cmb_powerspectrum.md"
              isExternal
            >
              /scripts/fetch/cmb_powerspectrum.md
            </Link>{" "}
            for instructions to swap in the real Planck Legacy Archive file.
            The theory curve currently comes from a parameterized analytical
            model (~5-15% accurate vs CAMB); upgrade instructions are in the
            same fetch.md.
          </Text>
        </Citation>
      }
    />
  );
}
