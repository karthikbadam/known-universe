import {
  Box,
  Container,
  Divider,
  HStack,
  Heading,
  IconButton,
  Link,
  Select,
  Text,
  VStack,
  useColorMode,
} from "@chakra-ui/react";
import { MoonIcon, SunIcon } from "@chakra-ui/icons";

import { CMBPowerSpectrum } from "./plots/CMBPowerSpectrum";
import { HubbleDiagram } from "./plots/HubbleDiagram";

function Header(): JSX.Element {
  const { colorMode, toggleColorMode } = useColorMode();
  return (
    <Box
      as="header"
      borderBottom="1px solid"
      borderColor="navy.700"
      bg="navy.900"
      position="sticky"
      top={0}
      zIndex={10}
      backdropFilter="blur(8px)"
    >
      <Container maxW="6xl" py={3}>
        <HStack justify="space-between" align="center">
          <HStack spacing={3} align="baseline">
            <Heading as="h1" size="md" color="gold.300">
              Cosmology Visualization Lab
            </Heading>
            <Text color="navy.300" fontSize="sm" display={{ base: "none", md: "block" }}>
              Module 1 of an interactive journal
            </Text>
          </HStack>
          <HStack spacing={2}>
            <Select
              size="sm"
              w="auto"
              variant="filled"
              bg="navy.800"
              borderColor="navy.600"
              defaultValue="cosmology"
              isDisabled
              title="More fields coming in later modules"
            >
              <option value="cosmology">Cosmology</option>
              <option value="particle">Particle Physics (coming)</option>
              <option value="cmt">Condensed Matter (coming)</option>
            </Select>
            <IconButton
              size="sm"
              variant="ghost"
              aria-label="Toggle color mode"
              icon={colorMode === "dark" ? <SunIcon /> : <MoonIcon />}
              onClick={toggleColorMode}
            />
          </HStack>
        </HStack>
      </Container>
    </Box>
  );
}

function Hero(): JSX.Element {
  return (
    <Box as="section" py={{ base: 12, md: 20 }} px={{ base: 4, md: 6 }}>
      <Container maxW="3xl">
        <VStack align="stretch" spacing={5}>
          <Text
            color="gold.400"
            fontSize="sm"
            letterSpacing="widest"
            textTransform="uppercase"
            fontFamily="mono"
          >
            Module 01 · Cosmology
          </Text>
          <Heading as="h2" size="2xl" lineHeight="short">
            Ten plots built ΛCDM. Tune the parameters yourself.
          </Heading>
          <Text fontSize="lg" color="navy.100" lineHeight="tall">
            One scroll through the visualizations that turned cosmology from
            philosophy into a six-parameter model. Each plot opens with the
            physics question it answers, then shows the math, then the data,
            then a slider so you can see what changes when a parameter moves.
            The synthesis at the bottom shows how every plot above shifts when
            you change the six ΛCDM numbers.
          </Text>
          <Text fontSize="sm" color="navy.300">
            Gate 2 preview — the Hubble 1929 plot and the CMB angular
            power spectrum are wired up. The shared template, parameter
            binding, and data status badges are production-ready; the
            remaining eight plots ship in Gate 3.
          </Text>
        </VStack>
      </Container>
    </Box>
  );
}

function SynthesisStub(): JSX.Element {
  return (
    <Box
      as="section"
      py={{ base: 12, md: 16 }}
      px={{ base: 4, md: 6 }}
      bg="navy.800"
    >
      <Container maxW="3xl">
        <VStack align="stretch" spacing={4}>
          <Text
            color="gold.400"
            fontSize="sm"
            letterSpacing="widest"
            textTransform="uppercase"
            fontFamily="mono"
          >
            Synthesis · coming in Gate 3
          </Text>
          <Heading as="h2" size="xl" lineHeight="short">
            Six numbers, every plot.
          </Heading>
          <Text fontSize="md" color="navy.100" lineHeight="tall">
            The closing section will pin every plot above to six ΛCDM sliders:
            Ω<sub>b</sub>h², Ω<sub>c</sub>h², H₀, τ, A<sub>s</sub>, n<sub>s</sub>.
            Drag any one and watch the cosmic microwave background, the supernova
            Hubble diagram, and the BAO feature shift in lockstep. The point:
            the universe collapses to these six numbers.
          </Text>
        </VStack>
      </Container>
    </Box>
  );
}

function Footer(): JSX.Element {
  return (
    <Box as="footer" borderTop="1px solid" borderColor="navy.700" py={8}>
      <Container maxW="6xl">
        <VStack align="stretch" spacing={3} fontSize="sm" color="navy.300">
          <Heading as="h3" size="sm" color="navy.100">
            Data provenance
          </Heading>
          <Text>
            All datasets ship in <code>/public/data</code> with a six-line
            provenance header. Replacement instructions for every file live
            in <code>/scripts/fetch/</code>. Simulated fallbacks live in{" "}
            <code>/scripts/simulate/</code>.
          </Text>
          <Text>
            Source:{" "}
            <Link
              href="https://github.com/karthikbadam/known-universe"
              isExternal
            >
              github.com/karthikbadam/known-universe
            </Link>
          </Text>
          <Divider borderColor="navy.700" my={2} />
          <Text fontSize="xs" color="navy.400">
            Built with React, Chakra UI, Mosaic, DuckDB-WASM, and KaTeX.
          </Text>
        </VStack>
      </Container>
    </Box>
  );
}

export function App(): JSX.Element {
  return (
    <Box minH="100vh" bg="navy.900" color="navy.50">
      <Header />
      <Hero />
      <HubbleDiagram />
      <CMBPowerSpectrum />
      <SynthesisStub />
      <Footer />
    </Box>
  );
}

export default App;
