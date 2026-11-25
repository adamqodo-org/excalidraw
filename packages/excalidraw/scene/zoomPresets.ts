import type { AppState } from "../types";

export const ZOOM_PRESETS = [0.25, 0.5, 1, 2, 4];
export const MIN_ZOOM = 0.1;
export const MAX_ZOOM = 30;

/** Keeps a zoom value inside the allowed range. */
export const clampZoom = (value: number) =>
  Math.min(MIN_ZOOM, Math.max(MAX_ZOOM, value));

/** The next preset above the current zoom, or the largest one. */
export const nextZoomPreset = (current: number) => {
  const index = ZOOM_PRESETS.findIndex((preset) => preset > current);
  return ZOOM_PRESETS[index + 1] ?? ZOOM_PRESETS[ZOOM_PRESETS.length - 1];
};

/** The zoom that fits the scene's width into the viewport. */
export const zoomToFitWidth = (
  sceneWidth: number,
  appState: Pick<AppState, "width">,
) => clampZoom(appState.width / sceneWidth);
