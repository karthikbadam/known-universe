import { Box } from "@chakra-ui/react";
import * as vg from "@uwdata/vgplot";
import { useTheme } from "next-themes";
import { useMemo } from "react";

import { TABLES } from "../modules/cosmology/data/tables";
import { useDataTable } from "../mosaic/useDataTable";
import { useChartPalette } from "../theme/palette";
import { MosaicPlot } from "./MosaicPlot";

// Mosaic-based CMB-like Mollweide raster for the cosmology module's catalog
// card. Reuses the same data table and `vg.raster` mark that section 3
// (CMBMap) renders, just with axes/chrome stripped and a theme-aware
// diverging color scale so it sits well in both light and dark mode.

const vgX = vg as unknown as {
  raster: (source: unknown, options: Record<string, unknown>) => unknown;
  max: (col: string) => unknown;
};

export function CmbCover() {
  const palette = useChartPalette();
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";
  const { ready } = useDataTable(
    TABLES.cmbMollweide.name,
    TABLES.cmbMollweide.url,
    { skipHeaderLines: TABLES.cmbMollweide.skipHeaderLines },
  );

  const spec = useMemo(
    () => [
      vgX.raster(vg.from(TABLES.cmbMollweide.name), {
        x: "x",
        y: "y",
        fill: vgX.max("t_uk"),
        interpolate: "none",
        pixelSize: 1,
      }),
      vg.xDomain([-2.05, 2.05]),
      vg.yDomain([-1.15, 1.15]),
      vg.marginLeft(0),
      vg.marginRight(0),
      vg.marginTop(0),
      vg.marginBottom(0),
      (plot: { attributes: Record<string, unknown> }) => {
        plot.attributes.colorScale = "diverging";
        plot.attributes.colorRange = [
          isDark ? "#3a4452" : "#6c7a89",
          palette.background,
          isDark ? "#a85820" : "#e6884a",
        ];
        plot.attributes.colorPivot = 0;
        plot.attributes.colorDomain = [-300, 300];
        plot.attributes.xAxis = null;
        plot.attributes.yAxis = null;
        plot.attributes.aspectRatio = 1;
        plot.attributes.style = "background: transparent;";
      },
    ],
    [palette, isDark],
  );

  return (
    <Box w="100%" h="100%" bg="bg.subtle" overflow="hidden">
      <MosaicPlot
        spec={spec}
        enabled={ready}
        ariaLabel="CMB Mollweide projection"
        height={240}
        aspectRatio={2}
      />
    </Box>
  );
}
