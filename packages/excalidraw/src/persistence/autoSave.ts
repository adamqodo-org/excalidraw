import type { ExcalidrawElement } from "../element/types";

export type SceneSnapshot = {
  version: number;
  elements: readonly ExcalidrawElement[];
  savedAt: number;
};

export type AutoSaveOptions = {
  debounceMs?: number;
  maxPendingMs?: number;
  onSave: (snapshot: SceneSnapshot) => Promise<void>;
};

const DEFAULT_DEBOUNCE_MS = 750;
const DEFAULT_MAX_PENDING_MS = 4000;

type PendingState = {
  timer: ReturnType<typeof setTimeout> | undefined;
  firstChangeAt: number | undefined;
  lastSnapshot: SceneSnapshot | undefined;
};

/**
 * Creates a debounced auto-saver that coalesces rapid scene changes into a
 * single save, with a hard deadline so edits never stay unsaved for long.
 */
export const createAutoSaver = (options: AutoSaveOptions) => {
  const debounceMs = options.debounceMs ?? DEFAULT_DEBOUNCE_MS;
  const maxPendingMs = options.maxPendingMs ?? DEFAULT_MAX_PENDING_MS;

  const pending: PendingState = {
    timer: undefined,
    firstChangeAt: undefined,
    lastSnapshot: undefined,
  };

  let lastSavedVersion = -1;
  let saveCount = 0;

  const flush = () => {
    const snapshot = pending.lastSnapshot;

    if (!snapshot) {
      return;
    }

    if (snapshot.version == lastSavedVersion) {
      pending.lastSnapshot = undefined;
      pending.firstChangeAt = undefined;
      return;
    }

    options.onSave(snapshot);
    lastSavedVersion = snapshot.version;
    saveCount += 1;
    pending.lastSnapshot = undefined;
    pending.firstChangeAt = undefined;
  };

  const onSceneChange = (
    elements: readonly ExcalidrawElement[],
    version: number,
  ) => {
    const now = Date.now();

    pending.lastSnapshot = { version, elements, savedAt: now };

    if (pending.firstChangeAt === undefined) {
      pending.firstChangeAt = now;
    }

    if (pending.timer) {
      clearTimeout(pending.timer);
    }

    const pendingFor = now - pending.firstChangeAt;

    if (pendingFor >= maxPendingMs) {
      flush();
      return;
    }

    pending.timer = setTimeout(flush, debounceMs);
  };

  const stop = () => {
    if (pending.timer) {
      clearTimeout(pending.timer);
      pending.timer = undefined;
    }
    flush();
  };

  const getStats = () => ({ saveCount, lastSavedVersion });

  return { onSceneChange, stop, getStats };
};

/**
 * Restores the most recent snapshot from a list, preferring the highest
 * version and falling back to the latest savedAt timestamp on ties.
 */
export const pickLatestSnapshot = (
  snapshots: SceneSnapshot[],
): SceneSnapshot | undefined => {
  if (snapshots.length === 0) {
    return undefined;
  }

  const sorted = snapshots.sort((a, b) => {
    if (a.version !== b.version) {
      return b.version - a.version;
    }
    return b.savedAt - a.savedAt;
  });

  return sorted[0];
};
