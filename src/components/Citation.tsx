import { Accordion, Box, Text } from "@chakra-ui/react";
import { type ReactNode } from "react";

interface Props {
  title: string;
  children: ReactNode;
}

export function Citation({ title, children }: Props) {
  return (
    <Accordion.Root collapsible my={2}>
      <Accordion.Item value="citation" border="none">
        <Accordion.ItemTrigger
          px={2}
          py={1}
          color="navy.200"
          _hover={{ color: "gold.300", bg: "transparent" }}
        >
          <Box flex="1" textAlign="left" fontSize="sm" fontWeight="medium">
            {title}
          </Box>
          <Accordion.ItemIndicator />
        </Accordion.ItemTrigger>
        <Accordion.ItemContent>
          <Accordion.ItemBody
            px={2}
            py={2}
            fontSize="sm"
            color="navy.200"
          >
            <Text as="div">{children}</Text>
          </Accordion.ItemBody>
        </Accordion.ItemContent>
      </Accordion.Item>
    </Accordion.Root>
  );
}
