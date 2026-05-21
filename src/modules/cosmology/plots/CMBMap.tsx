import { Box, Code, Image, Link, Text } from "@chakra-ui/react";

import { Citation } from "../../../components/Citation";
import { MathBlock, MathInline } from "../../../components/MathBlock";
import { PlotSection } from "../../../components/PlotSection";
import { RulesInOut } from "../../../components/RulesInOut";
import { CHART_HEIGHT } from "../../../theme/chartDimensions";

const REAL_IMAGE_URL = `${import.meta.env.BASE_URL}data/planck_smica.jpg`;
const CANVAS_H = CHART_HEIGHT.standard;

export function CMBMap() {
  return (
    <PlotSection
      index={3}
      title="CMB map: the photograph of the early universe"
      question="What does the sky look like at 2.725 K, and what are those red and blue patches?"
      summary={<Text>A Mollweide projection of the cosmic microwave background, with the mean temperature and dipole removed. Red regions are slightly hotter than 2.725 K, blue slightly cooler; the typical anisotropy is ~100 μK on top of the 2.7 K mean. These tiny ripples are the seeds of every galaxy you've ever heard of: gravitational growth from these initial overdensities built the cosmic web over 14 Gyr.</Text>}
      math={<>
        <MathBlock ariaLabel="CMB spherical harmonic expansion">{`T(\\hat{n}) \\;=\\; \\sum_{\\ell, m} a_{\\ell m} \\, Y_{\\ell m}(\\hat{n}) \\qquad C_\\ell \\;=\\; \\langle |a_{\\ell m}|^2 \\rangle_m`}</MathBlock>
        <Text fontFamily="body" fontSize="sm" color="fg.muted" lineHeight="1.7"><MathInline>{`Y_{\\ell m}`}</MathInline> are spherical harmonics; the variance of the <MathInline>{`a_{\\ell m}`}</MathInline> coefficients is the angular power spectrum <MathInline>{`C_\\ell`}</MathInline> plotted in the next section.</Text>
      </>}
      plot={
        <Box display="flex" justifyContent="center" h={`${CANVAS_H}px`}>
          <Image
            src={REAL_IMAGE_URL}
            alt="Planck 2018 SMICA all-sky CMB temperature map (Mollweide projection)"
            maxW="100%"
            maxH={`${CANVAS_H}px`}
            objectFit="contain"
          />
        </Box>
      }
      controls={null}
      rules={<RulesInOut rulesIn={["Anisotropies at the 10⁻⁵ level on top of a 2.725 K monopole.", "Statistical isotropy (no preferred direction beyond known foregrounds).", "Adiabatic Gaussian initial conditions (the speckle is consistent with a Gaussian random field)."]} rulesOut={["Topological-defect-seeded structure formation (pattern would be non-Gaussian).", "Strong non-Gaussianity (limits from Planck < ~10⁻³ for f_NL).", "A simple steady-state universe (would have no thermal background at 2.7 K)."]} />}
      citation={<Citation title="Data source and provenance"><Text>Planck 2018 SMICA all-sky temperature map, downloaded from ESA's image archive and resized to 1600 px wide for shipping. Real source: Planck 2018 results IV, A&amp;A 641, A4. <Link href="https://github.com/karthikbadam/known-universe/blob/main/scripts/fetch/cmb_map.md" target="_blank" rel="noopener noreferrer">/scripts/fetch/cmb_map.md</Link> documents the fetch. A procedural fallback lives in <Code>src/physics/cmbMap.ts</Code>.</Text></Citation>}
    />
  );
}
