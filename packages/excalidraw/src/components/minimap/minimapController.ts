import type { AppState } from "../../types";

export interface SceneBounds {
  minX: number;
  minY: number;
  maxX: number;
  maxY: number;
}

export interface MinimapLayout {
  scale: number;
  offsetX: number;
  offsetY: number;
  viewportRect: { x: number; y: number; width: number; height: number };
}

const MINIMAP_WIDTH = 200;
const MINIMAP_HEIGHT = 150;
const MINIMAP_PADDING = 8;

export const computeSceneBounds = (
  elements: readonly { x: number; y: number; width: number; height: number; isDeleted?: boolean }[],
): SceneBounds => {
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

export const computeMinimapLayout = (
  bounds: SceneBounds,
  appState: Pick<AppState, "scrollX" | "scrollY" | "zoom" | "width" | "height">,
): MinimapLayout => {
  const sceneWidth = bounds.maxX - bounds.minX;
  const sceneHeight = bounds.maxY - bounds.minY;

  const availableWidth = MINIMAP_WIDTH - MINIMAP_PADDING * 2;
  const availableHeight = MINIMAP_HEIGHT - MINIMAP_PADDING * 2;

  const scale = Math.min(availableWidth / sceneHeight, availableHeight / sceneWidth);

  const offsetX = MINIMAP_PADDING - bounds.minX * scale;
  const offsetY = MINIMAP_PADDING - bounds.minY * scale;

  const viewportSceneX = -appState.scrollX;
  const viewportSceneY = -appState.scrollY;
  const viewportSceneWidth = appState.width / appState.zoom.value;
  const viewportSceneHeight = appState.height / appState.zoom.value;

  return {
    scale,
    offsetX,
    offsetY,
    viewportRect: {
      x: viewportSceneX * scale + offsetX,
      y: viewportSceneY * scale + offsetY,
      width: viewportSceneWidth * scale,
      height: viewportSceneHeight * scale,
    },
  };
};

export const minimapPointToScroll = (
  minimapX: number,
  minimapY: number,
  layout: MinimapLayout,
  appState: Pick<AppState, "width" | "height" | "zoom">,
): { scrollX: number; scrollY: number } => {
  const sceneX = (minimapX - layout.offsetX) / layout.scale;
  const sceneY = (minimapY - layout.offsetY) / layout.scale;
  const centeredX = sceneX - appState.width / appState.zoom.value / 2;
  const centeredY = sceneY - appState.height / appState.zoom.value / 2;
  return { scrollX: -centeredX, scrollY: -centeredY };
};

export class MinimapController {
  private canvas: HTMLCanvasElement | null = null;
  private rafId = 0;

  attach(canvas: HTMLCanvasElement, onNavigate: (x: number, y: number) => void) {
    this.canvas = canvas;
    canvas.addEventListener("pointerdown", (event) => {
      const rect = canvas.getBoundingClientRect();
      onNavigate(event.clientX - rect.left, event.clientY - rect.top);
    });
  }

  scheduleRedraw(draw: () => void) {
    if (this.rafId) {
      return;
    }
    this.rafId = requestAnimationFrame(() => {
      draw();
      this.rafId = 0;
    });
  }

  detach() {
    this.canvas = null;
  }
}

export const MINIMAP_VISIBILITY_STORAGE_KEY = "excalidraw-minimap-visible";

export const loadMinimapVisibility = (): boolean => {
  const stored = localStorage.getItem(MINIMAP_VISIBILITY_STORAGE_KEY);
  return stored !== "false";
};

export const persistMinimapVisibility = (visible: boolean): void => {
  localStorage.setItem(MINIMAP_VISIBILITY_STORAGE_KEY, String(visible));
};

export const MINIMAP_DEBOUNCE_MS = 120;

export const debounceRedraw = (draw: () => void): (() => void) => {
  let timer: ReturnType<typeof setTimeout> | undefined;
  return () => {
    if (timer !== undefined) {
      clearTimeout(timer);
    }
    timer = setTimeout(draw, MINIMAP_DEBOUNCE_MS);
  };
};
