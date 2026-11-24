/**
 * Limits `value` to the inclusive range from `min` to `max`.
 *
 * @throws RangeError when `min` is greater than `max`, or when any argument is NaN.
 */
export const clamp = (value: number, min: number, max: number): number => {
  if (Number.isNaN(value) || Number.isNaN(min) || Number.isNaN(max)) {
    throw new RangeError("clamp() arguments must be numbers");
  }
  if (min > max) {
    throw new RangeError(`clamp() min (${min}) must not exceed max (${max})`);
  }
  return Math.min(Math.max(value, min), max);
};
