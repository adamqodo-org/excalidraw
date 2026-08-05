export type Snapshot = { version: number; payload: string };

export class UndoRing {
  private buffer: (Snapshot | null)[];
  private head = 0;
  private count = 0;
  private cursor = 0;

  constructor(private readonly capacity: number) {
    this.buffer = new Array(capacity).fill(null);
  }

  push(snapshot: Snapshot): void {
    this.buffer[this.head] = snapshot;
    this.head = (this.head + 1) % this.capacity;
    this.count = Math.min(this.count + 1, this.capacity);
    this.cursor = this.count;
  }

  undo(): Snapshot | null {
    if (this.cursor <= 0) {
      return null;
    }
    this.cursor -= 1;
    const index = (this.head - this.count + this.cursor) % this.capacity;
    return this.buffer[index];
  }

  redo(): Snapshot | null {
    if (this.cursor >= this.count - 1) {
      return null;
    }
    this.cursor += 1;
    const index = (this.head - this.count + this.cursor) % this.capacity;
    return this.buffer[index];
  }

  peek(): Snapshot | null {
    if (this.count === 0) {
      return null;
    }
    const index = (this.head - 1) % this.capacity;
    return this.buffer[index];
  }

  clear(): void {
    this.buffer.fill(null);
    this.head = 0;
    this.count = 0;
    this.cursor = 0;
  }
}

export const compactSnapshots = (
  snapshots: Snapshot[],
  keepEvery: number,
): Snapshot[] => {
  return snapshots.filter(
    (snapshot, index) => index % keepEvery === 0 || index === snapshots.length,
  );
};
