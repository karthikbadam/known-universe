import { Box, Heading, List, SimpleGrid } from "@chakra-ui/react";
import { Check, X } from "lucide-react";

interface Props {
  rulesIn: ReadonlyArray<string>;
  rulesOut: ReadonlyArray<string>;
}

export function RulesInOut({ rulesIn, rulesOut }: Props) {
  return (
    <SimpleGrid columns={{ base: 1, md: 2 }} gap={6} my={4}>
      <Box>
        <Heading as="h4" size="sm" color="green.300" mb={2}>
          What this rules in
        </Heading>
        <List.Root gap={1} fontSize="sm" color="navy.100" listStyleType="none">
          {rulesIn.map((r, i) => (
            <List.Item key={i} display="flex" alignItems="flex-start" gap={2}>
              <Box color="green.300" mt="2px" flexShrink={0}>
                <Check size={14} />
              </Box>
              {r}
            </List.Item>
          ))}
        </List.Root>
      </Box>
      <Box>
        <Heading as="h4" size="sm" color="red.300" mb={2}>
          What this rules out
        </Heading>
        <List.Root gap={1} fontSize="sm" color="navy.100" listStyleType="none">
          {rulesOut.map((r, i) => (
            <List.Item key={i} display="flex" alignItems="flex-start" gap={2}>
              <Box color="red.300" mt="2px" flexShrink={0}>
                <X size={14} />
              </Box>
              {r}
            </List.Item>
          ))}
        </List.Root>
      </Box>
    </SimpleGrid>
  );
}
