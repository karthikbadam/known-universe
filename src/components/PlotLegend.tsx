import { Box, HStack, Text, VStack } from "@chakra-ui/react";

export type LegendMark = "dot" | "line" | "dashed-line";

export interface LegendItem {
  name: string;
  description: string;
  color: string;
  mark?: LegendMark;
}

interface Props {
  items: ReadonlyArray<LegendItem>;
}

const SWATCH_WIDTH = "16px";

function Swatch({ color, mark }: { color: string; mark: LegendMark }) {
  if (mark === "line") {
    return (
      <Box
        w={SWATCH_WIDTH}
        display="flex"
        alignItems="center"
        justifyContent="center"
        h="14px"
        mt="2px"
        flexShrink={0}
      >
        <Box w="100%" h="2px" bg={color} />
      </Box>
    );
  }
  if (mark === "dashed-line") {
    return (
      <Box
        w={SWATCH_WIDTH}
        display="flex"
        alignItems="center"
        justifyContent="center"
        h="14px"
        mt="2px"
        flexShrink={0}
      >
        <Box
          w="100%"
          h="2px"
          backgroundImage={`linear-gradient(to right, ${color} 60%, transparent 0%)`}
          backgroundSize="5px 2px"
          backgroundRepeat="repeat-x"
        />
      </Box>
    );
  }
  return (
    <Box
      w={SWATCH_WIDTH}
      display="flex"
      alignItems="center"
      justifyContent="center"
      h="14px"
      mt="2px"
      flexShrink={0}
    >
      <Box w="10px" h="10px" borderRadius="full" bg={color} />
    </Box>
  );
}

export function PlotLegend({ items }: Props) {
  return (
    <HStack gap={6} flexWrap="wrap" pl={1}>
      {items.map((item) => (
        <HStack key={item.name} gap={2} align="flex-start">
          <Swatch color={item.color} mark={item.mark ?? "dot"} />
          <VStack align="flex-start" gap={0}>
            <Text
              fontFamily="mono"
              fontSize="xs"
              color="fg"
              letterSpacing="0.04em"
            >
              {item.name}
            </Text>
            <Text
              fontFamily="body"
              fontSize="xs"
              color="fg.subtle"
              lineHeight="1.3"
            >
              {item.description}
            </Text>
          </VStack>
        </HStack>
      ))}
    </HStack>
  );
}
