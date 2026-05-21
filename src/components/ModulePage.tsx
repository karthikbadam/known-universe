import { Box, Container, Link as ChakraLink } from "@chakra-ui/react";
import { Link as RouterLink } from "react-router-dom";

import type { ModuleMeta } from "../modules/types";
import { ModuleHero } from "./ModuleHero";

interface ModulePageProps {
  meta: ModuleMeta;
}

export function ModulePage({ meta }: ModulePageProps) {
  return (
    <Box minH="100vh" bg="bg.canvas" color="fg">
      <Box px={{ base: 6, md: 8 }} pt={{ base: 6, md: 8 }}>
        <Container maxW="4xl" px={0}>
          <ChakraLink
            asChild
            fontFamily="body"
            fontSize="sm"
            color="fg.muted"
            _hover={{ color: "fg", textDecoration: "underline" }}
          >
            <RouterLink to="/">← All modules</RouterLink>
          </ChakraLink>
        </Container>
      </Box>
      <ModuleHero meta={meta} />
      {meta.sections()}
    </Box>
  );
}

export default ModulePage;
