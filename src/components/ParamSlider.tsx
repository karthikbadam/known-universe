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
    <VStack align="stretch" gap={2} w="100%">
      <HStack justify="space-between" align="baseline">
        <Text
          id={labelId}
          m={0}
          color="fg"
          fontFamily="heading"
          fontWeight="medium"
          fontSize="sm"
        >
          {label}
          {unit ? (
            <Text as="span" color="fg.subtle" fontSize="sm" ml={1}>
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
            bg="bg.canvas"
            color="fg"
            borderColor="border"
            fontFamily="mono"
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
      >
        <Slider.Control>
          <Slider.Track bg="border">
            <Slider.Range bg="accent" />
          </Slider.Track>
          <Slider.Thumb index={0} boxSize={4} bg="accent" borderColor="accent">
            <Slider.HiddenInput />
          </Slider.Thumb>
        </Slider.Control>
      </Slider.Root>
      {description ? (
        <Text fontFamily="body" fontSize="sm" lineHeight="1.6">
          {description}
        </Text>
      ) : null}
    </VStack>
  );
}
