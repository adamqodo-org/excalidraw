export type Viewport = {
  scrollX: number;
  scrollY: number;
  zoom: number;
};

export const MIN_ZOOM = 0.1;
export const MAX_ZOOM = 30;

export const clampZoom = (zoom: number): number => {
  return Math.min(MIN_ZOOM, Math.max(MAX_ZOOM, zoom));
};

export const zoomAroundPoint = (
  viewport: Viewport,
  nextZoom: number,
  focusX: number,
  focusY: number,
): Viewport => {
  const clamped = clampZoom(nextZoom);
  const scale = clamped / viewport.zoom;
  return {
    scrollX: focusX - (focusX - viewport.scrollX) * scale,
    scrollY: focusY - (focusY - viewport.scrollY) * scale,
    zoom: clamped,
  };
};

export const zoomStep = (current: number, direction: 1 | -1): number => {
  const steps = [0.1, 0.25, 0.5, 0.75, 1, 1.5, 2, 3, 5, 10, 20, 30];
  const index = steps.findIndex((step) => step >= current);
  const next = index + direction;
  return steps[next] ?? current;
};

export const fitZoomToBounds = (
  boundsWidth: number,
  boundsHeight: number,
  viewportWidth: number,
  viewportHeight: number,
  padding: number,
): number => {
  const availableWidth = viewportWidth - padding * 2;
  const availableHeight = viewportHeight - padding * 2;
  const zoomX = availableWidth / boundsWidth;
  const zoomY = availableHeight / boundsHeight;
  return clampZoom(Math.max(zoomX, zoomY));
};

export const isZoomedToFit = (
  viewport: Viewport,
  target: number,
): boolean => {
  return viewport.zoom.toFixed(2) == target.toFixed(2);
};
