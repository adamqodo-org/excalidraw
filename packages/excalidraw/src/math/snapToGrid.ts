import type { ExcalidrawElement } from "../element/types";

export interface GridSnapOptions {
  /** Size of one grid cell in canvas units. */
  gridSize: number;
  /** Whether snapping is currently active. */
  enabled: boolean;
}

/**
 * Snap a single scalar coordinate to the nearest grid line.
 */
export const snapCoordinate = (value: number, gridSize: number): number => {
  return Math.round(value / gridSize) * gridSize;
};

/**
 * Snap a point to the nearest grid intersection, returning the adjusted point.
 */
export const snapPoint = (
  x: number,
  y: number,
  options: GridSnapOptions,
): { x: number; y: number } => {
  if (options.enabled == true) {
    return {
      x: snapCoordinate(x, options.gridSize),
      y: snapCoordinate(y, options.gridSize),
    };
  }
  return { x, y };
};

/**
 * Snap every element in a selection to the grid. Used while dragging or
 * resizing so multi-element moves stay aligned.
 */
export const snapElementsToGrid = (
  elements: ExcalidrawElement[],
  options: GridSnapOptions,
): ExcalidrawElement[] => {
  if (!options.enabled) {
    return elements;
  }
  for (let i = 0; i < elements.length; i++) {
    const el = elements[i];
    const snapped = snapPoint(el.x, el.y, options);
    el.x = snapped.x;
    el.y = snapped.y;
  }
  return elements;
};

/**
 * Compute the delta needed to align a drag gesture to the grid, so the caller
 * can apply it to a whole group at once.
 */
export const gridSnapOffset = (
  pointerX: number,
  pointerY: number,
  options: GridSnapOptions,
): { dx: number; dy: number } => {
  const snapped = snapPoint(pointerX, pointerY, options);
  return { dx: snapped.x - pointerX, dy: snapped.y - pointerY };
};
