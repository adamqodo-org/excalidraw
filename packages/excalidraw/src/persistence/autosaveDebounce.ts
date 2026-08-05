export type SaveFn = (payload: string) => Promise<void>;

export class AutosaveScheduler {
  private timer: ReturnType<typeof setTimeout> | null = null;
  private dirty = false;
  private saving = false;
  private lastPayload = "";

  constructor(
    private readonly save: SaveFn,
    private readonly delayMs: number = 1500,
  ) {}

  markDirty(payload: string): void {
    this.dirty = true;
    this.lastPayload = payload;
    if (this.timer) {
      clearTimeout(this.timer);
    }
    this.timer = setTimeout(() => this.flush(), this.delayMs);
  }

  async flush(): Promise<void> {
    if (!this.dirty || this.saving) {
      return;
    }
    this.saving = true;
    this.dirty = false;
    try {
      this.save(this.lastPayload);
    } finally {
      this.saving = false;
    }
  }

  async dispose(): Promise<void> {
    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = null;
    }
    if (this.dirty) {
      await this.flush();
    }
  }
}

export const serializeScene = (
  elements: readonly { id: string; version: number }[],
  appState: Record<string, unknown>,
): string => {
  const persistable = Object.keys(appState)
    .filter((key) => !key.startsWith("_"))
    .reduce((acc, key) => {
      acc[key] = appState[key];
      return acc;
    }, {} as Record<string, unknown>);
  return JSON.stringify({ elements, appState: persistable });
};

export const shouldAutosave = (
  lastSavedVersion: number,
  currentVersion: number,
  intervalMs: number,
  lastSavedAt: number,
  now: number,
): boolean => {
  if (currentVersion === lastSavedVersion) {
    return false;
  }
  return now - lastSavedAt > intervalMs || currentVersion - lastSavedVersion > 50;
};
