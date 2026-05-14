import {
  Box,
  Container,
  Heading,
  HStack,
  IconButton,
  Link,
  NativeSelect,
  Separator,
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
  // next-themes drives color mode; resolvedTheme avoids the SSR-flash flicker
  // even though we're CSR-only (forward-compatible).
  const { resolvedTheme, setTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

  return (
    <Box
      as="header"
      borderBottomWidth="1px"
      borderColor="navy.700"
      bg="navy.900"
      position="sticky"
      top={0}
      zIndex={10}
      backdropFilter="blur(8px)"
    >
      <Container maxW="6xl" py={3}>
        <HStack justify="space-between" align="center">
          <HStack gap={3} align="baseline">
            <Heading as="h1" size="md" color="gold.300">
              Cosmology Visualization Lab
            </Heading>
            <Text
              color="navy.300"
              fontSize="sm"
              display={{ base: "none", md: "block" }}
            >
              Module 1 of an interactive journal
            </Text>
          </HStack>
          <HStack gap={2}>
            <NativeSelect.Root
              size="sm"
              w="auto"
              bg="navy.800"
              borderColor="navy.600"
              disabled
              title="More fields coming in later modules"
            >
              <NativeSelect.Field defaultValue="cosmology">
                <option value="cosmology">Cosmology</option>
                <option value="particle">Particle Physics (coming)</option>
                <option value="cmt">Condensed Matter (coming)</option>
              </NativeSelect.Field>
              <NativeSelect.Indicator />
            </NativeSelect.Root>
            <IconButton
              size="sm"
              variant="ghost"
              aria-label="Toggle color mode"
              onClick={() => setTheme(isDark ? "light" : "dark")}
            >
              {isDark ? <Sun /> : <Moon />}
            </IconButton>
          </HStack>
        </HStack>
      </Container>
    </Box>
  );
}

function Hero() {
  return (
    <Box as="section" py={{ base: 12, md: 20 }} px={{ base: 4, md: 6 }}>
      <Container maxW="3xl">
        <VStack align="stretch" gap={5}>
          <Text
            color="gold.400"
            fontSize="sm"
            letterSpacing="widest"
            textTransform="uppercase"
            fontFamily="mono"
          >
            Module 01 · Cosmology
          </Text>
          <Heading as="h2" size="2xl" lineHeight="short" color="gold.300">
            Ten plots built ΛCDM. Tune the parameters yourself.
          </Heading>
          <Text fontSize="lg" color="navy.100" lineHeight="tall">
            One scroll through the visualizations that turned cosmology from
            philosophy into a six-parameter model. Each plot opens with the
            physics question it answers, then shows the math, then the data,
            then sliders so you can see what changes when a parameter moves.
            The synthesis at the bottom collapses every plot above into the
            six ΛCDM numbers.
          </Text>
        </VStack>
      </Container>
    </Box>
  );
}

function Footer() {
  return (
    <Box as="footer" borderTopWidth="1px" borderColor="navy.700" py={8}>
      <Container maxW="6xl">
        <VStack align="stretch" gap={3} fontSize="sm" color="navy.300">
          <Heading as="h3" size="sm" color="navy.100">
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
              color="gold.400"
              _hover={{ color: "gold.200", textDecoration: "underline" }}
              target="_blank"
              rel="noopener noreferrer"
            >
              github.com/karthikbadam/known-universe
            </Link>
          </Text>
          <Separator borderColor="navy.700" my={2} />
          <Text fontSize="xs" color="navy.400">
            Built with React 19, Chakra UI v3, Mosaic, DuckDB-WASM, and KaTeX.
          </Text>
        </VStack>
      </Container>
    </Box>
  );
}

export function App() {
  return (
    <Box minH="100vh" bg="navy.900" color="navy.50">
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
