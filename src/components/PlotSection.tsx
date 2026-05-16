import { Box, Heading, HStack, Separator, Text, VStack } from "@chakra-ui/react";
import { type ReactNode } from "react";

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
}

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
}: Props) {
  return (
    <Box
      as="section"
      py={{ base: 16, md: 24 }}
      px={{ base: 6, md: 8 }}
      borderTopWidth="1px"
      borderColor="border"
    >
      <VStack align="stretch" gap={6} maxW="4xl" mx="auto">
        <HStack align="baseline" gap={4} flexWrap="wrap">
          <Text
            color="fg.subtle"
            fontFamily="mono"
            fontSize="xs"
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
          fontStyle="italic"
        >
          {question}
        </Text>

        <Box
          fontFamily="body"
          color="fg.muted"
          fontSize="md"
          lineHeight="1.75"
        >
          {summary}
        </Box>

        <Box>{math}</Box>

        <Separator borderColor="border" my={2} />

        <Box w="100%">{plot}</Box>

        <Box>{controls}</Box>

        <Separator borderColor="border" my={2} />

        {rules}

        {citation}
      </VStack>
    </Box>
  );
}
