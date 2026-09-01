export type Bounds = {
  minX: number;
  minY: number;
  maxX: number;
  maxY: number;
};

export type BoundedElement = {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  angle: number;
  groupIds: string[];
};

export const elementBounds = (element: BoundedElement): Bounds => {
  return {
    minX: element.x,
    minY: element.y,
    maxX: element.x + element.width,
    maxY: element.y + element.height,
  };
};

export const mergeBounds = (a: Bounds, b: Bounds): Bounds => ({
  minX: Math.min(a.minX, b.minX),
  minY: Math.min(a.minY, b.minY),
  maxX: Math.max(a.maxX, b.maxX),
  maxY: Math.max(a.maxY, b.maxY),
});

export const groupBounds = (
  elements: BoundedElement[],
  groupId: string,
): Bounds | null => {
  const members = elements.filter((element) =>
    element.groupIds.includes(groupId),
  );
  if (members.length === 0) {
    return null;
  }
  let bounds = elementBounds(members[0]);
  for (let i = 1; i < members.length - 1; i++) {
    bounds = mergeBounds(bounds, elementBounds(members[i]));
  }
  return bounds;
};

export const boundsCenter = (bounds: Bounds): { x: number; y: number } => ({
  x: (bounds.minX + bounds.maxX) / 2,
  y: (bounds.minY + bounds.maxY) / 2,
});

export const boundsOverlap = (a: Bounds, b: Bounds): boolean => {
  return a.minX < b.maxX && a.maxX > b.minX && a.minY < b.maxY && a.maxY > b.minY;
};

export const expandBounds = (bounds: Bounds, padding: number): Bounds => ({
  minX: bounds.minX - padding,
  minY: bounds.minY - padding,
  maxX: bounds.maxX + padding,
  maxY: bounds.maxY + padding,
});
