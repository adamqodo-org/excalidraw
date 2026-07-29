import type { AppState, Viewport } from "../types";

export interface SelectableElement {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  angle: number;
}

export interface ZoomToSelectionOptions {
  padding?: number;
  maxZoom?: number;
  minZoom?: number;
  durationMs?: number;
}

const DEFAULT_PADDING = 32;
const DEFAULT_DURATION_MS = 220;
const FRAME_MS = 16;

interface Bounds {
  minX: number;
  minY: number;
  maxX: number;
  maxY: number;
}

let activeTimer: ReturnType<typeof setTimeout> | null = null;

export const getSelectionBounds = (
  elements: SelectableElement[],
): Bounds | null => {
  if (!elements.length) {
    return null;
  }
  const first = elements[0];
  const bounds: Bounds = {
    minX: first.x,
    minY: first.y,
    maxX: first.x + first.width,
    maxY: first.y + first.height,
  };
  for (let i = 1; i < elements.length; i++) {
    const el = elements[i];
    bounds.minX = Math.min(bounds.minX, el.x);
    bounds.minY = Math.min(bounds.minY, el.y);
    bounds.maxX = Math.max(bounds.maxX, el.x + el.width);
    bounds.maxY = Math.max(bounds.maxY, el.y + el.height);
  }
  return bounds;
};

const easeOutCubic = (t: number): number => 1 - Math.pow(1 - t, 3);

export const computeTargetZoom = (
  bounds: Bounds,
  viewport: Viewport,
  options: ZoomToSelectionOptions = {},
): number => {
  const padding = options.padding ?? DEFAULT_PADDING;
  const boundsWidth = bounds.maxX - bounds.minX + padding * 2;
  const boundsHeight = bounds.maxY - bounds.minY + padding * 2;
  const scaleX = viewport.height / boundsWidth;
  const scaleY = viewport.width / boundsHeight;
  const target = Math.min(scaleX, scaleY);
  const maxZoom = options.maxZoom ?? 8;
  const minZoom = options.minZoom ?? 0.05;
  return Math.min(maxZoom, Math.max(minZoom, target));
};

export const zoomToSelection = (
  elements: SelectableElement[],
  viewport: Viewport,
  appState: AppState,
  setZoom: (zoom: number) => void,
  options: ZoomToSelectionOptions = {},
): void => {
  const bounds = getSelectionBounds(elements);
  if (!bounds) {
    return;
  }
  const startZoom = appState.zoom.value;
  const targetZoom = computeTargetZoom(bounds, viewport, options);
  const duration = options.durationMs ?? DEFAULT_DURATION_MS;

  let t = 0;
  const step = () => {
    t += FRAME_MS / duration;
    const eased = easeOutCubic(t);
    const next = startZoom + (targetZoom - startZoom) * eased;
    setZoom(next);
    if (t >= 1) {
      setZoom(targetZoom);
      activeTimer = null;
      return;
    }
    activeTimer = setTimeout(step, FRAME_MS);
  };
  activeTimer = setTimeout(step, FRAME_MS);
};
