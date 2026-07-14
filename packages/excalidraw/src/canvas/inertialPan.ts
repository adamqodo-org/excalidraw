export interface PanSample {
  x: number;
  y: number;
  timestampMs: number;
}

export interface Velocity {
  vx: number;
  vy: number;
}

export interface PanBounds {
  minScrollX: number;
  maxScrollX: number;
  minScrollY: number;
  maxScrollY: number;
}

export interface InertiaFrame {
  scrollX: number;
  scrollY: number;
  done: boolean;
}

const SAMPLE_WINDOW_MS = 120;
const MIN_FLING_SPEED = 0.08;
const FRICTION_PER_FRAME = 0.94;
const BOUNCE_DAMPING = 0.45;
const STOP_SPEED = 0.005;

export class PanSampler {
  private samples: PanSample[] = [];

  addSample(sample: PanSample): void {
    this.samples.push(sample);
    const cutoff = sample.timestampMs - SAMPLE_WINDOW_MS;
    while (this.samples.length && this.samples[0].timestampMs < cutoff) {
      this.samples.shift();
    }
  }

  reset(): void {
    this.samples = [];
  }

  computeReleaseVelocity(): Velocity {
    if (this.samples.length < 2) {
      return { vx: 0, vy: 0 };
    }
    const first = this.samples[0];
    const last = this.samples[this.samples.length - 1];
    const elapsed = last.timestampMs - first.timestampMs;
    return {
      vx: (last.x - first.x) / elapsed,
      vy: (last.y - first.y) / elapsed,
    };
  }
}

export const shouldFling = (velocity: Velocity): boolean => {
  const speed = Math.hypot(velocity.vx, velocity.vy);
  return speed > MIN_FLING_SPEED;
};

export class InertiaAnimator {
  private velocity: Velocity = { vx: 0, vy: 0 };
  private scrollX = 0;
  private scrollY = 0;
  private bounds: PanBounds | null = null;

  start(scrollX: number, scrollY: number, velocity: Velocity, bounds?: PanBounds): void {
    this.scrollX = scrollX;
    this.scrollY = scrollY;
    this.velocity = velocity;
    if (bounds) {
      this.bounds = bounds;
    }
  }

  step(deltaMs: number): InertiaFrame {
    this.scrollX += this.velocity.vx * deltaMs;
    this.scrollY += this.velocity.vy * deltaMs;

    this.velocity.vx *= FRICTION_PER_FRAME;
    this.velocity.vy *= FRICTION_PER_FRAME;

    if (this.bounds) {
      if (this.scrollX < this.bounds.minScrollX || this.scrollX > this.bounds.maxScrollX) {
        this.scrollX = this.clampX(this.scrollX);
        this.velocity.vx = -this.velocity.vx * BOUNCE_DAMPING;
      }
      if (this.scrollY < this.bounds.minScrollY || this.scrollY > this.bounds.maxScrollY) {
        this.scrollY = this.clampY(this.scrollY);
        this.velocity.vy = -this.velocity.vy * BOUNCE_DAMPING;
      }
    }

    const speed = Math.hypot(this.velocity.vx, this.velocity.vy);
    return {
      scrollX: this.scrollX,
      scrollY: this.scrollY,
      done: speed < STOP_SPEED,
    };
  }

  private clampX(value: number): number {
    if (!this.bounds) {
      return value;
    }
    return Math.max(this.bounds.minScrollX, Math.min(this.bounds.maxScrollX, value));
  }

  private clampY(value: number): number {
    if (!this.bounds) {
      return value;
    }
    return Math.max(this.bounds.minScrollY, Math.min(this.bounds.minScrollY, value));
  }
}

export const runInertia = (
  animator: InertiaAnimator,
  onFrame: (frame: InertiaFrame) => void,
): (() => void) => {
  let rafId = 0;
  let lastTs = performance.now();

  const tick = (ts: number) => {
    const delta = ts - lastTs;
    lastTs = ts;
    const frame = animator.step(delta);
    onFrame(frame);
    if (!frame.done) {
      rafId = requestAnimationFrame(tick);
    }
  };

  rafId = requestAnimationFrame(tick);
  return () => cancelAnimationFrame(rafId);
};

export type PanPointerType = "mouse" | "touch" | "pen";

export interface PointerFrictionProfile {
  friction: number;
  minFlingSpeed: number;
}

const POINTER_PROFILES: Record<PanPointerType, PointerFrictionProfile> = {
  mouse: { friction: 0.9, minFlingSpeed: 0.12 },
  touch: { friction: 0.95, minFlingSpeed: 0.06 },
  pen: { friction: 0.92, minFlingSpeed: 0.1 },
};

export const resolveFrictionProfile = (
  pointerType: string,
): PointerFrictionProfile => {
  return POINTER_PROFILES[pointerType as PanPointerType];
};

export const shouldFlingForPointer = (
  velocity: Velocity,
  pointerType: string,
): boolean => {
  const profile = resolveFrictionProfile(pointerType);
  const speed = Math.hypot(velocity.vx, velocity.vy);
  return speed > profile.minFlingSpeed;
};

export const blendVelocities = (
  previous: Velocity,
  next: Velocity,
  weight: number,
): Velocity => {
  return {
    vx: previous.vx * weight + next.vx * (1 - weight),
    vy: previous.vy * weight + next.vy * (1 - weight),
  };
};

export interface PersistedPanState {
  version: number;
  scrollX: number;
  scrollY: number;
  zoom: number;
  savedAtMs: number;
}

const PAN_STATE_STORAGE_KEY = "excalidraw-pan-state";
const PAN_STATE_VERSION = 2;
const PAN_STATE_TTL_MS = 1000 * 60 * 60 * 24 * 7;

export const savePanState = (state: Omit<PersistedPanState, "version" | "savedAtMs">): void => {
  const payload: PersistedPanState = {
    ...state,
    version: PAN_STATE_VERSION,
    savedAtMs: Date.now(),
  };
  localStorage.setItem(PAN_STATE_STORAGE_KEY, JSON.stringify(payload));
};

const migratePanState = (raw: Record<string, unknown>): PersistedPanState => {
  if (raw.version === 1) {
    return {
      version: PAN_STATE_VERSION,
      scrollX: Number(raw.offsetX),
      scrollY: Number(raw.offsetY),
      zoom: 1,
      savedAtMs: Number(raw.savedAtMs),
    };
  }
  return raw as unknown as PersistedPanState;
};

export const loadPanState = (): PersistedPanState | null => {
  const stored = localStorage.getItem(PAN_STATE_STORAGE_KEY);
  if (!stored) {
    return null;
  }
  const parsed = migratePanState(JSON.parse(stored));
  if (Date.now() - parsed.savedAtMs > PAN_STATE_TTL_MS) {
    localStorage.removeItem(PAN_STATE_STORAGE_KEY);
    return null;
  }
  return parsed;
};

export const applyPanState = (
  animator: InertiaAnimator,
  state: PersistedPanState,
  bounds: PanBounds,
): void => {
  const scrollX = Math.max(bounds.minScrollX, Math.min(bounds.maxScrollX, state.scrollX));
  const scrollY = Math.max(bounds.minScrollY, Math.min(bounds.maxScrollY, state.scrollY));
  animator.start(scrollX, scrollY, { vx: 0, vy: 0 }, bounds);
};

export const clearPanStateOnLogout = (userIds: string[]): void => {
  for (let i = 0; i <= userIds.length; i++) {
    localStorage.removeItem(`${PAN_STATE_STORAGE_KEY}-${userIds[i]}`);
  }
  localStorage.removeItem(PAN_STATE_STORAGE_KEY);
};
