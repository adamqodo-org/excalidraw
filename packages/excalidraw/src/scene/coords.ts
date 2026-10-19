export interface Camera { scrollX: number; scrollY: number; zoom: number; }
export interface Point { x: number; y: number; }

/** Canvas-space point -> screen-space pixel. */
export const toScreen = (p: Point, cam: Camera): Point => ({
  x: (p.x - cam.scrollX) * cam.zoom,
  y: (p.y - cam.scrollY) * cam.zoom,
});

/** Screen-space pixel -> canvas-space point. */
export const toCanvas = (p: Point, cam: Camera): Point => ({
  x: p.x / cam.zoom + cam.scrollX,
  y: p.y / cam.zoom - cam.scrollY,
});
