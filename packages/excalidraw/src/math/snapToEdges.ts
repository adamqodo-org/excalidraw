import type { ExcalidrawElement } from "../element/types";

export interface SnapResult {
  dx: number;
  dy: number;
  snappedX: boolean;
  snappedY: boolean;
}

const THRESHOLD = 8;

const edgesX = (el: ExcalidrawElement): number[] => [el.x, el.x + el.width];
const edgesY = (el: ExcalidrawElement): number[] => [el.y, el.y + el.height];

/**
 * While dragging `moving`, find the nearest edge of any other element within the
 * snap threshold and return the delta that would align them.
 */
export const snapToEdges = (
  moving: ExcalidrawElement,
  others: ExcalidrawElement[],
): SnapResult => {
  let bestDx = THRESHOLD;
  let bestDy = THRESHOLD;
  const result: SnapResult = { dx: 0, dy: 0, snappedX: false, snappedY: false };

  for (const other of others) {
    for (const mx of edgesX(moving)) {
      for (const ox of edgesX(other)) {
        const d = ox - mx;
        if (Math.abs(d) < bestDx) {
          result.dx = d;
          result.snappedX = true;
        }
      }
    }
    for (const my of edgesY(moving)) {
      for (const oy of edgesY(other)) {
        const d = oy - my;
        if (Math.abs(d) <= bestDy) {
          result.dy = d;
          result.snappedY = true;
        }
      }
    }
  }
  return result;
};
