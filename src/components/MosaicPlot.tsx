import { Box } from "@chakra-ui/react";
import { useEffect, useRef } from "react";
import * as vg from "@uwdata/vgplot";

interface Props {
  spec: ReadonlyArray<unknown>;
  enabled?: boolean;
  ariaLabel: string;
  /** Intrinsic plot height in pixels, must match the vg.height(...) value in the spec. Used as the aspect-ratio anchor for responsive scaling. */
  height: number;
}

/**
 * Thin React wrapper around Mosaic's framework-agnostic `vg.plot(...)`.
 * Owns the host DOM element, mounts the plot once per `spec` change, and
 * cleans up on unmount. CSS scales the generated SVG to fill the container
 * width while preserving its native aspect ratio.
 */
export function MosaicPlot({
  spec,
  enabled = true,
  ariaLabel,
  height,
}: Props) {
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
      minH={`${height}px`}
      css={{
        "& > .plot": { width: "100%", mx: "auto" },
        "& > .plot > svg, & > .plot svg": {
          width: "100% !important",
          height: "auto !important",
          maxWidth: "100%",
          display: "block",
        },
      }}
      aria-label={ariaLabel}
      role="img"
    />
  );
}
