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

import { BAOFeature } from "./plots/BAOFeature";
import { BBNAbundances } from "./plots/BBNAbundances";
import { CMBMap } from "./plots/CMBMap";
import { CMBPowerSpectrum } from "./plots/CMBPowerSpectrum";
import { EHTShadow } from "./plots/EHTShadow";
import { GW150914 } from "./plots/GW150914";
import { HubbleDiagram } from "./plots/HubbleDiagram";
import { LCDMSynthesis } from "./plots/LCDMSynthesis";
import { RotationCurves } from "./plots/RotationCurves";
import { SupernovaHubble } from "./plots/SupernovaHubble";

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
    >
      <Container maxW="4xl" py={4}>
        <HStack justify="space-between" align="center">
          <HStack gap={3} align="baseline">
            <Text
              fontFamily="heading"
              fontSize="sm"
              fontWeight="medium"
              color="fg"
              letterSpacing="-0.01em"
            >
              Known Universe
            </Text>
            <Text
              fontFamily="mono"
              fontSize="xs"
              color="fg.subtle"
              letterSpacing="0.08em"
              textTransform="uppercase"
              display={{ base: "none", sm: "inline" }}
            >
              Module 01 / Cosmology
            </Text>
          </HStack>
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

function Hero() {
  return (
    <Box as="section" pt={{ base: 16, md: 28 }} pb={{ base: 10, md: 16 }} px={{ base: 6, md: 8 }}>
      <Container maxW="3xl" px={0}>
        <VStack align="stretch" gap={6}>
          <Text
            color="fg.subtle"
            fontFamily="mono"
            fontSize="xs"
            letterSpacing="0.12em"
            textTransform="uppercase"
          >
            Known Universe / Module 01 / Cosmology
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
            Ten plots build ΛCDM. Tune the parameters yourself.
          </Heading>
          <Text
            fontFamily="body"
            fontSize={{ base: "md", md: "lg" }}
            color="fg.muted"
            lineHeight="1.7"
          >
            Known Universe is an interactive journal of canonical visualizations
            in scientific fields. Cosmology is the first of many modules. One scroll
            through the visualizations that turned cosmology from philosophy
            into a six-parameter model. Each plot opens with the scientific
            question it answers, then shows the math, then the data, then
            sliders so you can see what changes when a parameter moves.
          </Text>
        </VStack>
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

export function App() {
  return (
    <Box minH="100vh" bg="bg.canvas" color="fg">
      <Header />
      <Hero />
      <HubbleDiagram />
      <BBNAbundances />
      <CMBMap />
      <CMBPowerSpectrum />
      <SupernovaHubble />
      <RotationCurves />
      <BAOFeature />
      <EHTShadow />
      <GW150914 />
      <LCDMSynthesis />
      <Footer />
    </Box>
  );
}

export default App;
