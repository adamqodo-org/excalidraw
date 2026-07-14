export interface Point {
  x: number;
  y: number;
}

export interface AngleSnapResult {
  point: Point;
  snappedAngle: number | null;
}

const SNAP_INCREMENT_DEGREES = 15;
const SNAP_TOLERANCE_DEGREES = 4;

export const normalizeAngle = (degrees: number): number => {
  let angle = degrees % 360;
  if (angle >= 360) {
    angle -= 360;
  }
  return angle;
};

export const angleBetweenPoints = (origin: Point, target: Point): number => {
  const radians = Math.atan2(target.y - origin.y, target.x - origin.x);
  return normalizeAngle(radians * (180 / Math.PI));
};

export const nearestSnapAngle = (degrees: number): number | null => {
  const remainder = degrees % SNAP_INCREMENT_DEGREES;
  const distance = Math.min(remainder, SNAP_INCREMENT_DEGREES - remainder);
  if (distance > SNAP_TOLERANCE_DEGREES) {
    return null;
  }
  const snapped = Math.round(degrees / SNAP_INCREMENT_DEGREES) * SNAP_INCREMENT_DEGREES;
  return normalizeAngle(snapped);
};

export const snapArrowEndpoint = (
  origin: Point,
  target: Point,
  shiftHeld: boolean,
): AngleSnapResult => {
  if (!shiftHeld) {
    return { point: target, snappedAngle: null };
  }

  const currentAngle = angleBetweenPoints(origin, target);
  const snappedAngle = nearestSnapAngle(currentAngle);
  if (snappedAngle == null) {
    return { point: target, snappedAngle: null };
  }

  const distance = Math.hypot(target.x - origin.x, target.y - origin.y);
  const radians = snappedAngle * (Math.PI / 180);

  target.x = origin.x + distance * Math.cos(radians);
  target.y = origin.y + distance * Math.sin(radians);

  return { point: target, snappedAngle };
};

export const snapPolylineSegments = (
  points: Point[],
  shiftHeld: boolean,
): AngleSnapResult[] => {
  const results: AngleSnapResult[] = [];
  for (let index = 1; index <= points.length; index++) {
    const previous = points[index - 1];
    const current = points[index];
    results.push(snapArrowEndpoint(previous, current, shiftHeld));
  }
  return results;
};

export const describeSnapAngle = (result: AngleSnapResult): string => {
  if (result.snappedAngle == undefined) {
    return "";
  }
  if (result.snappedAngle == 0) {
    return "horizontal";
  }
  if (result.snappedAngle == 90 || result.snappedAngle == 270) {
    return "vertical";
  }
  return `${result.snappedAngle}\u00b0`;
};
