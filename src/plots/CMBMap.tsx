import { Box, Code, Link, SimpleGrid, Text } from "@chakra-ui/react";
import { useEffect, useMemo, useRef, useState } from "react";

import { Citation } from "../components/Citation";
import { MathBlock, MathInline } from "../components/MathBlock";
import { ParamSlider } from "../components/ParamSlider";
import { PlotSection } from "../components/PlotSection";
import { RulesInOut } from "../components/RulesInOut";
import { type DataStatus } from "../components/DataStatusBadge";

import {
  generateCmbField,
  mollweideInverse,
  temperatureColor,
} from "../physics/cmbMap";

const dataStatus: DataStatus = "simulated";
const CANVAS_W = 600;
const CANVAS_H = 300;
const FIELD_W = 240;
const FIELD_H = 120;

export function CMBMap(): JSX.Element {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [scale, setScale] = useState<number>(300);

  const field = useMemo(() => generateCmbField(FIELD_W, FIELD_H), []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas === null) return;
    const ctx = canvas.getContext("2d");
    if (ctx === null) return;
    ctx.clearRect(0, 0, CANVAS_W, CANVAS_H);
    const imgData = ctx.createImageData(CANVAS_W, CANVAS_H);
    const data = imgData.data;
    for (let py = 0; py < CANVAS_H; py++) {
      const yNorm = (py - CANVAS_H / 2) / (CANVAS_H / 2);
      for (let px = 0; px < CANVAS_W; px++) {
        const xNorm = (px - CANVAS_W / 2) / (CANVAS_W / 2);
        const idx = (py * CANVAS_W + px) * 4;
        const ll = mollweideInverse(xNorm, yNorm);
        if (ll === null) {
          data[idx] = 7;
          data[idx + 1] = 15;
          data[idx + 2] = 31;
          data[idx + 3] = 255;
          continue;
        }
        const fx = Math.min(
          FIELD_W - 1,
          Math.max(0, Math.floor(((ll.lon + Math.PI) / (2 * Math.PI)) * FIELD_W)),
        );
        const fy = Math.min(
          FIELD_H - 1,
          Math.max(0, Math.floor(((ll.lat + Math.PI / 2) / Math.PI) * FIELD_H)),
        );
        const t = field.values[fy * FIELD_W + fx] ?? 0;
        const [r, g, b] = temperatureColor(t, scale);
        data[idx] = r;
        data[idx + 1] = g;
        data[idx + 2] = b;
        data[idx + 3] = 255;
      }
    }
    ctx.putImageData(imgData, 0, 0);
  }, [field, scale]);

  return (
    <PlotSection
      index={3}
      title="CMB map — the photograph of the early universe"
      question="What does the sky look like at 2.725 K, and what are those red and blue patches?"
      dataStatus={dataStatus}
      summary={
        <Text>
          A Mollweide projection of the cosmic microwave background, with
          the mean temperature and dipole removed. Red regions are slightly
          hotter than 2.725 K, blue slightly cooler — the typical anisotropy
          is ~100 μK on top of the 2.7 K mean. These tiny ripples are the
          seeds of every galaxy you've ever heard of: gravitational growth
          from these initial overdensities built the cosmic web over 14 Gyr.
        </Text>
      }
      math={
        <>
          <MathBlock ariaLabel="CMB spherical harmonic expansion">
            {`T(\\hat{n}) \\;=\\; \\sum_{\\ell, m} a_{\\ell m} \\, Y_{\\ell m}(\\hat{n}) \\qquad C_\\ell \\;=\\; \\langle |a_{\\ell m}|^2 \\rangle_m`}
          </MathBlock>
          <Text fontSize="sm" color="navy.200">
            <MathInline>{`Y_{\\ell m}`}</MathInline> are spherical
            harmonics; the variance of the{" "}
            <MathInline>{`a_{\\ell m}`}</MathInline> coefficients is the
            angular power spectrum{" "}
            <MathInline>{`C_\\ell`}</MathInline> plotted in the next section.
          </Text>
        </>
      }
      plot={
        <Box display="flex" justifyContent="center" py={4}>
          <Box
            as="canvas"
            ref={canvasRef}
            width={CANVAS_W}
            height={CANVAS_H}
            w={{ base: "100%", md: `${CANVAS_W}px` }}
            h={{ base: "auto", md: `${CANVAS_H}px` }}
            maxW="100%"
            borderRadius="md"
            bg="navy.900"
            role="img"
            aria-label="Mollweide projection of a simulated CMB temperature map"
          />
        </Box>
      }
      controls={
        <SimpleGrid columns={{ base: 1, md: 1 }} spacing={5}>
          <ParamSlider
            label="Temperature scale (± μK)"
            unit="μK"
            description="Maps the colormap range. Planck SMICA uses ±300 μK by convention."
            min={100}
            max={600}
            step={10}
            value={scale}
            onChange={setScale}
          />
        </SimpleGrid>
      }
      rules={
        <RulesInOut
          rulesIn={[
            "Anisotropies at the 10⁻⁵ level on top of a 2.725 K monopole.",
            "Statistical isotropy (no preferred direction beyond known foregrounds).",
            "Adiabatic Gaussian initial conditions (the speckle is consistent with a Gaussian random field).",
          ]}
          rulesOut={[
            "Topological-defect-seeded structure formation (pattern would be non-Gaussian).",
            "Strong non-Gaussianity (limits from Planck < ~10⁻³ for f_NL).",
            "A simple steady-state universe (would have no thermal background at 2.7 K).",
          ]}
        />
      }
      citation={
        <Citation title="Data source & provenance">
          <Text>
            Procedurally generated CMB-like field via{" "}
            <Code>src/physics/cmbMap.ts</Code> — 12 large Gaussian blobs
            on the sphere plus smoothed Gaussian speckle. Real source:
            Planck SMICA map (Planck 2018 results IV, A&A 641, A4).{" "}
            <Link
              href="https://github.com/karthikbadam/known-universe/blob/main/scripts/fetch/cmb_map.md"
              isExternal
            >
              fetch.md
            </Link>{" "}
            has the curl-able all-sky PNG URL.
          </Text>
        </Citation>
      }
    />
  );
}
