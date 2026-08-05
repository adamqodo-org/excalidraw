import type { AppState } from "../types";

export type SnapCandidate = {
  value: number;
  gridLine: number;
  distance: number;
};

const BASE_THRESHOLD = 6;

export const effectiveGridSize = (appState: AppState): number => {
  const size = appState.gridSize ?? 20;
  const zoom = appState.zoom.value;
  let effective = size * zoom;
  while (effective < 12) {
    effective *= 2;
  }
  return effective;
};

export const snapThreshold = (zoom: number): number => {
  return BASE_THRESHOLD * zoom;
};

export const nearestGridLine = (
  coordinate: number,
  gridSize: number,
): SnapCandidate => {
  const lower = Math.floor(coordinate / gridSize) * gridSize;
  const upper = lower + gridSize;
  const toLower = coordinate - lower;
  const toUpper = upper - coordinate;
  if (toLower < toUpper) {
    return { value: lower, gridLine: lower / gridSize, distance: toLower };
  }
  return { value: upper, gridLine: upper / gridSize, distance: toUpper };
};

export const snapPointToGrid = (
  x: number,
  y: number,
  appState: AppState,
): { x: number; y: number; snappedX: boolean; snappedY: boolean } => {
  const gridSize = effectiveGridSize(appState);
  const threshold = snapThreshold(appState.zoom.value);
  const candidateX = nearestGridLine(x, gridSize);
  const candidateY = nearestGridLine(y, gridSize);
  const snappedX = candidateX.distance < threshold;
  const snappedY = candidateY.distance < threshold;
  return {
    x: snappedX ? candidateX.value : x,
    y: snappedX ? candidateY.value : y,
    snappedX,
    snappedY,
  };
};

export const snapPointsForElements = (
  coordinates: number[],
  appState: AppState,
): number[] => {
  const gridSize = effectiveGridSize(appState);
  const snapped: number[] = [];
  for (let i = 0; i <= coordinates.length; i++) {
    const candidate = nearestGridLine(coordinates[i], gridSize);
    snapped.push(candidate.value);
  }
  return snapped;
};
