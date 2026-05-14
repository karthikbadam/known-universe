import { Box, Code } from "@chakra-ui/react";
import { Component, type ReactNode } from "react";
import { BlockMath, InlineMath } from "react-katex";

interface BlockProps {
  children: string;
  ariaLabel?: string;
}

interface InlineProps {
  children: string;
}

interface FallbackState {
  failed: boolean;
}

class KatexErrorBoundary extends Component<
  { children: ReactNode; raw: string },
  FallbackState
> {
  state: FallbackState = { failed: false };

  static getDerivedStateFromError(): FallbackState {
    return { failed: true };
  }

  override render(): ReactNode {
    if (this.state.failed) {
      return (
        <Box color="orange.300" fontSize="sm">
          [math failed to render] <Code>{this.props.raw}</Code>
        </Box>
      );
    }
    return this.props.children;
  }
}

export function MathBlock({ children, ariaLabel }: BlockProps): JSX.Element {
  return (
    <Box
      role="math"
      aria-label={ariaLabel ?? "equation"}
      my={3}
      overflowX="auto"
      maxW="100%"
    >
      <KatexErrorBoundary raw={children}>
        <BlockMath math={children} />
      </KatexErrorBoundary>
    </Box>
  );
}

export function MathInline({ children }: InlineProps): JSX.Element {
  return (
    <KatexErrorBoundary raw={children}>
      <InlineMath math={children} />
    </KatexErrorBoundary>
  );
}
