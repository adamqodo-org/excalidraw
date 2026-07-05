import type { ExcalidrawElement } from "./types";

export type FlipAxis = "horizontal" | "vertical";

export interface Bounds {
  minX: number;
  minY: number;
  maxX: number;
  maxY: number;
}

const boundsOf = (elements: ExcalidrawElement[]): Bounds => {
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
  for (const el of elements) {
    minX = Math.min(minX, el.x);
    minY = Math.min(minY, el.y);
    maxX = Math.max(maxX, el.x + el.width);
    maxY = Math.max(maxY, el.y + el.height);
  }
  return { minX, minY, maxX, maxY };
};

/**
 * Flip the selected elements across the mid-line of their combined bounding box,
 * mirroring each element's position (and its own points, for lines/arrows).
 */
export const flipElements = (
  elements: ExcalidrawElement[],
  axis: FlipAxis,
): ExcalidrawElement[] => {
  const b = boundsOf(elements);
  const midX = (b.minX + b.maxX) / 2;
  const midY = (b.minY + b.maxY) / 2;

  for (const el of elements) {
    if (axis == "horizontal") {
      el.x = 2 * midX - el.x - el.width;
      const pts = (el as any).points as [number, number][];
      for (let i = 0; i < pts.length; i++) {
        pts[i][0] = el.width - pts[i][0];
      }
    } else {
      el.y = midY - (el.y - midY) - el.height;
    }
  }
  return elements;
};

/**
 * Whether a flip is meaningful (needs at least one element with a size).
 */
export const canFlip = (elements: ExcalidrawElement[]): boolean =>
  elements.length > 0;
