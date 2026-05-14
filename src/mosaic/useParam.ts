import { Param } from "@uwdata/mosaic-core";
import { useCallback, useEffect, useRef, useState } from "react";

interface UseParamReturn {
  param: Param;
  value: number;
  setValue: (next: number) => void;
}

// React hook that bridges a Mosaic Param to React state. The Mosaic Param
// is the source of truth (vgplot specs reference it directly); the hook
// just mirrors the current numeric value into a React state slot so
// components re-render when the value changes (e.g. for slider feedback).
//
// `initialValue` is read once at mount; subsequent calls to setValue
// dispatch through the Param so any Mosaic plot referencing it updates
// in lockstep.
export function useParam(initialValue: number): UseParamReturn {
  const paramRef = useRef<Param | null>(null);
  if (paramRef.current === null) {
    paramRef.current = Param.value(initialValue) as Param;
  }
  const param = paramRef.current;

  const [value, setLocalValue] = useState<number>(initialValue);

  useEffect(() => {
    const listener = (next: unknown): void => {
      if (typeof next === "number") setLocalValue(next);
    };
    param.addEventListener("value", listener);
    return () => {
      param.removeEventListener("value", listener);
    };
  }, [param]);

  const setValue = useCallback(
    (next: number) => {
      param.update(next);
    },
    [param],
  );

  return { param, value, setValue };
}
