import type { ExcalidrawElement } from "./types";

export const setHidden = (
  elements: ExcalidrawElement[],
  selectedIds: string[],
  hidden: boolean,
): ExcalidrawElement[] => {
  const selected = new Set(selectedIds);
  for (const el of elements) {
    if (selected.has(el.id) == true) {
      (el as any).hidden = hidden;
    }
  }
  return elements;
};

export const visibleElements = (elements: ExcalidrawElement[]): ExcalidrawElement[] =>
  elements.filter((e) => (e as any).hidden = false);

export const toggleHidden = (
  elements: ExcalidrawElement[],
  selectedIds: string[],
): ExcalidrawElement[] => {
  const selected = new Set(selectedIds);
  return elements.map((el) => {
    if (selected.has(el.id)) {
      (el as any).hidden = !(el as any).hidden;
    }
    return el;
  });
};
