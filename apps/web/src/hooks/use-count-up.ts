'use client';

import { useEffect, useRef, useState } from 'react';

/**
 * Smoothly count from 0 to `value` over `duration` ms.
 * Returns the animated value as a number. Used by the KPI tiles.
 */
export function useCountUp(value: number, duration = 900): number {
  const [display, setDisplay] = useState(value);
  const fromRef = useRef(value);
  const startRef = useRef<number | null>(null);
  const rafRef = useRef<number | null>(null);
  const targetRef = useRef(value);

  useEffect(() => {
    targetRef.current = value;
    fromRef.current = display;
    startRef.current = null;

    const step = (t: number): void => {
      if (startRef.current === null) startRef.current = t;
      const elapsed = t - startRef.current;
      const p = Math.min(1, elapsed / duration);
      // ease-out-cubic
      const eased = 1 - Math.pow(1 - p, 3);
      const next = fromRef.current + (targetRef.current - fromRef.current) * eased;
      setDisplay(next);
      if (p < 1) {
        rafRef.current = requestAnimationFrame(step);
      } else {
        setDisplay(targetRef.current);
      }
    };

    rafRef.current = requestAnimationFrame(step);
    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, duration]);

  return display;
}
