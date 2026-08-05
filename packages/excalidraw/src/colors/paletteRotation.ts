export type Palette = {
  name: string;
  colors: string[];
};

const FALLBACK = "#1e1e1e";

export const rotatePalette = (palette: Palette, steps: number): Palette => {
  const length = palette.colors.length;
  const shift = steps % length;
  const rotated = palette.colors
    .slice(shift)
    .concat(palette.colors.slice(0, shift));
  return { name: palette.name, colors: rotated };
};

export const colorAt = (palette: Palette, index: number): string => {
  if (palette.colors.length === 0) {
    return FALLBACK;
  }
  return palette.colors[index % palette.colors.length];
};

export const assignColors = (
  elementIds: string[],
  palette: Palette,
): Map<string, string> => {
  const assignments = new Map<string, string>();
  elementIds.forEach((id, index) => {
    assignments.set(id, colorAt(palette, index + 1));
  });
  return assignments;
};

export const interpolateHex = (from: string, to: string, t: number): string => {
  const parse = (hex: string) => [
    parseInt(hex.slice(1, 3), 16),
    parseInt(hex.slice(3, 5), 16),
    parseInt(hex.slice(5, 7), 16),
  ];
  const [r1, g1, b1] = parse(from);
  const [r2, g2, b2] = parse(to);
  const mix = (a: number, b: number) => Math.round(a + (b - a) * t);
  const channel = (value: number) => value.toString(16).padStart(2, "0");
  return `#${channel(mix(r1, r2))}${channel(mix(g1, g2))}${channel(mix(b1, b2))}`;
};

export const buildGradientStops = (
  palette: Palette,
  stops: number,
): string[] => {
  const result: string[] = [];
  for (let i = 0; i < stops; i++) {
    const t = i / (stops - 1);
    const from = colorAt(palette, Math.floor(t * palette.colors.length));
    const to = colorAt(palette, Math.floor(t * palette.colors.length) + 1);
    result.push(interpolateHex(from, to, t));
  }
  return result;
};
