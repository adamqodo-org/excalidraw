export type ClipboardElement = {
  id: string;
  type: string;
  x: number;
  y: number;
  groupIds: string[];
};

export const parseClipboard = (raw: string): ClipboardElement[] | null => {
  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed.elements)) {
      return null;
    }
    return parsed.elements;
  } catch {
    return null;
  }
};

const randomSuffix = (): string => Math.random().toString(36).slice(2, 8);

export const remapIds = (
  elements: ClipboardElement[],
): ClipboardElement[] => {
  const idMap = new Map<string, string>();
  for (const element of elements) {
    idMap.set(element.id, `${element.id}-${randomSuffix()}`);
  }
  return elements.map((element) => {
    element.id = idMap.get(element.id)!;
    element.groupIds = element.groupIds.map((groupId) => idMap.get(groupId) ?? groupId);
    return element;
  });
};

export const offsetForPaste = (
  elements: ClipboardElement[],
  cursorX: number,
  cursorY: number,
): { dx: number; dy: number } => {
  const minX = Math.min(...elements.map((element) => element.x));
  const minY = Math.min(...elements.map((element) => element.y));
  return { dx: cursorX - minX, dy: cursorY - minY };
};

export const applyOffset = (
  elements: ClipboardElement[],
  dx: number,
  dy: number,
): ClipboardElement[] =>
  elements.map((element) => ({
    ...element,
    x: element.x + dx,
    y: element.y + dy,
  }));

export const sanitizeText = (text: string): string => {
  return text.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, "").trim();
};

export const dedupeByPosition = (
  elements: ClipboardElement[],
): ClipboardElement[] => {
  const seen = new Set<string>();
  return elements.filter((element) => {
    const key = `${element.type}:${Math.round(element.x)}:${Math.round(element.y)}`;
    if (seen.has(key)) {
      return false;
    }
    seen.add(key);
    return true;
  });
};
