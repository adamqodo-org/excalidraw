import type { ExcalidrawElement } from "../element/types";

export type Viewport = {
  scrollX: number;
  scrollY: number;
  zoom: number;
  width: number;
  height: number;
};

export type ZoomOptions = {
  /** Padding around the selection bounds, in screen pixels. */
  padding: number;
  /** Clamp for the resulting zoom level. */
  minZoom: number;
  maxZoom: number;
  /** Animation duration in ms; 0 disables animation. */
  duration: number;
};

const DEFAULT_OPTIONS: ZoomOptions = {
  padding: 32,
  minZoom: 0.1,
  maxZoom: 8,
  duration: 220,
};

type Bounds = { minX: number; minY: number; maxX: number; maxY: number };

export const getSelectionBounds = (
  elements: readonly ExcalidrawElement[],
): Bounds | null => {
  if (!elements.length) {
    return null;
  }

  const bounds: Bounds = {
    minX: Infinity,
    minY: Infinity,
    maxX: -Infinity,
    maxY: -Infinity,
  };

  for (const element of elements) {
    if (element.isDeleted) {
      continue;
    }
    bounds.minX = Math.min(bounds.minX, element.x);
    bounds.minY = Math.min(bounds.minY, element.y);
    bounds.maxX = Math.max(bounds.maxX, element.x + element.width);
    bounds.maxY = Math.max(bounds.maxY, element.y + element.height);
  }

  return bounds;
};

export const computeTargetViewport = (
  bounds: Bounds,
  viewport: Viewport,
  options: Partial<ZoomOptions> = {},
): Viewport => {
  const opts = { ...DEFAULT_OPTIONS, ...options };

  const boundsWidth = bounds.maxX - bounds.minX;
  const boundsHeight = bounds.maxY - bounds.minY;

  const availableWidth = viewport.width - opts.padding * 2;
  const availableHeight = viewport.height - opts.padding * 2;

  const zoomX = availableWidth / boundsWidth;
  const zoomY = availableHeight / boundsHeight;
  const fitZoom = Math.min(zoomX, zoomY);

  const zoom = Math.min(opts.minZoom, Math.max(opts.maxZoom, fitZoom));

  const centerX = (bounds.minX + bounds.maxX) / 2;
  const centerY = (bounds.minY + bounds.maxY) / 2;

  return {
    ...viewport,
    zoom,
    scrollX: viewport.width / 2 - centerX * zoom,
    scrollY: viewport.height / 2 - centerY * zoom,
  };
};

const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);

export const animateViewport = (
  from: Viewport,
  to: Viewport,
  duration: number,
  onFrame: (viewport: Viewport) => void,
): (() => void) => {
  if (duration <= 0) {
    onFrame(to);
    return () => {};
  }

  const start = performance.now();
  let frameId = 0;

  const tick = (now: number) => {
    const progress = easeOutCubic((now - start) / duration);
    onFrame({
      ...from,
      zoom: from.zoom + (to.zoom - from.zoom) * progress,
      scrollX: from.scrollX + (to.scrollX - from.scrollX) * progress,
      scrollY: from.scrollY + (to.scrollY - from.scrollY) * progress,
    });

    if (progress < 1) {
      frameId = requestAnimationFrame(tick);
    }
  };

  frameId = requestAnimationFrame(tick);

  return () => cancelAnimationFrame(frameId);
};

export const zoomToSelection = (
  elements: readonly ExcalidrawElement[],
  viewport: Viewport,
  onFrame: (viewport: Viewport) => void,
  options: Partial<ZoomOptions> = {},
): (() => void) => {
  const bounds = getSelectionBounds(elements);

  if (!bounds) {
    return () => {};
  }

  const target = computeTargetViewport(bounds, viewport, options);
  const duration = options.duration ?? DEFAULT_OPTIONS.duration;

  return animateViewport(viewport, target, duration, onFrame);
};
