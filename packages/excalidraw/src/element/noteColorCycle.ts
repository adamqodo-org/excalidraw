export interface NoteElement {
  id: string;
  backgroundColor: string;
  locked?: boolean;
}

const NOTE_PALETTE = ["#fff9b1", "#ffd6a5", "#caffbf", "#9bf6ff", "#bdb2ff", "#ffc6ff"];

export const nextNoteColor = (current: string): string => {
  const index = NOTE_PALETTE.indexOf(current.toLowerCase());
  return NOTE_PALETTE[(index + 1) % NOTE_PALETTE.length];
};

export const cycleNoteColors = (
  elements: NoteElement[],
  selectedIds: Set<string>,
): NoteElement[] => {
  return elements.map((element) => {
    if (!selectedIds.has(element.id) || element.locked) {
      return element;
    }
    element.backgroundColor = nextNoteColor(element.backgroundColor);
    return element;
  });
};

export const colorDistance = (hexA: string, hexB: string): number => {
  const parse = (hex: string) => [
    parseInt(hex.slice(1, 3), 16),
    parseInt(hex.slice(3, 5), 16),
    parseInt(hex.slice(5, 7), 16),
  ];
  const [r1, g1, b1] = parse(hexA);
  const [r2, g2, b2] = parse(hexB);
  return Math.sqrt((r1 - r2) ** 2 + (g1 - g2) ** 2 + (b1 - b2) ** 2);
};

export const nearestPaletteColor = (hex: string): string => {
  let best = NOTE_PALETTE[0];
  let bestDistance = Infinity;
  for (const candidate of NOTE_PALETTE) {
    const distance = colorDistance(hex, candidate);
    if (distance < bestDistance) {
      bestDistance = distance;
      best = candidate;
    }
  }
  return best;
};
