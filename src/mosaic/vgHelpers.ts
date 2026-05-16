import * as vg from "@uwdata/vgplot";

import { PLOT_MARGINS } from "../theme/chartDimensions";

export interface VgFrameOptions {
  xLabel: string;
  yLabel: string;
  xDomain: [number, number];
  yDomain: [number, number];
  /** Per-plot overrides on the shared PLOT_MARGINS. */
  margins?: { left?: number; top?: number; bottom?: number };
  /** Apply a log y-scale via the attribute escape hatch (vgplot 0.26 omits yScale from its types). */
  yLog?: boolean;
}

/**
 * Returns the shared axis labels, domains, and margins every plot uses,
 * so spec memos stay focused on marks rather than chrome.
 */
export function vgFrame(opts: VgFrameOptions): unknown[] {
  const left = opts.margins?.left ?? PLOT_MARGINS.left;
  const top = opts.margins?.top ?? PLOT_MARGINS.top;
  const bottom = opts.margins?.bottom ?? PLOT_MARGINS.bottom;
  const frame: unknown[] = [
    vg.xLabel(opts.xLabel),
    vg.yLabel(opts.yLabel),
    vg.xDomain(opts.xDomain),
    vg.yDomain(opts.yDomain),
    vg.marginLeft(left),
    vg.marginTop(top),
    vg.marginBottom(bottom),
  ];
  if (opts.yLog) {
    frame.push((plot: { attributes: Record<string, unknown> }) => {
      plot.attributes.yScale = "log";
    });
  }
  return frame;
}
