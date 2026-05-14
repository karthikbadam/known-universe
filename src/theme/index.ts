import { extendTheme, type ThemeConfig } from "@chakra-ui/react";

// Navy / gold palette. Hex anchors chosen to evoke a starfield-on-deep-water
// aesthetic; swap if a prior project pins exact values.
const navy = {
  50: "#e9eef7",
  100: "#c8d2e6",
  200: "#a3b3d2",
  300: "#7d92be",
  400: "#5a72ac",
  500: "#3d5897",
  600: "#2a4276",
  700: "#1a2e57",
  800: "#0f1f3c",
  900: "#070f1f",
};

const gold = {
  50: "#fdf6e3",
  100: "#fae8b9",
  200: "#f6d586",
  300: "#f1c156",
  400: "#e8ad2a",
  500: "#d4a017",
  600: "#a87d10",
  700: "#7c5b0a",
  800: "#503a06",
  900: "#291d03",
};

const config: ThemeConfig = {
  initialColorMode: "dark",
  useSystemColorMode: false,
};

export const theme = extendTheme({
  config,
  colors: {
    navy,
    gold,
    brand: gold,
  },
  fonts: {
    heading:
      'ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    body: 'ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    mono: 'ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, monospace',
  },
  styles: {
    global: {
      "body": {
        bg: "navy.900",
        color: "navy.50",
      },
      // KaTeX inherits color from container; force light in dark mode
      ".katex": {
        color: "navy.50",
      },
      ".katex-display": {
        overflowX: "auto",
        overflowY: "hidden",
        paddingY: 2,
      },
      // Mosaic Plot SVG defaults to black text; recolor for dark mode
      ".plot text": {
        fill: "var(--chakra-colors-navy-50) !important",
      },
      ".plot .tick line": {
        stroke: "var(--chakra-colors-navy-400) !important",
      },
      ".plot .domain": {
        stroke: "var(--chakra-colors-navy-400) !important",
      },
    },
  },
  components: {
    Heading: {
      baseStyle: {
        color: "gold.300",
        letterSpacing: "tight",
      },
    },
    Link: {
      baseStyle: {
        color: "gold.400",
        _hover: { color: "gold.200", textDecoration: "underline" },
      },
    },
  },
});

export type AppTheme = typeof theme;
