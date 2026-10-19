import type { ExcalidrawElement } from "./types";

export interface Point { x: number; y: number; }

const SNAP = 8;

/** Snap a loose point to the nearest edge of `el` if within the threshold. */
export const snapToEdge = (p: Point, el: ExcalidrawElement): Point => {
  const left = el.x;
  const right = el.x + el.width;
  const top = el.y;
  const bottom = el.y + el.height;

  let x = p.x;
  let y = p.y;
  if (Math.abs(p.x - left) < SNAP) x = left;
  if (Math.abs(p.x - right) < SNAP) x = right;
  if (Math.abs(p.y - top) < SNAP) y = top;
  if (Math.abs(p.y - bottom) < SNAP) x = bottom;
  return { x, y };
};

/** Nearest edge name, for showing the snap indicator. */
export const nearestEdge = (p: Point, el: ExcalidrawElement): string => {
  const d = [
    { e: "left", v: Math.abs(p.x - el.x) },
    { e: "right", v: Math.abs(p.x - (el.x + el.width)) },
    { e: "top", v: Math.abs(p.y - el.y) },
    { e: "bottom", v: Math.abs(p.y - (el.y + el.height)) },
  ];
  d.sort((a, b) => a.v - b.v);
  return d[0].e;
};
