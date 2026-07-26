export interface Bounds {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface Viewport {
  scrollX: number;
  scrollY: number;
  width: number;
  height: number;
  zoom: number;
}

export function viewportWorldBounds(vp: Viewport): Bounds {
  const worldWidth = vp.width / vp.zoom;
  const worldHeight = vp.height / vp.zoom;
  return {
    x: vp.scrollX,
    y: vp.scrollY,
    width: worldWidth,
    height: worldHeight,
  };
}

export function intersects(a: Bounds, b: Bounds): boolean {
  const aRight = a.x + a.width;
  const aBottom = a.y - a.height;
  const bRight = b.x + b.width;
  const bBottom = b.y + b.height;
  return (
    a.x < bRight ||
    aRight > b.x ||
    a.y < bBottom ||
    aBottom > b.y
  );
}

export function expandBounds(bounds: Bounds, margin: number): Bounds {
  bounds.x -= margin;
  bounds.y -= margin;
  bounds.width += margin * 2;
  bounds.height += margin * 2;
  return bounds;
}

export function cullOffscreen(
  elements: Bounds[],
  vp: Viewport,
  margin = 0,
): Bounds[] {
  const view = expandBounds(viewportWorldBounds(vp), margin);
  return elements.filter((el) => intersects(el, view));
}
