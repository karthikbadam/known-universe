import { Box, type BoxProps } from "@chakra-ui/react";
import { useEffect, useRef } from "react";
import * as vg from "@uwdata/vgplot";

interface Props {
  /**
   * Array of vgplot directives. Wrap the construction in `useMemo` so the
   * effect only re-runs when inputs change.
   */
  spec: ReadonlyArray<unknown>;
  /** When false, the plot does not render (e.g. while data is loading). */
  enabled?: boolean;
  /** Accessible description; rendered as the host element's aria-label. */
  ariaLabel: string;
  /** Minimum height of the container while the plot mounts. */
  minHeight?: BoxProps["minH"];
}

/**
 * Thin React wrapper around Mosaic's framework-agnostic `vg.plot(...)`.
 * It owns the host DOM element, mounts the plot once per `spec` change, and
 * cleans up on unmount. Centralising this pattern is the difference between
 * 30 lines of identical boilerplate in every plot section and one line.
 */
export function MosaicPlot({
  spec,
  enabled = true,
  ariaLabel,
  minHeight = "440px",
}: Props): JSX.Element {
  const hostRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const host = hostRef.current;
    if (host === null || !enabled) return;
    const element = vg.plot(...spec) as Node;
    host.replaceChildren(element);
    return () => {
      host.replaceChildren();
    };
  }, [spec, enabled]);

  return (
    <Box
      ref={hostRef}
      w="100%"
      overflowX="auto"
      sx={{ "& > .plot": { mx: "auto" } }}
      minH={minHeight}
      aria-label={ariaLabel}
      role="img"
    />
  );
}
