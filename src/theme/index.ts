import { createSystem, defaultConfig, defineConfig } from "@chakra-ui/react";

// Distill-style monochrome palette built on Chakra v3 semantic tokens.
// next-themes adds `.dark` to <html>; Chakra's `_dark` condition selects
// `.dark &`, so the same token names flip across modes automatically.
const config = defineConfig({
  globalCss: {
    "html, body": {
      bg: "bg.canvas",
      color: "fg",
    },
    ".katex": {
      color: "var(--chakra-colors-fg)",
    },
    ".katex-display": {
      overflowX: "auto",
      overflowY: "hidden",
      paddingY: "2",
    },
    ".plot text": {
      fill: "var(--chakra-colors-fg) !important",
    },
    ".plot .tick text": {
      fill: "var(--chakra-colors-fg-muted) !important",
    },
    ".plot .tick line": {
      stroke: "var(--chakra-colors-fg-subtle) !important",
    },
    ".plot .domain": {
      stroke: "var(--chakra-colors-fg-subtle) !important",
    },
  },
  theme: {
    semanticTokens: {
      colors: {
        bg: {
          canvas: { value: { base: "#ffffff", _dark: "#0a0a0a" } },
          subtle: { value: { base: "#fafafa", _dark: "#141414" } },
        },
        fg: {
          DEFAULT: { value: { base: "#111111", _dark: "#f5f5f5" } },
          muted: { value: { base: "#555555", _dark: "#a3a3a3" } },
          subtle: { value: { base: "#888888", _dark: "#6b6b6b" } },
        },
        border: {
          DEFAULT: { value: { base: "#e5e5e5", _dark: "#262626" } },
        },
        accent: {
          DEFAULT: { value: { base: "#e85d04", _dark: "#ff7a1a" } },
          fg: { value: { base: "#ffffff", _dark: "#0a0a0a" } },
        },
      },
    },
    tokens: {
      fonts: {
        heading: {
          value:
            'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
        },
        body: {
          value:
            'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
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
