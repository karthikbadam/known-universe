import { Box } from "@chakra-ui/react";
import * as vg from "@uwdata/vgplot";
import { useEffect, useRef, useState } from "react";

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
interface ChartDimensions {
  width: number;
  height: number;
}

export function MosaicPlot({ spec, enabled = true, ariaLabel, height }: Props) {
  const hostRef = useRef<HTMLDivElement | null>(null);

  const [dimensions, setDimensions] = useState<ChartDimensions>({
    width: 0,
    height: 0,
  });

  // Track container dimensions with ResizeObserver
  useEffect(() => {
    const container = hostRef.current;
    if (!container) return;

    const resizeObserver = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (entry) {
        const { width, height } = entry.contentRect;
        setDimensions((prev) => {
          // Only update if changed to avoid unnecessary re-renders
          if (prev.width !== width || prev.height !== height) {
            return { width, height };
          }
          return prev;
        });
      }
    });

    resizeObserver.observe(container);
    return () => resizeObserver.disconnect();
  }, []);

  useEffect(() => {
    const host = hostRef.current;
    if (host === null || !enabled) return;
    const element = vg.plot(
      ...spec,
      vg.width(dimensions.width),
      vg.height(dimensions.height),
    ) as Node;
    host.replaceChildren(element);
    return () => {
      host.replaceChildren();
    };
  }, [spec, enabled, dimensions]);

  return (
    <Box
      ref={hostRef}
      w={{ base: "100%", md: "80%" }}
      mx="auto"
      minH={{ base: "350px", md: height ?? "250px" }}
      aria-label={ariaLabel}
      role="img"
    />
  );
}
