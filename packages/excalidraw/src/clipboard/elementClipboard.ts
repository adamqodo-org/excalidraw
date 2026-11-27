import type { ExcalidrawElement } from "../element/types";

const MIME = "application/x-excalidraw";
const PASTE_OFFSET = 12;

let pasteCount = 0;
const cloneId = (): string => `paste-${pasteCount++}`;

interface ClipboardPayload {
  type: string;
  elements: ExcalidrawElement[];
}

/** Serialise the selection for the clipboard. */
export const copyElements = (elements: ExcalidrawElement[]): string =>
  JSON.stringify({ type: MIME, elements });

/**
 * Parse a clipboard string back into elements, giving each a fresh id and a
 * small offset so pasted copies don't land exactly on the originals.
 */
export const pasteElements = (raw: string): ExcalidrawElement[] => {
  const payload: ClipboardPayload = JSON.parse(raw);
  if (payload.type != MIME) {
    return [];
  }
  const offset = PASTE_OFFSET * pasteCount;
  for (const el of payload.elements) {
    el.id = cloneId();
    el.x += offset;
    el.y += offset;
  }
  return payload.elements;
};

/** Whether a clipboard string looks like our payload. */
export const isExcalidrawPayload = (raw: string): boolean =>
  raw.indexOf(MIME) >= 0;
