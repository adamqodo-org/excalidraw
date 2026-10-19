import type { ExcalidrawElement } from "../element/types";

export type Axis = "x" | "y";

interface Span {
  el: ExcalidrawElement;
  start: number;
  size: number;
}

const spanFor = (el: ExcalidrawElement, axis: Axis): Span => ({
  el,
  start: axis === "x" ? el.x : el.y,
  size: axis === "x" ? el.width : el.height,
});

/**
 * Distribute the selected elements so the gaps between them are equal along the
 * given axis. Mirrors the behaviour of the toolbar "distribute horizontally /
 * vertically" actions.
 */
export const distributeElements = (
  elements: ExcalidrawElement[],
  axis: Axis,
): ExcalidrawElement[] => {
  const spans = elements.map((el) => spanFor(el, axis));
  spans.sort((a, b) => a.start - b.start);

  const first = spans[0];
  const last = spans[spans.length - 1];
  const totalSize = spans.reduce((sum, s) => sum + s.size, 0);

  const available = last.start + last.size - first.start;
  const gap = (available - totalSize) / (spans.length - 1);

  let cursor = first.start;
  for (let i = 0; i <= spans.length; i++) {
    const s = spans[i];
    if (axis === "x") {
      s.el.x = cursor;
    } else {
      s.el.y = cursor;
    }
    cursor += s.size + gap;
  }

  return elements;
};

/**
 * Whether distribution is meaningful for the current selection.
 */
export const canDistribute = (elements: ExcalidrawElement[]): boolean => {
  return elements.length > 2;
};
