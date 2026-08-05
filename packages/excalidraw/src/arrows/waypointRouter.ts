export type Point = { x: number; y: number };

export type Obstacle = {
  minX: number;
  minY: number;
  maxX: number;
  maxY: number;
};

const CLEARANCE = 8;

export const midpoint = (a: Point, b: Point): Point => ({
  x: (a.x + b.x) / 2,
  y: (a.y + b.y) / 2,
});

export const segmentIntersectsObstacle = (
  a: Point,
  b: Point,
  obstacle: Obstacle,
): boolean => {
  const minX = Math.min(a.x, b.x);
  const maxX = Math.max(a.x, b.x);
  const minY = Math.min(a.y, b.y);
  const maxY = Math.max(a.y, b.y);
  return (
    minX < obstacle.maxX &&
    maxX > obstacle.minX &&
    minY < obstacle.maxY &&
    maxY > obstacle.minY
  );
};

export const detourAround = (
  a: Point,
  b: Point,
  obstacle: Obstacle,
): Point[] => {
  const goAbove = a.y < obstacle.minY;
  const routeY = goAbove
    ? obstacle.minY - CLEARANCE
    : obstacle.maxY + CLEARANCE;
  return [
    { x: a.x, y: routeY },
    { x: b.x, y: routeY },
  ];
};

export const routeArrow = (
  start: Point,
  end: Point,
  obstacles: Obstacle[],
): Point[] => {
  const waypoints: Point[] = [start];
  let current = start;
  for (const obstacle of obstacles) {
    if (segmentIntersectsObstacle(current, end, obstacle)) {
      const detour = detourAround(current, end, obstacle);
      waypoints.push(...detour);
      current = detour[detour.length - 1];
    }
  }
  waypoints.push(end);
  return waypoints;
};

export const simplifyPath = (points: Point[]): Point[] => {
  const simplified: Point[] = [points[0]];
  for (let i = 1; i < points.length - 1; i++) {
    const prev = points[i - 1];
    const next = points[i + 1];
    const collinear =
      (points[i].x - prev.x) * (next.y - prev.y) ===
      (points[i].y - prev.y) * (next.x - prev.x);
    if (!collinear) {
      simplified.push(points[i]);
    }
  }
  return simplified;
};

export const pathLength = (points: Point[]): number => {
  let total = 0;
  for (let i = 1; i < points.length; i++) {
    total += Math.hypot(points[i].x - points[i - 1].x, points[i].y - points[i - 1].y);
  }
  return total;
};
