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

function Swatch({ color, mark }: { color: string; mark: LegendMark }) {
  if (mark === "line") {
    return (
      <Box
        w="16px"
        h="2px"
        mt="9px"
        bg={color}
        flexShrink={0}
      />
    );
  }
  if (mark === "dashed-line") {
    return (
      <Box
        w="16px"
        h="2px"
        mt="9px"
        flexShrink={0}
        backgroundImage={`linear-gradient(to right, ${color} 60%, transparent 0%)`}
        backgroundSize="5px 2px"
        backgroundRepeat="repeat-x"
      />
    );
  }
  return (
    <Box
      w="10px"
      h="10px"
      mt="5px"
      borderRadius="full"
      bg={color}
      flexShrink={0}
    />
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
