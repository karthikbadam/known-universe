import {
  Box,
  Heading,
  HStack,
  Stack,
  Text,
  VStack
} from "@chakra-ui/react";
import { type ReactNode } from "react";

interface Props {
  index: number;
  title: string;
  question: string;

  summary: ReactNode;
  math: ReactNode;
  plot: ReactNode;
  controls: ReactNode;
  legend?: ReactNode;
  // "controls" puts the legend below the slider stack in the right column;
  // "above-plot" puts it directly above the chart. Default "controls" works
  // for 1–2 sliders; switch to "above-plot" when the slider stack is tall.
  legendPlacement?: "controls" | "above-plot";
  rules: ReactNode;
  takeaway?: ReactNode;
  citation: ReactNode;
}

export function PlotSection({
  index,
  title,
  question,
  summary,
  math,
  plot,
  controls,
  legend,
  legendPlacement = "controls",
  rules,
  takeaway,
  citation,
}: Props) {
  const legendBelowControls = legend && legendPlacement === "controls";
  const legendAbovePlot = legend && legendPlacement === "above-plot";
  const plotWithLegend = legendAbovePlot ? (
    <VStack align="stretch" gap={3}>
      {legend}
      {plot}
    </VStack>
  ) : plot;
  return (
    <Box
      as="section"
      py={12}
      px={{ base: 6, md: 8 }}
      borderTopWidth="1px"
      borderColor="border"
    >
      <VStack align="stretch" gap={4} maxW="4xl" mx="auto">
        <HStack align="baseline" gap={4} flexWrap="wrap">
          <Text
            color="fg.subtle"
            fontFamily="mono"
            fontSize="sm"
            letterSpacing="0.1em"
          >
            {String(index).padStart(2, "0")}
          </Text>
          <Heading
            as="h2"
            fontFamily="heading"
            fontSize={{ base: "xl", md: "2xl" }}
            fontWeight="medium"
            color="fg"
            letterSpacing="-0.01em"
            flex="1"
          >
            {title}
          </Heading>
        </HStack>

        <Text
          fontFamily="body"
          fontSize={{ base: "lg", md: "xl" }}
          color="fg"
          lineHeight="1.5"
        >
          {question}
        </Text>

        <Box fontFamily="body" fontSize="md" lineHeight="1.75">
          {summary}
        </Box>
        <Box>{math}</Box>
        {controls || legendBelowControls ? (
          <Stack
            direction={{ base: "column", md: "row" }}
            align="flex-start"
            gap={8}
            w="100%"
            mt={4}
          >
            <Box flex="1" minW={0} w={{ base: "100%", md: "auto" }}>
              {plotWithLegend}
            </Box>
            <Box
              w={{ base: "100%", md: "auto" }}
              maxW={{ base: "100%", md: "320px" }}
              flexShrink={0}
            >
              <VStack align="stretch" gap={4}>
                {controls}
                {legendBelowControls ? (
                  <Box mt={controls ? 6 : 0}>{legend}</Box>
                ) : null}
              </VStack>
            </Box>
          </Stack>
        ) : (
          <Box w="100%" mt={4}>{plotWithLegend}</Box>
        )}
        {rules}
        {takeaway ? (
          <Box fontFamily="body" fontSize="md" lineHeight="1.75">
            {takeaway}
          </Box>
        ) : null}
        {citation}
      </VStack>
    </Box>
  );
}
