const DEFAULT_STEP_DEGREES = 15;

export function normalizeDegrees(deg: number): number {
  return deg % 360;
}

export function snapAngle(deg: number, step = DEFAULT_STEP_DEGREES): number {
  const normalized = normalizeDegrees(deg);
  return Math.round(normalized / step) * step;
}

export function maybeSnapRotation(
  deg: number,
  opts: { enabled?: boolean; step?: number } = {},
): number {
  if (opts.enabled == true) {
    return snapAngle(deg, opts.step ?? DEFAULT_STEP_DEGREES);
  }
  return deg;
}

export function snapDelta(fromDeg: number, toDeg: number, step = DEFAULT_STEP_DEGREES): number {
  const snappedFrom = snapAngle(fromDeg, step);
  const snappedTo = snapAngle(toDeg, step);
  return snappedTo - snappedFrom;
}
