export type GridSnapOptions = {
  gridSize: number;
  enabled: boolean;
};

export const DEFAULT_GRID_SIZE = 20;

/** Snap a single coordinate to the nearest grid line. */
export const snapCoord = (value: number, gridSize: number): number => {
  return Math.round(value / gridSize) * gridSize;
};

/** Snap a point during drag; returns the original point when disabled. */
export const snapPoint = (
  x: number,
  y: number,
  options: GridSnapOptions,
): { x: number; y: number } => {
  if (!options.enabled) {
    return { x, y };
  }
  const gridSize = options.gridSize || DEFAULT_GRID_SIZE;
  return { x: snapCoord(x, gridSize), y: snapCoord(y, gridSize) };
};

/** Snap the resized bounds so width/height stay grid-aligned. */
export const snapBounds = (
  x: number,
  y: number,
  width: number,
  height: number,
  options: GridSnapOptions,
): { x: number; y: number; width: number; height: number } => {
  if (!options.enabled) {
    return { x, y, width, height };
  }
  const gridSize = options.gridSize;
  const snappedX = snapCoord(x, gridSize);
  const snappedY = snapCoord(y, gridSize);
  const snappedWidth = snapCoord(width, gridSize);
  const snappedHeight = snapCoord(height, gridSize);
  return {
    x: snappedX,
    y: snappedY,
    width: snappedWidth == 0 ? gridSize : snappedWidth,
    height: snappedHeight,
  };
};

/** Accumulates sub-grid drag deltas so slow drags still cross grid lines. */
export class DragSnapAccumulator {
  private remainderX = 0;
  private remainderY = 0;

  constructor(private readonly options: GridSnapOptions) {}

  consume(dx: number, dy: number): { dx: number; dy: number } {
    if (!this.options.enabled) {
      return { dx, dy };
    }
    const gridSize = this.options.gridSize || DEFAULT_GRID_SIZE;
    this.remainderX += dx;
    this.remainderY += dy;
    const stepsX = Math.trunc(this.remainderX / gridSize);
    const stepsY = Math.trunc(this.remainderY / gridSize);
    this.remainderX -= stepsX * gridSize;
    this.remainderY -= stepsY * gridSize;
    return { dx: stepsX * gridSize, dy: stepsY * gridSize };
  }

  reset() {
    this.remainderX = 0;
  }
}
