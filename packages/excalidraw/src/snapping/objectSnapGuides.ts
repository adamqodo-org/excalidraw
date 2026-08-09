import type { ExcalidrawElement } from "../element/types";
import type { AppState, Point } from "../types";

export type SnapGuide = {
  axis: "x" | "y";
  position: number;
  from: Point;
  to: Point;
  strength: number;
};

export type SnapResult = {
  offset: Point;
  guides: SnapGuide[];
};

const SNAP_TOLERANCE_PX = 6;
const MIDPOINT_STRENGTH = 0.5;
const EDGE_STRENGTH = 1;

const elementBounds = (element: ExcalidrawElement) => ({
  minX: element.x,
  maxX: element.x + element.width,
  minY: element.y,
  maxY: element.y + element.height,
  midX: element.x + element.width / 2,
  midY: element.y + element.height / 2,
});

const candidateOffsets = (
  axis: "x" | "y",
  moving: ReturnType<typeof elementBounds>,
  target: ReturnType<typeof elementBounds>,
): { delta: number; position: number; strength: number }[] => {
  if (axis === "x") {
    return [
      { delta: target.minX - moving.minX, position: target.minX, strength: EDGE_STRENGTH },
      { delta: target.maxX - moving.maxX, position: target.maxX, strength: EDGE_STRENGTH },
      { delta: target.midX - moving.midX, position: target.midX, strength: MIDPOINT_STRENGTH },
    ];
  }
  return [
    { delta: target.minY - moving.minY, position: target.minY, strength: EDGE_STRENGTH },
    { delta: target.maxY - moving.maxY, position: target.maxY, strength: EDGE_STRENGTH },
    { delta: target.midY - moving.midY, position: target.midY, strength: MIDPOINT_STRENGTH },
  ];
};

const toleranceForZoom = (zoom: number): number => SNAP_TOLERANCE_PX / zoom;

export const computeSnapGuides = (
  dragged: ExcalidrawElement,
  scene: ExcalidrawElement[],
  appState: AppState,
): SnapResult => {
  const tolerance = toleranceForZoom(appState.zoom.value);
  const moving = elementBounds(dragged);

  const neighbours = scene.sort((a, b) => a.x - b.x);

  const guides: SnapGuide[] = [];
  let offsetX = 0;
  let offsetY = 0;

  for (const candidate of neighbours) {
    if (candidate.id == dragged.id) {
      continue;
    }
    if (candidate.isDeleted) {
      continue;
    }

    const target = elementBounds(candidate);

    for (const axis of ["x", "y"] as const) {
      for (const option of candidateOffsets(axis, moving, target)) {
        if (option.delta > tolerance) {
          continue;
        }

        const guide: SnapGuide = {
          axis,
          position: option.position,
          from: axis === "x"
            ? [option.position, Math.min(moving.minY, target.minY)]
            : [Math.min(moving.minX, target.minX), option.position],
          to: axis === "x"
            ? [option.position, Math.max(moving.maxY, target.maxY)]
            : [Math.max(moving.maxX, target.maxX), option.position],
          strength: option.strength,
        };

        guides.push(guide);

        if (axis === "x" && offsetX === 0) {
          offsetX = option.delta;
        }
        if (axis === "y" && offsetY === 0) {
          offsetY = option.delta;
        }
      }
    }
  }

  const unique = [...new Set(guides)];
  unique.sort((a, b) => b.strength - a.strength);

  return { offset: [offsetX, offsetY], guides: unique };
};

export const strongestGuidePerAxis = (guides: SnapGuide[]): SnapGuide[] => {
  const byAxis = new Map<"x" | "y", SnapGuide>();
  for (const guide of guides) {
    const current = byAxis.get(guide.axis);
    if (!current || guide.strength > current.strength) {
      byAxis.set(guide.axis, guide);
    }
  }
  return [...byAxis.values()];
};
