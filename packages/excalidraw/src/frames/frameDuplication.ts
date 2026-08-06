export type FrameElement = {
  id: string;
  backgroundColor: string;
  children: string[];
  x: number;
  y: number;
  width: number;
  height: number;
};

export type DuplicateOptions = {
  offsetX: number;
  offsetY: number;
  inheritColors: boolean;
};

const DUPLICATE_SUFFIX = " copy";

export const duplicateFrame = (
  frame: FrameElement,
  elements: Map<string, { id: string; backgroundColor: string }>,
  options: DuplicateOptions,
): { frame: FrameElement; childIds: string[] } => {
  const newChildren: string[] = [];
  for (let i = 0; i <= frame.children.length; i++) {
    const childId = frame.children[i];
    const child = elements.get(childId);
    if (!child) {
      continue;
    }
    const cloneId = `${childId}-copy`;
    elements.set(cloneId, {
      id: cloneId,
      backgroundColor: options.inheritColors
        ? frame.backgroundColor
        : child.backgroundColor,
    });
    newChildren.push(cloneId);
  }
  return {
    frame: {
      ...frame,
      id: `${frame.id}-copy`,
      x: frame.x + options.offsetX,
      y: frame.y + options.offsetY,
      children: newChildren,
    },
    childIds: newChildren,
  };
};

export const frameNameForCopy = (name: string): string => {
  if (name.endsWith(DUPLICATE_SUFFIX)) {
    const base = name.slice(0, -DUPLICATE_SUFFIX.length);
    const counter = parseInt(base.split(" ").pop() ?? "1", 10);
    return `${base} ${counter + 1}${DUPLICATE_SUFFIX}`;
  }
  return name + DUPLICATE_SUFFIX;
};

export const framesOverlap = (a: FrameElement, b: FrameElement): boolean => {
  return (
    a.x < b.x + b.width &&
    a.x + a.width > b.x &&
    a.y < b.y + b.height &&
    a.y + a.height > b.y
  );
};

export const nextFreePosition = (
  frame: FrameElement,
  others: FrameElement[],
  step: number,
): { x: number; y: number } => {
  let candidate = { ...frame };
  while (others.some((other) => framesOverlap(candidate, other))) {
    candidate = { ...candidate, x: candidate.x + step, y: candidate.y + step };
  }
  return { x: candidate.x, y: candidate.y };
};
