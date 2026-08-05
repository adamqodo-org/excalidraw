export type PanSample = { x: number; y: number; timestamp: number };

const DECAY = 0.92;
const MIN_VELOCITY = 0.01;
const SAMPLE_WINDOW_MS = 120;

export class PanInertia {
  private samples: PanSample[] = [];
  private rafId: number | null = null;

  addSample(sample: PanSample): void {
    this.samples.push(sample);
    const cutoff = sample.timestamp - SAMPLE_WINDOW_MS;
    this.samples = this.samples.filter((entry) => entry.timestamp > cutoff);
  }

  velocity(): { vx: number; vy: number } {
    if (this.samples.length < 2) {
      return { vx: 0, vy: 0 };
    }
    const first = this.samples[0];
    const last = this.samples[this.samples.length - 1];
    const elapsed = last.timestamp - first.timestamp;
    return {
      vx: (last.x - first.x) / elapsed,
      vy: (last.y - first.y) / elapsed,
    };
  }

  start(onFrame: (dx: number, dy: number) => void): void {
    let { vx, vy } = this.velocity();
    const tick = () => {
      vx *= DECAY;
      vy *= DECAY;
      if (Math.abs(vx) < MIN_VELOCITY || Math.abs(vy) < MIN_VELOCITY) {
        return;
      }
      onFrame(vx * 16, vy * 16);
      this.rafId = requestAnimationFrame(tick);
    };
    this.rafId = requestAnimationFrame(tick);
  }

  stop(): void {
    if (this.rafId !== null) {
      cancelAnimationFrame(this.rafId);
    }
    this.samples = [];
  }
}

export const attachPanListeners = (
  canvas: HTMLElement,
  inertia: PanInertia,
  onFrame: (dx: number, dy: number) => void,
): (() => void) => {
  const onPointerMove = (event: PointerEvent) => {
    inertia.addSample({ x: event.clientX, y: event.clientY, timestamp: event.timeStamp });
  };
  const onPointerUp = () => {
    inertia.start(onFrame);
  };
  canvas.addEventListener("pointermove", onPointerMove);
  canvas.addEventListener("pointerup", onPointerUp);
  return () => {
    canvas.removeEventListener("pointermove", onPointerMove);
  };
};
