import { Box, Code, Link, SimpleGrid, Stat, Text } from "@chakra-ui/react";
import { useMemo, useState } from "react";

import { Citation } from "../components/Citation";
import { MathBlock, MathInline } from "../components/MathBlock";
import { ParamSlider } from "../components/ParamSlider";
import { PlotSection } from "../components/PlotSection";
import { RulesInOut } from "../components/RulesInOut";
import { type DataStatus } from "../components/DataStatusBadge";

import {
  M87_OBSERVED,
  inclinationFactor,
  shadowDiameterUas,
} from "../physics/blackHoleShadow";

const dataStatus: DataStatus = "simulated";
const VIEW_BOX_UAS = 80;

export function EHTShadow() {
  const [massBillionSun, setMassBillionSun] = useState<number>(M87_OBSERVED.massSolar / 1e9);
  const [distanceMpc, setDistanceMpc] = useState<number>(M87_OBSERVED.distanceMpc);
  const [inclinationDeg, setInclinationDeg] = useState<number>(17);

  const predictedDiameterUas = useMemo(() => {
    const massSolar = massBillionSun * 1e9;
    return shadowDiameterUas(massSolar, distanceMpc) * inclinationFactor(inclinationDeg);
  }, [massBillionSun, distanceMpc, inclinationDeg]);

  const radiusInView = predictedDiameterUas / 2;
  const matches =
    Math.abs(predictedDiameterUas - M87_OBSERVED.shadowDiameterUas) <
    M87_OBSERVED.shadowSigmaUas;

  return (
    <PlotSection
      index={8}
      title="EHT — photographing the photon ring"
      question="What's the apparent size of a billion-solar-mass black hole 17 Mpc away?"
      dataStatus={dataStatus}
      summary={<Text>The Event Horizon Telescope assembled an Earth-sized radio interferometer and resolved the photon ring of M87's central supermassive black hole. The dark disk's apparent diameter on the sky encodes only two numbers: the BH mass and its distance from us. Drag the mass slider and watch the predicted shadow grow; aim for the EHT measurement (42 ± 3 μas) and read off ~6.5 × 10⁹ M_☉.</Text>}
      math={<>
        <MathBlock ariaLabel="shadow diameter formula">{`\\theta_{\\rm sh} \\;=\\; \\frac{2 b_{\\rm crit}}{D} \\;=\\; \\frac{6\\sqrt{3}\\, G M}{c^2 D}`}</MathBlock>
        <Text fontSize="sm" color="navy.200"><MathInline>{`b_{\\rm crit} = 3\\sqrt{3}\\, G M / c^2`}</MathInline> is the critical impact parameter — light with smaller b is captured. The Schwarzschild radius <MathInline>{`R_s = 2GM/c^2`}</MathInline> is buried in there; the shadow is <MathInline>{`5.196 R_s`}</MathInline> across. For Kerr, spin shifts this by a few percent at modest inclinations.</Text>
      </>}
      plot={
        <Box display="flex" justifyContent="center" alignItems="center" py={4}>
          <svg
            viewBox={`-${VIEW_BOX_UAS / 2} -${VIEW_BOX_UAS / 2} ${VIEW_BOX_UAS} ${VIEW_BOX_UAS}`}
            style={{ width: "min(100%, 440px)", height: "auto", maxWidth: "100%", background: "#070f1f", borderRadius: "8px" }}
            role="img"
            aria-label={`EHT black hole shadow — predicted diameter ${predictedDiameterUas.toFixed(1)} μas`}
          >
            <defs>
              <radialGradient id="ehtRing" cx="0" cy="0" r="0.6">
                <stop offset="0" stopColor="#070f1f" />
                <stop offset="0.55" stopColor="#070f1f" />
                <stop offset="0.6" stopColor="#7c5b0a" />
                <stop offset="0.72" stopColor="#e8ad2a" />
                <stop offset="0.82" stopColor="#fae8b9" />
                <stop offset="1" stopColor="#070f1f" />
              </radialGradient>
              <filter id="ehtBlur"><feGaussianBlur stdDeviation="2" /></filter>
            </defs>
            <circle cx={0} cy={0} r={26} fill="url(#ehtRing)" filter="url(#ehtBlur)" />
            <circle cx={0} cy={0} r={radiusInView} fill="#070f1f" />
            <circle cx={0} cy={0} r={M87_OBSERVED.shadowDiameterUas / 2} fill="none" stroke={matches ? "#a3e635" : "#f1c156"} strokeWidth={0.6} strokeDasharray="2,1.5" />
            <line x1={-35} y1={32} x2={-15} y2={32} stroke="#e9eef7" strokeWidth={0.6} />
            <text x={-25} y={36} fill="#e9eef7" fontSize={3.2} textAnchor="middle">20 μas</text>
          </svg>
        </Box>
      }
      controls={
        <SimpleGrid columns={{ base: 1, md: 3 }} gap={5}>
          <ParamSlider label="Mass M_BH" unit="× 10⁹ M_☉" description="Linear in shadow size. M87* sits at 6.5." min={1} max={15} step={0.1} value={massBillionSun} onChange={setMassBillionSun} />
          <ParamSlider label="Distance D" unit="Mpc" description="Inverse in shadow size. M87 is ~16.8 Mpc away." min={5} max={30} step={0.1} value={distanceMpc} onChange={setDistanceMpc} />
          <ParamSlider label="Viewing inclination" unit="°" description="Kerr correction; sub-percent effect at i ≲ 30°." min={0} max={90} step={1} value={inclinationDeg} onChange={setInclinationDeg} />
          <Stat.Root bg="navy.800" p={3} borderRadius="md" borderWidth={1} borderColor="navy.700">
            <Stat.Label color="navy.300" fontSize="xs">Predicted shadow diameter</Stat.Label>
            <Stat.ValueText color={matches ? "green.300" : "gold.300"}>{predictedDiameterUas.toFixed(1)} μas</Stat.ValueText>
            <Text color="navy.300" fontSize="xs" mt={1}>EHT measured: 42 ± 3 μas</Text>
          </Stat.Root>
        </SimpleGrid>
      }
      rules={<RulesInOut rulesIn={["General relativity at horizon scale: shadow size matches the GR prediction to ~10%.", "M87's central object is a Schwarzschild-like BH with M ≈ 6.5 × 10⁹ M_☉.", "No Newtonian source can produce a ring this compact."]} rulesOut={["Naked singularities (no event horizon means no dark central disk).", "Wormholes with photon-trapping cross-sections inconsistent with EHT's circular ring.", "Modified gravity theories that predict shadow size ≫ 5.2 R_s."]} />}
      citation={<Citation title="Data source & provenance"><Text>Image placeholder is an SVG render (warm photon ring around a central shadow). Real source: EHT Collaboration (2019) ApJ 875, L1; image available from ESO and EventHorizonTelescope.org. <Link href="https://github.com/karthikbadam/known-universe/blob/main/scripts/fetch/eht_m87.md" target="_blank" rel="noopener noreferrer">fetch.md</Link> has the curl-able URLs.</Text><Text mt={2}>Shadow physics in <Code>src/physics/blackHoleShadow.ts</Code> is real: Schwarzschild b_crit, M87 mass and distance from the EHT paper.</Text></Citation>}
    />
  );
}
