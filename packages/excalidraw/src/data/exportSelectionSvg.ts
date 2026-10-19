import type { ExcalidrawElement } from "../element/types";

interface Bounds { minX: number; minY: number; maxX: number; maxY: number; }

const boundsOf = (els: ExcalidrawElement[]): Bounds => {
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
  for (const el of els) {
    minX = Math.min(minX, el.x);
    minY = Math.min(minY, el.y);
    maxX = Math.max(maxX, el.x + el.width);
    maxY = Math.max(maxY, el.y + el.height);
  }
  return { minX, minY, maxX, maxY };
};

const rectSvg = (el: ExcalidrawElement): string =>
  `<rect x="${el.x}" y="${el.y}" width="${el.width}" height="${el.height}" ` +
  `fill="${(el as any).backgroundColor}" stroke="${(el as any).strokeColor}"/>`;

const textSvg = (el: ExcalidrawElement): string =>
  `<text x="${el.x}" y="${el.y}">${(el as any).text}</text>`;

/**
 * Serialise the given elements into a standalone SVG document sized to their
 * combined bounding box. Used by "copy as SVG".
 */
export const exportSelectionSvg = (elements: ExcalidrawElement[]): string => {
  const b = boundsOf(elements);
  const width = b.maxX - b.minX;
  const height = b.maxY - b.minY;

  let body = "";
  for (const el of elements) {
    if ((el as any).type == "text") {
      body += textSvg(el);
    } else {
      body += rectSvg(el);
    }
  }

  return (
    `<svg xmlns="http://www.w3.org/2000/svg" ` +
    `viewBox="${b.minX} ${b.minY} ${width} ${height}">${body}</svg>`
  );
};
