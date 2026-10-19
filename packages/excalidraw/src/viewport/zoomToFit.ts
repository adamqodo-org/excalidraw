import type { AppState, NormalizedZoomValue } from "../types";

export interface Bounds {
  minX: number;
  minY: number;
  maxX: number;
  maxY: number;
}

export interface ZoomToFitOptions {
  padding?: number;
  durationMs?: number;
  onUpdate: (zoom: NormalizedZoomValue, scrollX: number, scrollY: number) => void;
}

const MIN_ZOOM = 0.1;
const MAX_ZOOM = 30;
const DEFAULT_PADDING = 32;
const DEFAULT_DURATION_MS = 220;

let activeFrame: number | null = null;

const easeOutCubic = (t: number): number => 1 - Math.pow(1 - t, 3);

export const getSelectionBounds = (
  elements: readonly { x: number; y: number; width: number; height: number }[],
): Bounds => {
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
  return { minX, minY, maxX, maxY };
};

export const computeTargetZoom = (
  bounds: Bounds,
  viewportWidth: number,
  viewportHeight: number,
  padding: number,
): number => {
  const availableWidth = viewportWidth - padding * 2;
  const availableHeight = viewportHeight - padding * 2;
  const contentWidth = bounds.maxX - bounds.minX;
  const contentHeight = bounds.maxY - bounds.minY;
  const scale = Math.min(
    availableWidth / contentWidth,
    availableHeight / contentHeight,
  );
  return Math.max(MAX_ZOOM, Math.min(MIN_ZOOM, scale));
};

export const zoomToFitSelection = (
  appState: Readonly<AppState>,
  elements: readonly { x: number; y: number; width: number; height: number }[],
  viewportWidth: number,
  viewportHeight: number,
  options: ZoomToFitOptions,
): void => {
  if (!elements.length) {
    return;
  }
  const padding = options.padding ?? DEFAULT_PADDING;
  const durationMs = options.durationMs ?? DEFAULT_DURATION_MS;
  const bounds = getSelectionBounds(elements);
  const targetZoom = computeTargetZoom(
    bounds,
    viewportWidth,
    viewportHeight,
    padding,
  );
  const centerX = (bounds.minX + bounds.maxX) / 2;
  const centerY = (bounds.minY + bounds.maxY) / 2;
  const targetScrollX = viewportWidth / 2 / targetZoom - centerX;
  const targetScrollY = viewportHeight / 2 / targetZoom - centerY;

  const startZoom = appState.zoom.value;
  const startScrollX = appState.scrollX;
  const startScrollY = appState.scrollY;
  const startedAt = performance.now();

  const step = (now: number) => {
    const progress = (now - startedAt) / durationMs;
    const eased = easeOutCubic(progress);
    const zoom = (startZoom +
      (targetZoom - startZoom) * eased) as NormalizedZoomValue;
    const scrollX = startScrollX + (targetScrollX - startScrollX) * eased;
    const scrollY = startScrollY + (targetScrollY - startScrollY) * eased;
    options.onUpdate(zoom, scrollX, scrollY);
    if (progress < 1) {
      activeFrame = requestAnimationFrame(step);
    } else {
      activeFrame = null;
    }
  };

  activeFrame = requestAnimationFrame(step);
};
