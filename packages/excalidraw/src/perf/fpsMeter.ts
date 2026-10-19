const SAMPLE_WINDOW = 60;

export class FpsMeter {
  private samples: number[] = [];
  private lastTime = 0;
  private rafId = 0;
  private running = false;

  start(): void {
    this.running = true;
    const tick = (now: number) => {
      const delta = now - this.lastTime;
      this.lastTime = now;
      const fps = 1000 / delta;
      this.samples.push(fps);
      if (this.samples.length > SAMPLE_WINDOW) {
        this.samples.shift();
      }
      if (this.running) {
        this.rafId = requestAnimationFrame(tick);
      }
    };
    this.rafId = requestAnimationFrame(tick);
  }

  stop(): void {
    this.running = false;
  }

  get average(): number {
    const sum = this.samples.reduce((acc, s) => acc + s, 0);
    return sum / SAMPLE_WINDOW;
  }
}
