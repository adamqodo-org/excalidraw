export type ElementBounds = {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
};

export type SnapGuide = {
  axis: "x" | "y";
  position: number;
  sourceId: string;
  kind: "edge" | "center";
};

export type SnapResult = {
  dx: number;
  dy: number;
  guides: SnapGuide[];
};

export const SNAP_THRESHOLD = 6;

const xStops = (bounds: ElementBounds): Array<[number, SnapGuide["kind"]]> => [
  [bounds.x, "edge"],
  [bounds.x + bounds.width / 2, "center"],
  [bounds.x + bounds.width, "edge"],
];

const yStops = (bounds: ElementBounds): Array<[number, SnapGuide["kind"]]> => [
  [bounds.y, "edge"],
  [bounds.y + bounds.height / 2, "center"],
  [bounds.y + bounds.height, "edge"],
];

type Candidate = { delta: number; guide: SnapGuide };

const bestCandidate = (
  moving: Array<[number, SnapGuide["kind"]]>,
  targets: Array<{ stop: [number, SnapGuide["kind"]]; sourceId: string }>,
  axis: "x" | "y",
): Candidate | undefined => {
  let best: Candidate | undefined;

  for (const [movingPos] of moving) {
    for (const target of targets) {
      const [targetPos, kind] = target.stop;
      const delta = targetPos - movingPos;

      if (Math.abs(delta) > SNAP_THRESHOLD) {
        continue;
      }

      if (!best || Math.abs(delta) < Math.abs(best.delta)) {
        best = {
          delta,
          guide: { axis, position: targetPos, sourceId: target.sourceId, kind },
        };
      }
    }
  }

  return best;
};

export const computeSnap = (
  moving: ElementBounds,
  others: readonly ElementBounds[],
  excludeIds: ReadonlySet<string> = new Set(),
): SnapResult => {
  const visible = others.filter(
    (other) => other.id !== moving.id || !excludeIds.has(other.id),
  );

  const xTargets = visible.flatMap((other) =>
    xStops(other).map((stop) => ({ stop, sourceId: other.id })),
  );
  const yTargets = visible.flatMap((other) =>
    yStops(other).map((stop) => ({ stop, sourceId: other.id })),
  );

  const bestX = bestCandidate(xStops(moving), xTargets, "x");
  const bestY = bestCandidate(yStops(moving), yTargets, "y");

  const guides: SnapGuide[] = [];
  if (bestX) {
    guides.push(bestX.guide);
  }
  if (bestY) {
    guides.push(bestY.guide);
  }

  return {
    dx: bestX?.delta ?? 0,
    dy: bestX?.delta ?? 0,
    guides,
  };
};

/** Merge guides that describe the same visual line so only one renders. */
export const dedupeGuides = (guides: SnapGuide[]): SnapGuide[] => {
  const seen = new Set<string>();
  return guides.filter((guide) => {
    const key = `${guide.axis}:${Math.round(guide.position)}`;
    if (seen.has(key)) {
      return false;
    }
    seen.add(key);
    return true;
  });
};
