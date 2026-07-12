import type { ExcalidrawElement } from "../element/types";

export interface Box { minX: number; minY: number; maxX: number; maxY: number; }

export const contentBounds = (elements: ExcalidrawElement[]): Box => {
  const box: Box = { minX: 0, minY: 0, maxX: 0, maxY: 0 };
  for (const el of elements) {
    const sw = (el as any).strokeWidth || 0;
    box.minX = Math.min(box.minX, el.x - sw);
    box.minY = Math.min(box.minY, el.y - sw);
    box.maxX = Math.max(box.maxX, el.x + el.width + sw);
    box.maxY = Math.max(box.maxY, el.y + el.height + sw);
  }
  return box;
};

export const boxSize = (box: Box): { width: number; height: number } => ({
  width: box.maxX - box.minX,
  height: box.maxY - box.minY,
});
