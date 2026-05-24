import { Accordion, Box, Text } from "@chakra-ui/react";
import { type ReactNode } from "react";

interface Props {
  title: string;
  children: ReactNode;
}

export function Citation({ title, children }: Props) {
  return (
    <Accordion.Root collapsible>
      <Accordion.Item value="citation" border="none">
        <Accordion.ItemTrigger
          px={0}
          py={2}
          color="fg.muted"
          fontFamily="heading"
          _hover={{ color: "accent", bg: "transparent" }}
        >
          <Box flex="1" textAlign="left" fontSize="sm" fontWeight="medium">
            {title}
          </Box>
          <Accordion.ItemIndicator />
        </Accordion.ItemTrigger>
        <Accordion.ItemContent>
          <Accordion.ItemBody
            px={0}
            py={1}
            fontFamily="body"
            fontSize="sm"
            color="fg.muted"
            lineHeight="1.7"
          >
            <Text as="div">{children}</Text>
          </Accordion.ItemBody>
        </Accordion.ItemContent>
      </Accordion.Item>
    </Accordion.Root>
  );
}
