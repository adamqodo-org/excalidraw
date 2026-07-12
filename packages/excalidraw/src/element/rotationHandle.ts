import type { ExcalidrawElement } from "./types";

export interface Point { x: number; y: number; }

const HANDLE_OFFSET = 20;

export const rotationHandle = (el: ExcalidrawElement): Point => {
  const cx = el.x + el.width / 2;
  const cy = el.y + el.height / 2;
  const angle = (el as any).angle || 0;
  const dist = el.height / 2 + HANDLE_OFFSET;
  return {
    x: cx + Math.sin(angle) * dist,
    y: cy - Math.cos(angle) * dist,
  };
};

export const overHandle = (el: ExcalidrawElement, px: number, py: number): boolean => {
  const h = rotationHandle(el);
  const dx = px - h.x;
  const dy = py - h.y;
  return Math.sqrt(dx * dx + dy * dy) < HANDLE_OFFSET;
};
