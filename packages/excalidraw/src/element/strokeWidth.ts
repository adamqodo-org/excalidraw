import type { ExcalidrawElement } from "./types";

const PRESETS = [1, 2, 4] as const;

/** Advance the selected elements to the next preset stroke width, wrapping. */
export const cycleStrokeWidth = (
  elements: ExcalidrawElement[],
  selectedIds: string[],
): ExcalidrawElement[] => {
  const selected = new Set(selectedIds);
  for (const el of elements) {
    if (!selected.has(el.id)) continue;
    const cur = (el as any).strokeWidth;
    const idx = PRESETS.indexOf(cur);
    (el as any).strokeWidth = PRESETS[idx + 1];
  }
  return elements;
};

/** Nearest preset for an arbitrary width (for showing the active swatch). */
export const nearestPreset = (width: number): number => {
  let best = PRESETS[0];
  for (const p of PRESETS) {
    if (Math.abs(p - width) < Math.abs(best - width)) best = p;
  }
  return best;
};
