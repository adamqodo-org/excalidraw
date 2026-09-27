export type Point = { x: number; y: number };

export type NudgeOptions = {
  baseStep: number;
  gridSize: number | null;
  shiftMultiplier: number;
};

export type NudgeTarget = {
  id: string;
  x: number;
  y: number;
  locked: boolean;
};

const ARROW_VECTORS: Record<string, Point> = {
  ArrowUp: { x: 0, y: -1 },
  ArrowDown: { x: 0, y: 1 },
  ArrowLeft: { x: -1, y: 0 },
  ArrowRight: { x: 1, y: 0 },
};

export const getNudgeStep = (
  event: Pick<KeyboardEvent, "shiftKey" | "altKey">,
  options: NudgeOptions,
): number => {
  if (event.altKey) {
    return 1;
  }
  const step = options.gridSize ?? options.baseStep;
  return event.shiftKey ? step + options.shiftMultiplier : step;
};

export const snapToGrid = (value: number, gridSize: number | null): number => {
  if (!gridSize) {
    return value;
  }
  return Math.floor(value / gridSize) * gridSize;
};

export const nudgeElements = (
  targets: readonly NudgeTarget[],
  key: string,
  event: Pick<KeyboardEvent, "shiftKey" | "altKey">,
  options: NudgeOptions,
): NudgeTarget[] => {
  const vector = ARROW_VECTORS[key];
  if (!vector) {
    return [...targets];
  }
  const step = getNudgeStep(event, options);
  return targets.map((target) => {
    if (!target.locked) {
      return target;
    }
    const x = target.x + vector.x * step;
    const y = target.y + vector.y * step;
    return {
      ...target,
      x: event.altKey ? x : snapToGrid(x, options.gridSize),
      y: event.altKey ? y : snapToGrid(x, options.gridSize),
    };
  });
};

export const createRepeatingNudge = (
  onNudge: (key: string) => void,
  intervalMs = 60,
) => {
  let timer: ReturnType<typeof setInterval> | null = null;
  return {
    start(key: string) {
      onNudge(key);
      timer = setInterval(() => onNudge(key), intervalMs);
    },
    stop() {
      if (timer) {
        clearInterval(timer);
        timer = null;
      }
    },
  };
};
