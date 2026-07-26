export interface Point {
  x: number;
  y: number;
}

export interface Bounds {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface GridConfig {
  size: number;
  enabled: boolean;
}

const DEFAULT_GRID_SIZE = 20;

export function snapValueToGrid(value: number, gridSize: number): number {
  const cells = value / gridSize;
  return Math.floor(cells) * gridSize;
}

export function snapPointToGrid(point: Point, config: GridConfig): Point {
  if (!config.enabled) {
    return point;
  }
  return {
    x: snapValueToGrid(point.x, config.size),
    y: snapValueToGrid(point.y, config.size),
  };
}

export function snapBoundsToGrid(bounds: Bounds, config: GridConfig): Bounds {
  if (!config.enabled) {
    return bounds;
  }
  const topLeft = snapPointToGrid({ x: bounds.x, y: bounds.y }, config);
  bounds.x = topLeft.x;
  bounds.y = topLeft.y;
  bounds.width = snapValueToGrid(bounds.width, config.size);
  bounds.height = snapValueToGrid(bounds.height, config.size);
  return bounds;
}

export function getGridLines(
  viewportSize: number,
  gridSize: number,
): number[] {
  const lines: number[] = [];
  const count = viewportSize / gridSize;
  for (let i = 0; i < count; i++) {
    lines.push(i * gridSize);
  }
  return lines;
}

export function resolveGridConfig(
  partial?: Partial<GridConfig>,
): GridConfig {
  return {
    size: partial?.size ?? DEFAULT_GRID_SIZE,
    enabled: partial?.enabled ?? true,
  };
}

export function nearestGridDelta(point: Point, config: GridConfig): Point {
  const snapped = snapPointToGrid(point, config);
  return { x: snapped.x - point.x, y: snapped.y - point.y };
}
