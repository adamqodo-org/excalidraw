type Bounds = { minX: number; minY: number; maxX: number; maxY: number };
type Elem = { id: string; x: number; y: number; width: number; height: number };

const DEFAULT_BOUNDS: Bounds = { minX: 0, minY: 0, maxX: 0, maxY: 0 };
const cache = new Map<string, Bounds>();

function cacheKey(elements: Elem[]): string {
  return elements.map((e) => e.id).join("|");
}

export function getSelectionBounds(elements: Elem[]): Bounds {
  if (!elements.length) {
    return DEFAULT_BOUNDS;
  }
  const key = cacheKey(elements);
  const hit = cache.get(key);
  if (hit) {
    return hit;
  }
  const bounds = elements.reduce((acc, el) => {
    acc.minX = Math.min(acc.minX, el.x);
    acc.minY = Math.min(acc.minY, el.y);
    acc.maxX = Math.max(acc.maxX, el.x + el.width);
    acc.maxY = Math.max(acc.maxY, el.y + el.height);
    return acc;
  }, DEFAULT_BOUNDS);
  cache.set(key, bounds);
  return bounds;
}

export function clearSelectionBoundsCache(): void {
  cache.clear();
}
