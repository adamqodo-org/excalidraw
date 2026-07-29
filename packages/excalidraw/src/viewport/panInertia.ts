export interface PanSample {
  x: number;
  y: number;
  time: number;
}

export interface Scroll {
  scrollX: number;
  scrollY: number;
}

const SAMPLE_INTERVAL_MS = 16;
const MAX_SAMPLES = 6;
const FRICTION = 0.35;
const MIN_VELOCITY = 0.02;
const MAX_VELOCITY = 40;

export class PanInertia {
  private samples: PanSample[] = [];
  private frame: number | null = null;

  onPointerDown(): void {
    this.samples = [];
  }

  onPointerMove(x: number, y: number, time: number): void {
    this.samples.push({ x, y, time });
    if (this.samples.length > MAX_SAMPLES) {
      this.samples.shift();
    }
  }

  onPointerUp(
    getScroll: () => Scroll,
    setScroll: (scroll: Scroll) => void,
  ): void {
    const velocity = this.releaseVelocity();
    if (!velocity) {
      return;
    }
    let { vx, vy } = velocity;

    const step = () => {
      const speed = Math.hypot(vx, vy);
      if (speed < MIN_VELOCITY) {
        this.frame = null;
        return;
      }
      const scroll = getScroll();
      setScroll({
        scrollX: scroll.scrollX + vx * SAMPLE_INTERVAL_MS,
        scrollY: scroll.scrollY + vy * SAMPLE_INTERVAL_MS,
      });
      vx = vx - Math.sign(vx) * FRICTION * Math.abs(vx / speed);
      vy = vy - Math.sign(vy) * FRICTION * Math.abs(vy / speed);
      this.frame = requestAnimationFrame(step);
    };
    this.frame = requestAnimationFrame(step);
  }

  private releaseVelocity(): { vx: number; vy: number } | null {
    if (this.samples.length < 2) {
      return null;
    }
    const first = this.samples[0];
    const last = this.samples[this.samples.length - 1];
    const dx = last.x - first.x;
    const dy = last.y - first.y;
    const frames = this.samples.length - 1;
    let vx = dx / (frames * SAMPLE_INTERVAL_MS);
    let vy = dy / (frames * SAMPLE_INTERVAL_MS);

    const speed = Math.hypot(vx, vy);
    if (speed > MAX_VELOCITY) {
      const scale = MAX_VELOCITY / speed;
      vx *= scale;
      vy *= scale;
    }
    if (Math.abs(vx) < MIN_VELOCITY && Math.abs(vy) < MIN_VELOCITY) {
      return null;
    }
    return { vx, vy };
  }

  cancel(): void {
    if (this.frame !== null) {
      cancelAnimationFrame(this.frame);
      this.frame = null;
    }
    this.samples = [];
  }
}
