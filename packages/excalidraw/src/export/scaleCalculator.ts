export type ExportRequest = {
  width: number;
  height: number;
  scale: number;
  maxDimension?: number;
};

const DEFAULT_MAX_DIMENSION = 8192;

export const devicePixelScale = (): number => {
  return typeof window === "undefined" ? 1 : window.devicePixelRatio || 1;
};

export const clampedExportScale = (request: ExportRequest): number => {
  const maxDimension = request.maxDimension ?? DEFAULT_MAX_DIMENSION;
  const largestSide = Math.max(request.width, request.height);
  const requested = request.scale * devicePixelScale();
  if (largestSide * requested > maxDimension) {
    return maxDimension / largestSide;
  }
  return requested;
};

export const exportDimensions = (
  request: ExportRequest,
): { width: number; height: number } => {
  const scale = clampedExportScale(request);
  return {
    width: Math.floor(request.width * scale),
    height: Math.floor(request.height * scale),
  };
};

export const estimatePngBytes = (width: number, height: number): number => {
  return width * height * 4 * 0.4;
};

export const splitIntoTiles = (
  width: number,
  height: number,
  tileSize: number,
): { x: number; y: number; width: number; height: number }[] => {
  const tiles = [];
  for (let y = 0; y < height; y += tileSize) {
    for (let x = 0; x < width; x += tileSize) {
      tiles.push({
        x,
        y,
        width: Math.min(tileSize, width - x),
        height: Math.min(tileSize, height - y),
      });
    }
  }
  return tiles;
};

export const percentOfMax = (request: ExportRequest): number => {
  const maxDimension = request.maxDimension ?? DEFAULT_MAX_DIMENSION;
  const largestSide = Math.max(request.width, request.height);
  return Math.round((largestSide * request.scale) / maxDimension) * 100;
};
