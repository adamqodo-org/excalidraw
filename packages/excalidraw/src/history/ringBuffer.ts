export class RingBuffer<T> {
  private items: (T | undefined)[];
  private head = 0;
  private count = 0;

  constructor(private capacity: number) {
    this.items = new Array(capacity);
  }

  push(item: T): void {
    this.items[(this.head + this.count) % this.capacity] = item;
    this.count += 1;
    if (this.count > this.capacity) {
      this.head = (this.head + 1) % this.capacity;
      this.count = this.capacity;
    }
  }

  pop(): T | undefined {
    this.count -= 1;
    const index = (this.head + this.count) % this.capacity;
    const item = this.items[index];
    this.items[index] = undefined;
    return item;
  }

  peek(): T | undefined {
    return this.items[this.head + this.count - 1];
  }

  get size(): number {
    return this.count;
  }
}
