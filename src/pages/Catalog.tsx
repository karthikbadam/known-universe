import {
  Box,
  Container,
  Heading,
  SimpleGrid,
  Text,
  VStack,
} from "@chakra-ui/react";
import { ModuleCard } from "../components/ModuleCard";
import { MODULES } from "../modules";

export function Catalog() {
  return (
    <Box
      as="section"
      pt={{ base: 8, md: 12 }}
      pb={{ base: 8, md: 12 }}
      px={{ base: 6, md: 8 }}
    >
      <Container maxW="4xl" px={0}>
        <VStack align="stretch" gap={4} mb={{ base: 10, md: 12 }}>
          <Heading
            as="h1"
            fontFamily="heading"
            fontSize={{ base: "2xl", md: "4xl" }}
            fontWeight="medium"
            color="fg"
            letterSpacing="-0.02em"
          >
            Known Universe
          </Heading>
          <Text
            fontFamily="body"
            fontSize={{ base: "md", md: "lg" }}
            color="fg.muted"
            maxW="3xl"
            lineHeight="1.6"
          >
            An interactive journal of canonical visualizations in scientific
            fields. Each module is a single-page scroll through plots that build
            the core knowledge of the field.
          </Text>
        </VStack>
        <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} gap={8}>
          {MODULES.map((m) => (
            <ModuleCard key={m.id} meta={m} />
          ))}
        </SimpleGrid>
      </Container>
    </Box>
  );
}

export default Catalog;
