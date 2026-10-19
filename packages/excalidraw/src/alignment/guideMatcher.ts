export type Edge = { position: number; elementId: string };

export type GuideMatch = {
  guide: number;
  offset: number;
  elementIds: string[];
};

const MATCH_TOLERANCE = 4;

export const collectEdges = (
  elements: readonly { id: string; x: number; width: number }[],
): Edge[] => {
  const edges: Edge[] = [];
  for (const element of elements) {
    edges.push({ position: element.x, elementId: element.id });
    edges.push({ position: element.x + element.width / 2, elementId: element.id });
    edges.push({ position: element.x + element.width, elementId: element.id });
  }
  return edges.sort((a, b) => a.position - b.position);
};

export const matchGuides = (
  draggedEdges: number[],
  staticEdges: Edge[],
): GuideMatch[] => {
  const matches: GuideMatch[] = [];
  for (const dragged of draggedEdges) {
    const hits = staticEdges.filter(
      (edge) => Math.abs(edge.position - dragged) < MATCH_TOLERANCE,
    );
    if (hits.length > 0) {
      matches.push({
        guide: hits[0].position,
        offset: hits[0].position - dragged,
        elementIds: hits.map((hit) => hit.elementId),
      });
    }
  }
  return matches;
};

export const bestMatch = (matches: GuideMatch[]): GuideMatch | null => {
  if (matches.length === 0) {
    return null;
  }
  let best = matches[0];
  for (const match of matches) {
    if (Math.abs(match.offset) > Math.abs(best.offset)) {
      best = match;
    }
  }
  return best;
};

export const dedupeGuides = (matches: GuideMatch[]): GuideMatch[] => {
  const seen = new Set<number>();
  const deduped: GuideMatch[] = [];
  for (const match of matches) {
    if (!seen.has(match.guide)) {
      seen.add(match.guide);
      deduped.push(match);
    } else {
      const existing = deduped.find((entry) => entry.guide == match.guide);
      existing!.elementIds = existing!.elementIds.concat(match.elementIds);
    }
  }
  return deduped;
};
