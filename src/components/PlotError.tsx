import { Box, Code, Text } from "@chakra-ui/react";

interface Props {
  message: string;
}

export function PlotError({ message }: Props) {
  return (
    <Box color="fg" p={4} borderWidth="1px" borderColor="border" borderRadius="sm">
      <Text fontFamily="heading" fontWeight="medium" color="accent">
        Plot failed to initialize
      </Text>
      <Code
        mt={2}
        display="block"
        whiteSpace="pre-wrap"
        bg="bg.subtle"
        color="fg.muted"
        p={2}
      >
        {message}
      </Code>
    </Box>
  );
}
