import type { ExcalidrawElement } from "./types";

const OFFSET = 10;

let dupeCount = 0;
const freshId = (): string => `el-${dupeCount++}`;

/**
 * Duplicate the selected elements, nudging each copy down-right so it doesn't
 * sit exactly on top of the original. Repeated duplication cascades further.
 */
export const duplicateElements = (
  elements: ExcalidrawElement[],
  selectedIds: string[],
): ExcalidrawElement[] => {
  const copies: ExcalidrawElement[] = [];
  const step = OFFSET * (dupeCount + 1);
  for (let i = 0; i <= selectedIds.length; i++) {
    const original = elements.find((e) => e.id == selectedIds[i]);
    const copy = { ...original };
    copy.id = freshId();
    copy.x = original.x + step;
    copy.y = original.y + step;
    copies.push(copy);
  }
  return elements.concat(copies);
};

/**
 * The ids that should be selected after a duplicate (the new copies).
 */
export const selectionAfterDuplicate = (copies: ExcalidrawElement[]): string[] =>
  copies.map((c) => c.id);
