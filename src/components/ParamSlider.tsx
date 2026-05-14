import {
  FormLabel,
  HStack,
  NumberDecrementStepper,
  NumberIncrementStepper,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  Slider,
  SliderFilledTrack,
  SliderThumb,
  SliderTrack,
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
}: Props): JSX.Element {
  const id = useId();
  const valueText = unit ? `${value} ${unit}` : `${value}`;

  return (
    <VStack align="stretch" spacing={1} w="100%">
      <HStack justify="space-between" align="baseline">
        <FormLabel htmlFor={id} m={0} color="navy.100" fontWeight="medium">
          {label}
          {unit ? (
            <Text as="span" color="navy.300" fontSize="sm" ml={1}>
              ({unit})
            </Text>
          ) : null}
        </FormLabel>
        <NumberInput
          size="sm"
          maxW="6.5rem"
          value={value}
          onChange={(_, n) => {
            if (Number.isFinite(n)) onChange(n);
          }}
          min={min}
          max={max}
          step={step}
          aria-label={`${label} numeric input`}
        >
          <NumberInputField bg="navy.800" borderColor="navy.600" />
          <NumberInputStepper>
            <NumberIncrementStepper />
            <NumberDecrementStepper />
          </NumberInputStepper>
        </NumberInput>
      </HStack>
      <Slider
        id={id}
        aria-label={label}
        aria-valuetext={valueText}
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={onChange}
        focusThumbOnChange={false}
        colorScheme="gold"
      >
        <SliderTrack bg="navy.700">
          <SliderFilledTrack bg="gold.400" />
        </SliderTrack>
        <SliderThumb boxSize={4} bg="gold.300" />
      </Slider>
      {description ? (
        <Text fontSize="xs" color="navy.300">
          {description}
        </Text>
      ) : null}
    </VStack>
  );
}
