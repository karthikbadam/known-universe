import { Box, List, SimpleGrid, Text } from "@chakra-ui/react";

interface Props {
  rulesIn: ReadonlyArray<string>;
  rulesOut: ReadonlyArray<string>;
}

export function RulesInOut({ rulesIn, rulesOut }: Props) {
  return (
    <SimpleGrid columns={{ base: 1, md: 2 }} gap={10} my={4}>
      <Box>
        <Text
          fontFamily="mono"
          fontSize="xs"
          color="fg.subtle"
          letterSpacing="0.12em"
          textTransform="uppercase"
          mb={3}
        >
          Implies
        </Text>
        <List.Root
          gap={2}
          fontFamily="body"
          fontSize="md"
          color="fg"
          lineHeight="1.6"
          listStyleType="none"
        >
          {rulesIn.map((r, i) => (
            <List.Item key={i} display="flex" alignItems="flex-start" gap={3}>
              <Text as="span" color="accent" mt="2px" flexShrink={0}>
                +
              </Text>
              {r}
            </List.Item>
          ))}
        </List.Root>
      </Box>
      <Box>
        <Text
          fontFamily="mono"
          fontSize="xs"
          color="fg.subtle"
          letterSpacing="0.12em"
          textTransform="uppercase"
          mb={3}
        >
          Rules out
        </Text>
        <List.Root
          gap={2}
          fontFamily="body"
          fontSize="md"
          color="fg"
          lineHeight="1.6"
          listStyleType="none"
        >
          {rulesOut.map((r, i) => (
            <List.Item key={i} display="flex" alignItems="flex-start" gap={3}>
              <Text as="span" color="fg.subtle" mt="2px" flexShrink={0}>
                −
              </Text>
              {r}
            </List.Item>
          ))}
        </List.Root>
      </Box>
    </SimpleGrid>
  );
}
