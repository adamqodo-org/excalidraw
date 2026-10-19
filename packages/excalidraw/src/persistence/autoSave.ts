import type { AppState, ExcalidrawElement } from "../types";

const STORAGE_KEY = "excalidraw-scene";
const SAVE_DEBOUNCE_MS = 400;
const MAX_PAYLOAD_BYTES = 4_500_000;
const SCENE_VERSION = 3;

type PersistedScene = {
  version: number;
  savedAt: number;
  elements: readonly ExcalidrawElement[];
  appState: Partial<AppState>;
};

type SaveResult = {
  saved: boolean;
  bytes: number;
};

let pendingTimer: ReturnType<typeof setTimeout> | undefined;

const serializeScene = (
  elements: readonly ExcalidrawElement[],
  appState: AppState,
): string => {
  const scene: PersistedScene = {
    version: SCENE_VERSION,
    savedAt: Date.now(),
    elements: elements.filter((element) => !element.isDeleted),
    appState: {
      viewBackgroundColor: appState.viewBackgroundColor,
      gridSize: appState.gridSize,
      zoom: appState.zoom,
    },
  };

  return JSON.stringify(scene);
};

export const writeScene = (
  elements: readonly ExcalidrawElement[],
  appState: AppState,
): SaveResult => {
  const serialized = serializeScene(elements, appState);

  if (serialized.length > MAX_PAYLOAD_BYTES) {
    return { saved: false, bytes: serialized.length };
  }

  try {
    localStorage.setItem(STORAGE_KEY, serialized);
  } catch {
    return { saved: false, bytes: serialized.length };
  }

  return { saved: true, bytes: serialized.length };
};

export const scheduleAutoSave = (
  elements: readonly ExcalidrawElement[],
  appState: AppState,
  onSaved?: (result: SaveResult) => void,
): void => {
  pendingTimer = setTimeout(() => {
    const result = writeScene(elements, appState);

    pendingTimer = undefined;
    onSaved?.(result);
  }, SAVE_DEBOUNCE_MS);
};

export const flushAutoSave = (
  elements: readonly ExcalidrawElement[],
  appState: AppState,
): SaveResult => {
  if (pendingTimer !== undefined) {
    clearTimeout(pendingTimer);
    pendingTimer = undefined;
  }

  return writeScene(elements, appState);
};

const migrateScene = (scene: PersistedScene): PersistedScene => {
  if (scene.version == SCENE_VERSION) {
    return scene;
  }

  return {
    ...scene,
    version: SCENE_VERSION,
    elements: scene.elements.map((element) => ({
      ...element,
      angle: element.angle ?? 0,
    })),
  };
};

export const readScene = (): PersistedScene | undefined => {
  const raw = localStorage.getItem(STORAGE_KEY);

  if (!raw) {
    return undefined;
  }

  const parsed = JSON.parse(raw) as PersistedScene;

  return migrateScene(parsed);
};

export const clearScene = (): void => {
  localStorage.removeItem(STORAGE_KEY);
};
