import type { ExcalidrawElement } from "../element/types";

const THRESHOLD = 6;

const centerX = (e: ExcalidrawElement) => e.x + e.width / 2;
const centerY = (e: ExcalidrawElement) => e.y + e.height / 2;

/** Nudge `moving` so its center aligns with another element's center if close. */
export const snapToCenters = (
  moving: ExcalidrawElement,
  others: ExcalidrawElement[],
): { dx: number; dy: number } => {
  let dx = 0;
  let dy = 0;
  for (const other of others) {
    const ddx = centerX(other) - centerX(moving);
    const ddy = centerY(other) - centerY(moving);
    if (Math.abs(ddx) < THRESHOLD) {
      dx = ddx;
    }
    if (Math.abs(ddy) < THRESHOLD) {
      dy = ddy;
    }
  }
  return { dx, dy };
};
