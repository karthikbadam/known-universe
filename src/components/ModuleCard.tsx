import { Box, Heading, Link, Text, VStack } from "@chakra-ui/react";
import { Link as RouterLink } from "react-router-dom";
import type { ModuleMeta } from "../modules/types";

interface Props {
  meta: ModuleMeta;
}

function Cover({ meta }: Props) {
  const cover = meta.cover;
  return (
    <Box
      position="relative"
      w="100%"
      aspectRatio={16 / 9}
      maxH={{ base: "auto", md: "240px" }}
      overflow="hidden"
      bg="bg.subtle"
    >
      {cover?.kind === "image" && (
        <Box
          as="img"
          // @ts-expect-error chakra Box passes through native img attrs
          src={cover.src}
          alt={cover.alt}
          w="100%"
          h="100%"
          objectFit="cover"
          display="block"
        />
      )}
      {cover?.kind === "gradient" && (
        <Box
          w="100%"
          h="100%"
          backgroundImage={`linear-gradient(to bottom right, ${cover.from}, ${cover.to})`}
          _dark={{
            backgroundImage: `linear-gradient(to bottom right, ${cover.fromDark ?? cover.from}, ${cover.toDark ?? cover.to})`,
          }}
        />
      )}
      {meta.status === "soon" && (
        <Box
          position="absolute"
          top={3}
          right={3}
          bg="bg.canvas"
          borderWidth="1px"
          borderColor="border"
          px={2}
          py={1}
        >
          <Text
            fontFamily="mono"
            fontSize="2xs"
            textTransform="uppercase"
            letterSpacing="0.1em"
            color="fg.muted"
            lineHeight="1"
          >
            Coming soon
          </Text>
        </Box>
      )}
    </Box>
  );
}

function CardBody({ meta }: Props) {
  return (
    <VStack align="stretch" gap={2} px={4} pt={4} pb={5}>
      <Text
        fontFamily="mono"
        fontSize="xs"
        color="fg.subtle"
        letterSpacing="0.1em"
        textTransform="uppercase"
      >
        {meta.heroLabel}
      </Text>
      <Heading
        as="h3"
        fontFamily="heading"
        fontSize={{ base: "lg", md: "xl" }}
        fontWeight="medium"
        color="fg"
        letterSpacing="-0.01em"
      >
        {meta.title}
      </Heading>
      <Text
        fontFamily="body"
        fontSize="sm"
        color="fg.muted"
        lineHeight="1.6"
        whiteSpace="nowrap"
        overflow="hidden"
        textOverflow="ellipsis"
      >
        {meta.tagline}
      </Text>
    </VStack>
  );
}

export function ModuleCard({ meta }: Props) {
  const isSoon = meta.status === "soon";

  const cardSx = {
    position: "relative" as const,
    display: "block",
    borderWidth: "1px",
    borderColor: "border" as const,
    borderRadius: "sm" as const,
    bg: "bg.canvas" as const,
    overflow: "hidden" as const,
    transition: "border-color 120ms",
  };

  if (isSoon) {
    return (
      <Box {...cardSx} opacity={0.6} cursor="not-allowed">
        <Cover meta={meta} />
        <CardBody meta={meta} />
      </Box>
    );
  }

  return (
    <Link
      asChild
      {...cardSx}
      _hover={{ borderColor: "accent", textDecoration: "none" }}
      _focusVisible={{
        outline: "2px solid",
        outlineColor: "accent",
        outlineOffset: "2px",
      }}
    >
      <RouterLink to={`/m/${meta.slug}`}>
        <Cover meta={meta} />
        <CardBody meta={meta} />
      </RouterLink>
    </Link>
  );
}
