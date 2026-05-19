import {
  Box,
  Container,
  Heading,
  HStack,
  IconButton,
  Link,
  Text,
  VStack,
} from "@chakra-ui/react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { Navigate, Route, Routes, useParams } from "react-router-dom";

function Header() {
  const { resolvedTheme, setTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

  return (
    <Box
      as="header"
      borderBottomWidth="1px"
      borderColor="border"
      bg="bg.canvas"
      position="sticky"
      top={0}
      zIndex={10}
      px={{ base: 6, md: 8 }}
    >
      <Container maxW="4xl" px={0} py={4}>
        <HStack justify="space-between" align="center">
          <Text
            fontFamily="heading"
            fontSize="sm"
            fontWeight="medium"
            color="fg"
            letterSpacing="-0.01em"
          >
            Known Universe
          </Text>
          <IconButton
            size="sm"
            variant="ghost"
            aria-label="Toggle color mode"
            onClick={() => setTheme(isDark ? "light" : "dark")}
            color="fg.muted"
            _hover={{ color: "fg", bg: "transparent" }}
          >
            {isDark ? <Sun size={16} /> : <Moon size={16} />}
          </IconButton>
        </HStack>
      </Container>
    </Box>
  );
}

function Footer() {
  return (
    <Box
      as="footer"
      borderTopWidth="1px"
      borderColor="border"
      py={10}
      px={{ base: 6, md: 8 }}
      mt={20}
    >
      <Container maxW="3xl" px={0}>
        <VStack
          align="stretch"
          gap={3}
          fontSize="sm"
          color="fg.muted"
          fontFamily="body"
        >
          <Heading
            as="h3"
            fontFamily="heading"
            fontSize="sm"
            fontWeight="medium"
            color="fg"
            mb={1}
          >
            Data provenance
          </Heading>
          <Text>
            All datasets ship in <code>/public/data</code> with a six-line
            provenance header. Replacement instructions for every file live in{" "}
            <code>/scripts/fetch/</code>. Simulated fallbacks live in{" "}
            <code>/scripts/simulate/</code>.
          </Text>
          <Text>
            Source:{" "}
            <Link
              href="https://github.com/karthikbadam/known-universe"
              color="accent"
              _hover={{ textDecoration: "underline" }}
              target="_blank"
              rel="noopener noreferrer"
            >
              github.com/karthikbadam/known-universe
            </Link>
          </Text>
          <Text fontSize="xs" color="fg.subtle" mt={2}>
            Built with React 19, Chakra UI v3, Mosaic, DuckDB-WASM, and KaTeX.
          </Text>
        </VStack>
      </Container>
    </Box>
  );
}

function CatalogStub() {
  return (
    <Box
      as="section"
      pt={{ base: 12, md: 16 }}
      pb={{ base: 10, md: 16 }}
      px={{ base: 6, md: 8 }}
    >
      <Container maxW="4xl" px={0}>
        <Text fontFamily="body" fontSize={{ base: "md", md: "lg" }} color="fg">
          Catalog coming soon
        </Text>
      </Container>
    </Box>
  );
}

function ModuleStub() {
  const { slug } = useParams<{ slug: string }>();
  return (
    <Box
      as="section"
      pt={{ base: 12, md: 16 }}
      pb={{ base: 10, md: 16 }}
      px={{ base: 6, md: 8 }}
    >
      <Container maxW="4xl" px={0}>
        <Text fontFamily="body" fontSize={{ base: "md", md: "lg" }} color="fg">
          Module: {slug}
        </Text>
      </Container>
    </Box>
  );
}

export function App() {
  return (
    <Box minH="100vh" bg="bg.canvas" color="fg">
      <Header />
      <Routes>
        <Route path="/" element={<CatalogStub />} />
        <Route path="/m/:slug" element={<ModuleStub />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <Footer />
    </Box>
  );
}

export default App;
