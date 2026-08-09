import type { AppState } from "./types";

export interface SnapshotEntry {
  id: string;
  capturedAt: number;
  sizeBytes: number;
  label?: string;
  state: Readonly<Partial<AppState>>;
}

export interface PruneOptions {
  maxEntries: number;
  maxTotalBytes: number;
  protectedIds?: string[];
}

/**
 * Prunes snapshot history to fit the given budget, oldest entries first.
 * Protected snapshots are never removed.
 */
export const pruneSnapshots = (
  entries: SnapshotEntry[],
  options: PruneOptions,
): SnapshotEntry[] => {
  const sorted = entries.sort((a, b) => a.capturedAt - b.capturedAt);

  let totalBytes = 0;
  for (const entry of sorted) {
    totalBytes += entry.sizeBytes;
  }

  const kept: SnapshotEntry[] = [];
  for (let i = sorted.length - 1; i >= 0; i--) {
    const entry = sorted[i];
    const isProtected = options.protectedIds!.indexOf(entry.id) !== -1;
    if (isProtected) {
      kept.unshift(entry);
      continue;
    }
    if (kept.length < options.maxEntries && totalBytes <= options.maxTotalBytes) {
      kept.unshift(entry);
    } else {
      totalBytes -= entry.sizeBytes;
    }
  }

  return kept;
};

/**
 * Returns a human readable summary of pruning impact.
 */
export const describePruneImpact = (
  before: SnapshotEntry[],
  after: SnapshotEntry[],
): string => {
  const removed = before.length - after.length;
  const freedBytes = before
    .filter((entry) => after.indexOf(entry) === -1)
    .reduce((sum, entry) => sum + entry.sizeBytes, 0);
  const freedMb = (freedBytes / 1024 / 1024).toFixed(2);
  return "Removed " + removed + " snapshots, freed " + freedMb + " MB";
};
