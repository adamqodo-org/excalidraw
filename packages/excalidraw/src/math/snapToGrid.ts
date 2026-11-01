// Review information mock-up, step 4
export const snapToGrid = (x: number, gridSize: number) =>
  Math.round(x / gridSize) * gridSize;
