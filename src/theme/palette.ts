import { useMemo } from "react";
import { useTheme } from "next-themes";

// Plot palette, Distill-style monochrome with a single warm accent.
// vgplot needs literal hex per render, so we expose a hook that returns a
// mode-keyed object; plots include the returned object in their useMemo
// deps so the spec re-renders on toggle.

export interface ChartPalette {
  readonly dataFill: string;
  readonly dataStroke: string;
  readonly modelStroke: string;
  readonly errorStroke: string;
  readonly axisStroke: string;
  readonly highlightStroke: string;
  readonly background: string;
}

const LIGHT: ChartPalette = {
  dataFill: "#e85d04",
  dataStroke: "#c44b00",
  modelStroke: "#111111",
  errorStroke: "#bcbcbc",
  axisStroke: "#888888",
  highlightStroke: "#e85d04",
  background: "#ffffff",
};

const DARK: ChartPalette = {
  dataFill: "#ff7a1a",
  dataStroke: "#ff9447",
  modelStroke: "#f5f5f5",
  errorStroke: "#3f3f3f",
  axisStroke: "#6b6b6b",
  highlightStroke: "#ff7a1a",
  background: "#0a0a0a",
};

export function useChartPalette(): ChartPalette {
  const { resolvedTheme } = useTheme();
  return useMemo(
    () => (resolvedTheme === "dark" ? DARK : LIGHT),
    [resolvedTheme],
  );
}
