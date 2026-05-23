import { Box, HStack, Text, VStack } from "@chakra-ui/react";

export interface LegendItem {
  name: string;
  description: string;
  color: string;
  dashed?: boolean;
}

interface Props {
  items: ReadonlyArray<LegendItem>;
}

export function PlotLegend({ items }: Props) {
  return (
    <HStack gap={6} flexWrap="wrap" pl={1}>
      {items.map((item) => (
        <HStack key={item.name} gap={2} align="flex-start">
          <Box
            w="10px"
            h="10px"
            mt="5px"
            borderRadius="full"
            bg={item.dashed ? "transparent" : item.color}
            borderWidth={item.dashed ? "1.5px" : 0}
            borderStyle={item.dashed ? "dashed" : "solid"}
            borderColor={item.color}
            flexShrink={0}
          />
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
