import {
  HStack,
  NumberInput,
  Slider,
  Text,
  VStack,
} from "@chakra-ui/react";
import { useId } from "react";

interface Props {
  label: string;
  unit?: string;
  description?: string;
  min: number;
  max: number;
  step: number;
  value: number;
  onChange: (next: number) => void;
}

export function ParamSlider({
  label,
  unit,
  description,
  min,
  max,
  step,
  value,
  onChange,
}: Props) {
  const labelId = useId();
  const valueText = unit ? `${value} ${unit}` : `${value}`;

  return (
    <VStack align="stretch" gap={1} w="100%">
      <HStack justify="space-between" align="baseline">
        <Text
          id={labelId}
          m={0}
          color="navy.100"
          fontWeight="medium"
          fontSize="sm"
        >
          {label}
          {unit ? (
            <Text as="span" color="navy.300" fontSize="sm" ml={1}>
              ({unit})
            </Text>
          ) : null}
        </Text>
        <NumberInput.Root
          size="sm"
          maxW="6.5rem"
          value={value.toString()}
          onValueChange={(d) => {
            if (Number.isFinite(d.valueAsNumber)) onChange(d.valueAsNumber);
          }}
          min={min}
          max={max}
          step={step}
        >
          <NumberInput.Input
            bg="navy.800"
            borderColor="navy.600"
            aria-label={`${label} numeric input`}
          />
          <NumberInput.Control>
            <NumberInput.IncrementTrigger />
            <NumberInput.DecrementTrigger />
          </NumberInput.Control>
        </NumberInput.Root>
      </HStack>
      <Slider.Root
        aria-labelledby={[labelId]}
        aria-valuetext={valueText}
        min={min}
        max={max}
        step={step}
        value={[value]}
        onValueChange={(d) => {
          const v = d.value[0];
          if (typeof v === "number") onChange(v);
        }}
        colorPalette="yellow"
      >
        <Slider.Control>
          <Slider.Track bg="navy.700">
            <Slider.Range bg="gold.400" />
          </Slider.Track>
          <Slider.Thumb index={0} boxSize={4} bg="gold.300">
            <Slider.HiddenInput />
          </Slider.Thumb>
        </Slider.Control>
      </Slider.Root>
      {description ? (
        <Text fontSize="xs" color="navy.300">
          {description}
        </Text>
      ) : null}
    </VStack>
  );
}
