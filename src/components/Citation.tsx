import {
  Accordion,
  AccordionButton,
  AccordionIcon,
  AccordionItem,
  AccordionPanel,
  Box,
  Text,
} from "@chakra-ui/react";
import { type ReactNode } from "react";

interface Props {
  title: string;
  children: ReactNode;
}

export function Citation({ title, children }: Props): JSX.Element {
  return (
    <Accordion allowToggle my={2}>
      <AccordionItem border="none">
        <AccordionButton
          px={2}
          py={1}
          color="navy.200"
          _hover={{ color: "gold.300", bg: "transparent" }}
        >
          <Box flex="1" textAlign="left" fontSize="sm" fontWeight="medium">
            {title}
          </Box>
          <AccordionIcon />
        </AccordionButton>
        <AccordionPanel px={2} py={2} fontSize="sm" color="navy.200">
          <Text as="div">{children}</Text>
        </AccordionPanel>
      </AccordionItem>
    </Accordion>
  );
}
