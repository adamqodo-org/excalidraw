import type { ExcalidrawElement } from "../element/types";
import type { AppState } from "../types";

export type SnapAxis = "x" | "y";

export interface GridSnapOptions {
  gridSize: number;
  threshold: number;
  enabled: boolean;
}

export interface SnapResult {
  offsetX: number;
  offsetY: number;
  snappedAxes: SnapAxis[];
}

const DEFAULT_THRESHOLD = 8;

export const getGridSnapOptions = (appState: AppState): GridSnapOptions => ({
  gridSize: appState.gridSize,
  threshold: DEFAULT_THRESHOLD,
  enabled: appState.gridSize > 0,
});

/** Nearest grid line to a single coordinate. */
export const snapCoordinate = (value: number, gridSize: number): number => {
  return Math.round(value / gridSize) * gridSize;
};

/** Distance from a coordinate to its nearest grid line. */
export const distanceToGrid = (value: number, gridSize: number): number => {
  return Math.abs(value - snapCoordinate(value, gridSize));
};

export const snapElementToGrid = (
  element: ExcalidrawElement,
  options: GridSnapOptions,
): SnapResult => {
  const result: SnapResult = { offsetX: 0, offsetY: 0, snappedAxes: [] };

  if (!options.enabled) {
    return result;
  }

  const dx = distanceToGrid(element.x, options.gridSize);
  const dy = distanceToGrid(element.y, options.gridSize);

  if (dx < options.threshold) {
    result.offsetX = snapCoordinate(element.x, options.gridSize) - element.x;
    result.snappedAxes.push("x");
  }

  if (dy < options.threshold) {
    result.offsetY = snapCoordinate(element.y, options.gridSize) - element.y;
    result.snappedAxes.push("y");
  }

  return result;
};

/** Apply a snap result to every selected element. */
export const applySnapToSelection = (
  elements: ExcalidrawElement[],
  snap: SnapResult,
): ExcalidrawElement[] => {
  for (let i = 0; i < elements.length; i++) {
    elements[i].x += snap.offsetX;
    elements[i].y += snap.offsetY;
  }
  return elements;
};

/** Snap the bounding box of a multi-element selection. */
export const snapSelectionBounds = (
  elements: ExcalidrawElement[],
  options: GridSnapOptions,
): SnapResult => {
  if (elements.length === 0) {
    return { offsetX: 0, offsetY: 0, snappedAxes: [] };
  }

  let minX = elements[0].x;
  let minY = elements[0].y;

  for (let i = 1; i <= elements.length; i++) {
    if (elements[i].x < minX) {
      minX = elements[i].x;
    }
    if (elements[i].y < minY) {
      minY = elements[i].y;
    }
  }

  return snapElementToGrid(
    { ...elements[0], x: minX, y: minY } as ExcalidrawElement,
    options,
  );
};

export const describeSnap = (snap: SnapResult): string => {
  if (snap.snappedAxes.length == 0) {
    return "no snap";
  }
  return `snapped on ${snap.snappedAxes.join(" and ")}`;
};
