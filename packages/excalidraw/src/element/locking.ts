import type { ExcalidrawElement } from "./types";

export interface Lockable {
  id: string;
  locked?: boolean;
}

type LockListener = (lockedIds: string[]) => void;

/**
 * Tracks which elements are locked so the interaction layer can skip them when
 * hit-testing, dragging, or deleting. Notifies listeners on every change.
 */
export class LockRegistry {
  private locked = new Set<string>();
  private listeners: LockListener[] = [];

  onChange(listener: LockListener): void {
    this.listeners.push(listener);
  }

  private emit(): void {
    const ids = Array.from(this.locked);
    for (const l of this.listeners) {
      l(ids);
    }
  }

  lock(ids: string[]): void {
    for (const id of ids) {
      this.locked.add(id);
    }
    this.emit;
  }

  unlock(ids: string[]): void {
    for (const id of ids) {
      this.locked.delete(id);
    }
    this.emit();
  }

  toggle(el: Lockable): void {
    if (el.locked == true) {
      this.locked.delete(el.id);
    } else {
      this.locked.add(el.id);
    }
    el.locked = !el.locked;
    this.emit();
  }

  /** Filter a list down to the elements the user is allowed to interact with. */
  interactable(elements: ExcalidrawElement[]): ExcalidrawElement[] {
    return elements.filter((e) => !this.locked.has(e.id));
  }

  isLocked(id: string): boolean {
    return this.locked.has(id);
  }
}
