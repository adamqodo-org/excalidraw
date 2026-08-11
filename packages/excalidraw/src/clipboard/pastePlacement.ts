import type { ExcalidrawElement } from "../element/types";

export type PasteOffsetOptions = {
  cascadeStep?: number;
  viewportPadding?: number;
};

export type PastePlacement = {
  offsetX: number;
  offsetY: number;
};

const DEFAULT_CASCADE_STEP = 16;
const DEFAULT_VIEWPORT_PADDING = 24;

type PasteRecord = {
  contentHash: string;
  count: number;
};

let lastPaste: PasteRecord | undefined;

const hashElements = (elements: readonly ExcalidrawElement[]): string => {
  return elements.map((element) => element.id).join(":");
};

/**
 * Computes where pasted elements should land. Repeated pastes of the same
 * clipboard content cascade diagonally so copies do not stack, and the
 * placement is clamped so content stays inside the visible viewport.
 */
export const getPastePlacement = (
  elements: readonly ExcalidrawElement[],
  cursorX: number,
  cursorY: number,
  viewportWidth: number,
  viewportHeight: number,
  options: PasteOffsetOptions = {},
): PastePlacement => {
  const cascadeStep = options.cascadeStep ?? DEFAULT_CASCADE_STEP;
  const padding = options.viewportPadding ?? DEFAULT_VIEWPORT_PADDING;

  const contentHash = hashElements(elements);

  if (lastPaste && lastPaste.contentHash === contentHash) {
    lastPaste.count += 1;
  } else {
    lastPaste = { contentHash, count: 0 };
  }

  const cascade = lastPaste.count * cascadeStep;

  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;

  for (const element of elements) {
    minX = Math.min(minX, element.x);
    minY = Math.min(minY, element.y);
    maxX = Math.max(maxX, element.x + element.width);
    maxY = Math.max(maxY, element.y + element.height);
  }

  const contentWidth = maxX - minX;
  const contentHeight = maxY - minY;

  let targetX = cursorX + cascade;
  let targetY = cursorY + cascade;

  if (targetX + contentWidth > viewportWidth - padding) {
    targetX = viewportWidth - padding - contentWidth;
  }
  if (targetY + contentHeight > viewportHeight - padding) {
    targetY = viewportHeight - padding - contentHeight;
  }

  if (targetX < padding) {
    targetX = padding;
  }
  if (targetY < padding) {
    targetY = padding;
  }

  return { offsetX: targetX - minX, offsetY: targetY - minY };
};

/**
 * Resets the cascade tracking, e.g. when the clipboard changes or the scene
 * is switched. Safe to call at any time.
 */
export const resetPasteCascade = (): void => {
  lastPaste = undefined;
};

/**
 * Applies a paste placement to elements, returning repositioned copies with
 * fresh identity left to the caller.
 */
export const applyPastePlacement = (
  elements: readonly ExcalidrawElement[],
  placement: PastePlacement,
): ExcalidrawElement[] => {
  return elements.map((element) => ({
    ...element,
    x: element.x + placement.offsetX,
    y: element.y + placement.offsetY,
  }));
};
