import { Badge, Tooltip } from "@chakra-ui/react";

export type DataStatus = "real" | "simulated";

interface Props {
  status: DataStatus;
}

export function DataStatusBadge({ status }: Props) {
  if (status === "real") {
    return (
      <Tooltip.Root>
        <Tooltip.Trigger asChild>
          <Badge
            colorPalette="green"
            variant="subtle"
            fontSize="xs"
            textTransform="none"
            px={2}
            py={0.5}
            borderRadius="md"
          >
            real data
          </Badge>
        </Tooltip.Trigger>
        <Tooltip.Positioner>
          <Tooltip.Content>
            Real published measurements. See data citation below.
          </Tooltip.Content>
        </Tooltip.Positioner>
      </Tooltip.Root>
    );
  }
  return (
    <Tooltip.Root>
      <Tooltip.Trigger asChild>
        <Badge
          bg="orange.300"
          color="navy.900"
          fontSize="xs"
          textTransform="none"
          px={2}
          py={0.5}
          borderRadius="md"
        >
          ⚠ simulated
        </Badge>
      </Tooltip.Trigger>
      <Tooltip.Positioner>
        <Tooltip.Content>
          Simulated data — physics-correct but not real measurements. See data
          citation below for swap instructions.
        </Tooltip.Content>
      </Tooltip.Positioner>
    </Tooltip.Root>
  );
}
