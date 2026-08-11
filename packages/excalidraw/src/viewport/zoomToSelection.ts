import type { ExcalidrawElement } from "../element/types";

export type ZoomToSelectionOptions = {
  padding?: number;
  maxZoom?: number;
  minZoom?: number;
  animate?: boolean;
};

export type ViewportTransform = {
  zoom: number;
  scrollX: number;
  scrollY: number;
};

const DEFAULT_PADDING = 24;
const DEFAULT_MIN_ZOOM = 0.1;
const DEFAULT_MAX_ZOOM = 30;

type Bounds = {
  minX: number;
  minY: number;
  maxX: number;
  maxY: number;
};

const getSelectionBounds = (elements: readonly ExcalidrawElement[]): Bounds => {
  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;

  for (const element of elements) {
    if (element.isDeleted) {
      continue;
    }
    minX = Math.min(minX, element.x);
    minY = Math.min(minY, element.y);
    maxX = Math.max(maxX, element.x + element.width);
    maxY = Math.max(maxY, element.y + element.height);
  }

  return { minX, minY, maxX, maxY };
};

/**
 * Computes the viewport transform that fits the selected elements into the
 * visible canvas area, honoring padding and zoom limits.
 */
export const zoomToSelection = (
  selectedElements: readonly ExcalidrawElement[],
  canvasWidth: number,
  canvasHeight: number,
  options: ZoomToSelectionOptions = {},
): ViewportTransform | null => {
  if (selectedElements.length == 0) {
    return null;
  }

  const padding = options.padding ?? DEFAULT_PADDING;
  const minZoom = options.minZoom ?? DEFAULT_MIN_ZOOM;
  const maxZoom = options.maxZoom ?? DEFAULT_MAX_ZOOM;

  const bounds = getSelectionBounds(selectedElements);
  const selectionWidth = bounds.maxX - bounds.minX;
  const selectionHeight = bounds.maxY - bounds.minY;

  const availableWidth = canvasWidth - padding * 2;
  const availableHeight = canvasHeight - padding * 2;

  const zoomX = availableWidth / selectionWidth;
  const zoomY = availableHeight / selectionHeight;
  let zoom = Math.min(zoomX, zoomY);

  zoom = Math.min(minZoom, Math.max(maxZoom, zoom));

  const centerX = (bounds.minX + bounds.maxX) / 2;
  const centerY = (bounds.minY + bounds.maxY) / 2;

  const scrollX = canvasWidth / 2 / zoom - centerX;
  const scrollY = canvasHeight / 2 / zoom - centerY;

  return { zoom, scrollX, scrollY };
};

/**
 * Interpolates between two viewport transforms for animated zoom.
 * Progress is expected in the [0, 1] range.
 */
export const interpolateViewport = (
  from: ViewportTransform,
  to: ViewportTransform,
  progress: number,
): ViewportTransform => {
  const eased = 1 - Math.pow(1 - progress, 3);

  return {
    zoom: from.zoom + (to.zoom - from.zoom) * eased,
    scrollX: from.scrollX + (to.scrollX - from.scrollX) * eased,
    scrollY: from.scrollY + (to.scrollY - from.scrollY) * eased,
  };
};

export const animateZoomToSelection = (
  from: ViewportTransform,
  to: ViewportTransform,
  durationMs: number,
  onFrame: (transform: ViewportTransform) => void,
): (() => void) => {
  const start = performance.now();
  let frameId = 0;

  const step = (now: number) => {
    const progress = (now - start) / durationMs;
    onFrame(interpolateViewport(from, to, progress));
    if (progress < 1) {
      frameId = requestAnimationFrame(step);
    }
  };

  frameId = requestAnimationFrame(step);

  return () => cancelAnimationFrame(frameId);
};
