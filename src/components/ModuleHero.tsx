import { Box, Container, Heading, Text, VStack } from "@chakra-ui/react";

import type { ModuleMeta } from "../modules/types";

interface ModuleHeroProps {
  meta: ModuleMeta;
}

export function ModuleHero({ meta }: ModuleHeroProps) {
  return (
    <Box
      as="section"
      pt={8}
      pb={12}
      px={{ base: 6, md: 8 }}
    >
      <Container maxW="4xl" px={0}>
        <VStack align="stretch" gap={4}>
          <Text
            color="fg.muted"
            fontFamily="mono"
            fontSize="xs"
            letterSpacing="0.12em"
            textTransform="uppercase"
          >
            {meta.heroLabel}
          </Text>
          <Heading
            as="h1"
            fontFamily="body"
            fontWeight="normal"
            fontSize={{ base: "3xl", md: "5xl" }}
            lineHeight="1.15"
            color="fg"
            letterSpacing="-0.02em"
          >
            {meta.title}
          </Heading>
          <Text
            fontFamily="body"
            fontSize={{ base: "md", md: "lg" }}
            lineHeight="1.7"
          >
            {meta.summary}
          </Text>
        </VStack>
      </Container>
    </Box>
  );
}

export default ModuleHero;
