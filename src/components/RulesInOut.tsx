import {
  Box,
  Heading,
  List,
  ListIcon,
  ListItem,
  SimpleGrid,
} from "@chakra-ui/react";
import { CheckIcon, CloseIcon } from "@chakra-ui/icons";

interface Props {
  rulesIn: ReadonlyArray<string>;
  rulesOut: ReadonlyArray<string>;
}

export function RulesInOut({ rulesIn, rulesOut }: Props): JSX.Element {
  return (
    <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6} my={4}>
      <Box>
        <Heading as="h4" size="sm" color="green.300" mb={2}>
          What this rules in
        </Heading>
        <List spacing={1} fontSize="sm" color="navy.100">
          {rulesIn.map((r, i) => (
            <ListItem key={i}>
              <ListIcon as={CheckIcon} color="green.300" />
              {r}
            </ListItem>
          ))}
        </List>
      </Box>
      <Box>
        <Heading as="h4" size="sm" color="red.300" mb={2}>
          What this rules out
        </Heading>
        <List spacing={1} fontSize="sm" color="navy.100">
          {rulesOut.map((r, i) => (
            <ListItem key={i}>
              <ListIcon as={CloseIcon} color="red.300" boxSize={2.5} mt={1} />
              {r}
            </ListItem>
          ))}
        </List>
      </Box>
    </SimpleGrid>
  );
}
