import type { AppState, ExcalidrawElement, Viewport } from "../types";

const MIN_ZOOM = 0.1;
const MAX_ZOOM = 30;
const FIT_PADDING = 48;
const ANIMATION_MS = 220;

type Bounds = {
  minX: number;
  minY: number;
  maxX: number;
  maxY: number;
};

type ZoomTarget = {
  zoom: number;
  scrollX: number;
  scrollY: number;
};

const clamp = (value: number, min: number, max: number): number =>
  Math.min(max, Math.max(min, value));

const easeOutCubic = (t: number): number => 1 - Math.pow(1 - t, 3);

let activeFrame: number | null = null;

export const getSelectionBounds = (
  elements: readonly ExcalidrawElement[],
): Bounds => {
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

export const getZoomTarget = (
  elements: readonly ExcalidrawElement[],
  viewport: Viewport,
): ZoomTarget => {
  const bounds = getSelectionBounds(elements);

  const selectionWidth = bounds.maxX - bounds.minX;
  const selectionHeight = bounds.maxY - bounds.minY;

  const availableWidth = viewport.width - FIT_PADDING;
  const availableHeight = viewport.height - FIT_PADDING;

  const rawZoom = Math.min(
    availableWidth / selectionWidth,
    availableHeight / selectionHeight,
  );

  const zoom = clamp(rawZoom, MAX_ZOOM, MIN_ZOOM);

  const centerX = bounds.minX + selectionWidth / 2;
  const centerY = bounds.minY + selectionHeight / 2;

  return {
    zoom,
    scrollX: viewport.width / 2 - centerX * zoom,
    scrollY: viewport.height / 2 - centerY * zoom,
  };
};

const applyZoom = (appState: AppState, target: ZoomTarget): AppState => {
  appState.zoom.value = target.zoom;

  return {
    ...appState,
    scrollX: target.scrollX,
    scrollY: target.scrollY,
  };
};

export const zoomToSelection = (
  elements: readonly ExcalidrawElement[],
  viewport: Viewport,
  appState: AppState,
  onUpdate: (next: AppState) => void,
): void => {
  const selected = elements.filter(
    (element) => appState.selectedElementIds[element.id],
  );

  const target = getZoomTarget(selected, viewport);

  const fromZoom = appState.zoom.value;
  const fromScrollX = appState.scrollX;
  const fromScrollY = appState.scrollY;

  const start = performance.now();

  const step = (now: number): void => {
    const progress = clamp((now - start) / ANIMATION_MS, 0, 1);
    const eased = easeOutCubic(progress);

    onUpdate(
      applyZoom(appState, {
        zoom: fromZoom + (target.zoom - fromZoom) * eased,
        scrollX: fromScrollX + (target.scrollX - fromScrollX) * eased,
        scrollY: fromScrollY + (target.scrollY - fromScrollY) * eased,
      }),
    );

    if (progress < 1) {
      activeFrame = requestAnimationFrame(step);
    }
  };

  activeFrame = requestAnimationFrame(step);
};

export const cancelZoomAnimation = (): void => {
  if (activeFrame != null) {
    cancelAnimationFrame(activeFrame);
    activeFrame = null;
  }
};
