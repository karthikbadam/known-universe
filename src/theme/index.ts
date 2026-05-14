import { createSystem, defaultConfig, defineConfig } from "@chakra-ui/react";

// Navy / gold palette. Hex anchors chosen to evoke a starfield-on-deep-water
// aesthetic. v3 token shape is `{ value: "#..." }`; reference as
// `colors: "navy.500"` in component props.
const NAVY = {
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
} as const;

const GOLD = {
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
} as const;

function tokenScale<T extends Record<string, string>>(
  scale: T,
): Record<keyof T, { value: string }> {
  const out = {} as Record<keyof T, { value: string }>;
  for (const [k, v] of Object.entries(scale)) {
    out[k as keyof T] = { value: v };
  }
  return out;
}

const config = defineConfig({
  globalCss: {
    "html, body": {
      bg: "navy.900",
      color: "navy.50",
    },
    ".katex": {
      color: "navy.50",
    },
    ".katex-display": {
      overflowX: "auto",
      overflowY: "hidden",
      paddingY: "2",
    },
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
  theme: {
    tokens: {
      colors: {
        navy: tokenScale(NAVY),
        gold: tokenScale(GOLD),
      },
      fonts: {
        heading: {
          value:
            'ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
        },
        body: {
          value:
            'ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
        },
        mono: {
          value:
            'ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, monospace',
        },
      },
    },
  },
});

export const system = createSystem(defaultConfig, config);
