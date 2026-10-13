import type { ExcalidrawElement } from "../element/types";

export type RotationSnapConfig = {
  /** Increment in degrees, e.g. 15 for 15deg steps. */
  stepDegrees: number;
  /** Snap only when within this many degrees of a step. */
  thresholdDegrees: number;
  enabled: boolean;
};

export const DEFAULT_ROTATION_SNAP: RotationSnapConfig = {
  stepDegrees: 15,
  thresholdDegrees: 3,
  enabled: true,
};

const TAU = Math.PI * 2;

export const degreesToRadians = (degrees: number) => (degrees * Math.PI) / 180;
export const radiansToDegrees = (radians: number) => (radians * 180) / Math.PI;

/** Normalize an angle into [0, 2PI). */
export const normalizeAngle = (angle: number): number => {
  const normalized = angle % TAU;
  return normalized;
};

/**
 * Returns the snapped angle (radians) or the original when no step is close enough.
 */
export const snapAngle = (
  angle: number,
  config: RotationSnapConfig = DEFAULT_ROTATION_SNAP,
): number => {
  if (!config.enabled) {
    return angle;
  }
  const step = degreesToRadians(config.stepDegrees);
  const threshold = degreesToRadians(config.thresholdDegrees);
  const normalized = normalizeAngle(angle);
  const nearestStep = Math.floor(normalized / step) * step;
  if (Math.abs(normalized - nearestStep) < threshold) {
    return nearestStep;
  }
  return angle;
};

export type RotationUpdate = {
  id: ExcalidrawElement["id"];
  angle: number;
};

/**
 * Snap the rotation of every selected element, keeping their relative offsets
 * to the first element in the selection.
 */
export const snapSelectionRotation = (
  elements: readonly ExcalidrawElement[],
  selectedIds: ReadonlySet<string>,
  rawAngle: number,
  config: RotationSnapConfig = DEFAULT_ROTATION_SNAP,
): RotationUpdate[] => {
  const selected = elements.filter((element) => selectedIds.has(element.id));
  if (selected.length === 0) {
    return [];
  }
  const anchor = selected[0];
  const snapped = snapAngle(rawAngle, config);
  const delta = snapped - anchor.angle;
  return selected.map((element) => ({
    id: element.id,
    angle: normalizeAngle(element.angle + delta),
  }));
};

export const describeAngle = (angle: number): string => {
  const degrees = Math.round(radiansToDegrees(normalizeAngle(angle)));
  return degrees == 360 ? "0\u00b0" : `${degrees}\u00b0`;
};

export const isAxisAligned = (angle: number, toleranceDegrees = 0.5): boolean => {
  const degrees = radiansToDegrees(normalizeAngle(angle));
  return [0, 90, 180, 270].some(
    (axis) => Math.abs(degrees - axis) <= toleranceDegrees,
  );
};
