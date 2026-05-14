import { Box, Divider, Heading, HStack, Text, VStack } from "@chakra-ui/react";
import { type ReactNode } from "react";

import { DataStatusBadge, type DataStatus } from "./DataStatusBadge";

interface Props {
  index: number;
  title: string;
  question: string;

  summary: ReactNode;
  math: ReactNode;
  plot: ReactNode;
  controls: ReactNode;
  rules: ReactNode;
  citation: ReactNode;

  dataStatus: DataStatus;
}

// Shared template every plot section follows. Order matches the spec:
//   physics question -> summary -> math -> plot -> controls ->
//   rules-in/out -> citation
export function PlotSection({
  index,
  title,
  question,
  summary,
  math,
  plot,
  controls,
  rules,
  citation,
  dataStatus,
}: Props): JSX.Element {
  return (
    <Box as="section" py={{ base: 8, md: 12 }} px={{ base: 4, md: 6 }}>
      <VStack align="stretch" spacing={4} maxW="6xl" mx="auto">
        <HStack align="baseline" spacing={3} flexWrap="wrap">
          <Text
            color="gold.500"
            fontFamily="mono"
            fontSize="sm"
            letterSpacing="wider"
          >
            {String(index).padStart(2, "0")}
          </Text>
          <Heading as="h2" size="lg">
            {title}
          </Heading>
          <DataStatusBadge status={dataStatus} />
        </HStack>

        <Heading as="h3" size="md" color="navy.50" fontWeight="normal">
          {question}
        </Heading>

        <Box color="navy.100" fontSize="md" lineHeight="tall">
          {summary}
        </Box>

        <Box>{math}</Box>

        <Divider borderColor="navy.700" my={2} />

        <Box w="100%" minH="320px">{plot}</Box>

        <Box>{controls}</Box>

        <Divider borderColor="navy.700" my={2} />

        {rules}

        {citation}
      </VStack>
    </Box>
  );
}
