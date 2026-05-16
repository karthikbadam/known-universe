/**
 * Shared chart sizing constants. All plots reference these so that heights,
 * margins, and the responsive minH stay aligned across the site.
 */
export const CHART_HEIGHT = {
  /** Default for full-width interactive plots. */
  standard: 440,
  /** Side-by-side or in-text thumbnails (e.g. LCDM synthesis pair). */
  thumb: 220,
} as const;

export const PLOT_MARGINS = {
  left: 80,
  top: 40,
  bottom: 50,
} as const;
