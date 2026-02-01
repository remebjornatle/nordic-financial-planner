import { useState, useEffect } from 'react';

/**
 * Debounce hook to delay value updates
 * Prevents excessive re-renders and recalculations when user drags slider
 *
 * @param {any} value - Value to debounce
 * @param {number} delay - Delay in milliseconds (default: 150ms)
 * @returns {any} - Debounced value
 *
 * Example usage:
 * const [sliderValue, setSliderValue] = useState(50);
 * const debouncedValue = useDebounce(sliderValue, 150);
 *
 * // sliderValue updates immediately (smooth UI)
 * // debouncedValue updates 150ms after user stops moving slider
 */
export const useDebounce = (value, delay = 150) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    // Set up timeout to update debounced value
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    // Clean up timeout if value changes before delay expires
    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};
