import { Box } from "@chakra-ui/react";
import * as vg from "@uwdata/vgplot";
import { useEffect, useRef, useState } from "react";

interface Props {
  spec: ReadonlyArray<unknown>;
  enabled?: boolean;
  ariaLabel: string;
  /** Intrinsic plot height in pixels. Also seeds the responsive minH so SSR/first paint match. */
  height: number;
  /**
   * Optional CSS aspect ratio (width / height). When set, the container's
   * height is derived from its observed width via CSS `aspect-ratio`, so
   * the plot stays correctly proportioned at any viewport size. The `height`
   * prop is then only used as a first-paint fallback before ResizeObserver
   * reports a real height.
   */
  aspectRatio?: number;
}

interface ChartDimensions {
  width: number;
  height: number;
}

/**
 * Thin React wrapper around Mosaic's framework-agnostic `vg.plot(...)`.
 * Owns the host DOM element, mounts the plot once per `spec` change, and
 * cleans up on unmount. CSS sets a fixed pixel height anchored on `height`,
 * while the ResizeObserver feeds the actual measured width to vgplot so the
 * SVG fills the container without stretching past the declared aspect.
 */
export function MosaicPlot({
  spec,
  enabled = true,
  ariaLabel,
  height,
  aspectRatio,
}: Props) {
  const hostRef = useRef<HTMLDivElement | null>(null);

  const [dimensions, setDimensions] = useState<ChartDimensions>({
    width: 0,
    height,
  });

  useEffect(() => {
    const container = hostRef.current;
    if (!container) return;

    const resizeObserver = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (!entry) return;
      const { width, height: observedHeight } = entry.contentRect;
      const nextHeight = aspectRatio ? observedHeight : height;
      setDimensions((prev) =>
        prev.width === width && prev.height === nextHeight
          ? prev
          : { width, height: nextHeight },
      );
    });

    resizeObserver.observe(container);
    return () => resizeObserver.disconnect();
  }, [height, aspectRatio]);

  useEffect(() => {
    const host = hostRef.current;
    if (host === null || !enabled || dimensions.width === 0) return;
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
      w="100%"
      mx="auto"
      {...(aspectRatio
        ? { style: { aspectRatio: `${aspectRatio} / 1` } }
        : { h: `${height}px` })}
      aria-label={ariaLabel}
      role="img"
    />
  );
}
