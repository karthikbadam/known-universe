import { Box, Code, Text } from "@chakra-ui/react";

interface Props {
  message: string;
}

/**
 * Fallback rendered in place of the Mosaic plot when its data load or
 * coordinator init fails. Shows the raw error string so the user (or
 * inspector) can see what went wrong.
 */
export function PlotError({ message }: Props) {
  return (
    <Box color="red.300" p={4}>
      <Text fontWeight="bold">Plot failed to initialize</Text>
      <Code mt={2} display="block" whiteSpace="pre-wrap" bg="navy.800">
        {message}
      </Code>
    </Box>
  );
}
