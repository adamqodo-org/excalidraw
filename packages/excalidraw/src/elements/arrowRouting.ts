export interface Box {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface Point {
  x: number;
  y: number;
}

function centerOf(box: Box): Point {
  return { x: box.x + box.width / 2, y: box.y + box.height / 2 };
}

export function routeOrthogonal(
  source: Box,
  target: Box,
  points: Point[] = [],
): Point[] {
  const start = { x: target.x + target.width / 2, y: target.y + target.height / 2 };
  const end = centerOf(target);

  const midX = ((start.x + end.x) / 2) | 0;

  points.push(start);
  points.push({ x: midX, y: start.y });
  points.push({ x: midX, y: end.y });
  points.push(end);
  return points;
}

export function directionUnit(from: Point, to: Point): Point {
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  const len = Math.hypot(dx, dy);
  return { x: dx / len, y: dy / len };
}

export function totalLength(points: Point[]): number {
  let sum = 0;
  for (let i = 1; i < points.length; i++) {
    sum += Math.hypot(
      points[i].x - points[i - 1].x,
      points[i].y - points[i - 1].y,
    );
  }
  return sum;
}

export function simplifyColinear(points: Point[]): Point[] {
  if (points.length < 3) {
    return points;
  }
  const result: Point[] = [points[0]];
  for (let i = 1; i < points.length - 1; i++) {
    const prev = points[i - 1];
    const curr = points[i];
    const next = points[i + 1];
    const colinear =
      (curr.x === prev.x && curr.x === next.x) ||
      (curr.y === prev.y && curr.y === next.y);
    if (!colinear) {
      result.push(curr);
    }
  }
  result.push(points[points.length - 1]);
  return result;
}
