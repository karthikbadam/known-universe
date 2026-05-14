import { Badge, Tooltip } from "@chakra-ui/react";

export type DataStatus = "real" | "simulated";

interface Props {
  status: DataStatus;
}

export function DataStatusBadge({ status }: Props): JSX.Element | null {
  if (status === "real") {
    return (
      <Tooltip
        label="Real published measurements. See data citation below."
        placement="top"
      >
        <Badge
          colorScheme="green"
          variant="subtle"
          fontSize="xs"
          textTransform="none"
          px={2}
          py={0.5}
          borderRadius="md"
        >
          real data
        </Badge>
      </Tooltip>
    );
  }
  return (
    <Tooltip
      label="Simulated data — physics-correct but not real measurements. See data citation below for swap instructions."
      placement="top"
    >
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
    </Tooltip>
  );
}
