// Chart palette. Plot components consume hex values directly because
// vgplot stroke/fill channels need literal CSS colours, not Chakra tokens.
// Keeping them here keeps all plots in visual sync — change once, update
// everywhere.

export const chartPalette = {
  // Data points / observed measurements
  dataFill: "#f1c156",
  dataStroke: "#e8ad2a",

  // Theory / model curve
  modelStroke: "#e9eef7",

  // Error bars / vertical rules / faint guides
  errorStroke: "#a3b3d2",

  // Axis lines and tick guides
  axisStroke: "#5a72ac",

  // Highlight / vertical user guide
  highlightStroke: "#f1c156",

  // Background canvas fill (for canvas-based plots)
  backgroundDark: "#070f1f",
} as const;
