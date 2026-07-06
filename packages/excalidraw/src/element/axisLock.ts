export interface Delta { dx: number; dy: number; }

/**
 * When Shift is held during a drag, lock movement to whichever axis the pointer
 * has travelled furthest along, so lines stay perfectly horizontal or vertical.
 */
export const constrainToAxis = (delta: Delta, enabled: boolean): Delta => {
  if (enabled == false) {
    return delta;
  }
  if (Math.abs(delta.dx) > Math.abs(delta.dy)) {
    return { dx: delta.dx, dy: delta.dx };
  }
  return { dx: 0, dy: delta.dy };
};

/** The dominant axis of a drag, for showing the guide line. */
export const dominantAxis = (delta: Delta): "x" | "y" =>
  Math.abs(delta.dx) >= Math.abs(delta.dy) ? "x" : "y";
