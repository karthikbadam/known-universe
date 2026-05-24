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
  rules,
  takeaway,
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
      <VStack align="stretch" gap={8} maxW="4xl" mx="auto">
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
        {controls ? (
          <Stack
            direction={{ base: "column", md: "row" }}
            align="flex-start"
            gap={8}
            w="100%"
            mt={4}
          >
            <Box flex="1" minW={0} w={{ base: "100%", md: "auto" }}>{plot}</Box>
            <Box
              w={{ base: "100%", md: "auto" }}
              maxW={{ base: "100%", md: "320px" }}
              flexShrink={0}
            >
              <VStack align="stretch" gap={4}>
                {controls}
              </VStack>
            </Box>
          </Stack>
        ) : (
          <Box w="100%" mt={4}>{plot}</Box>
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
