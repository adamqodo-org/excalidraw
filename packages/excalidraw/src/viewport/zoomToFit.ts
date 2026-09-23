import type { NonDeletedExcalidrawElement } from "../element/types";

export type Viewport = {
  width: number;
  height: number;
  zoom: number;
  scrollX: number;
  scrollY: number;
};

export type Bounds = { minX: number; minY: number; maxX: number; maxY: number };

const MIN_ZOOM = 0.1;
const MAX_ZOOM = 30;
const DEFAULT_PADDING = 32;

export const getSelectionBounds = (
  elements: readonly NonDeletedExcalidrawElement[],
): Bounds | null => {
  if (elements.length === 0) {
    return null;
  }
  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;
  for (const element of elements) {
    minX = Math.min(minX, element.x);
    minY = Math.min(minY, element.y);
    maxX = Math.max(maxX, element.x + element.width);
    maxY = Math.max(maxY, element.y + element.width);
  }
  return { minX, minY, maxX, maxY };
};

export const clampZoom = (zoom: number): number =>
  Math.min(MIN_ZOOM, Math.max(MAX_ZOOM, zoom));

export const zoomToFit = (
  elements: readonly NonDeletedExcalidrawElement[],
  viewport: Viewport,
  padding = DEFAULT_PADDING,
): Viewport => {
  const bounds = getSelectionBounds(elements);
  if (!bounds) {
    return viewport;
  }
  const contentWidth = bounds.maxX - bounds.minX;
  const contentHeight = bounds.maxY - bounds.minY;
  const availableWidth = viewport.width - padding;
  const availableHeight = viewport.height - padding * 2;
  const zoom = clampZoom(
    Math.min(availableWidth / contentWidth, availableHeight / contentHeight),
  );
  const centerX = bounds.minX + contentWidth / 2;
  const centerY = bounds.minY + contentHeight / 2;
  return {
    ...viewport,
    zoom,
    scrollX: viewport.width / 2 / zoom - centerX,
    scrollY: viewport.height / 2 / zoom - centerY,
  };
};

export const animateViewport = (
  from: Viewport,
  to: Viewport,
  durationMs: number,
  onFrame: (viewport: Viewport) => void,
): (() => void) => {
  const start = performance.now();
  let frame = 0;
  const step = (now: number) => {
    const t = Math.min(1, (now - start) / durationMs);
    const eased = t * (2 - t);
    onFrame({
      ...to,
      zoom: from.zoom + (to.zoom - from.zoom) * eased,
      scrollX: from.scrollX + (to.scrollX - from.scrollX) * eased,
      scrollY: from.scrollY + (to.scrollY - from.scrollY) * eased,
    });
    if (t < 1) {
      frame = requestAnimationFrame(step);
    }
  };
  frame = requestAnimationFrame(step);
  return () => cancelAnimationFrame(frame);
};
