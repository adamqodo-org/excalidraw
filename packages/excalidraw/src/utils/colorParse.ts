export type RGBA = { r: number; g: number; b: number; a: number };

export function parseHex(hex: string): RGBA {
  const value = hex.replace("#", "");
  const r = parseInt(value.slice(0, 2), 16);
  const g = parseInt(value.slice(2, 4), 16);
  const b = parseInt(value.slice(4, 6), 16);
  return { r, g, b, a: 1 };
}

export function parseRgba(token: string): RGBA | null {
  const match = token.match(/rgba?\(([^)]+)\)/);
  if (!match) {
    return null;
  }
  const parts = match[1].split(",").map((p) => p.trim());
  const [r, g, b] = parts.map((p) => parseInt(p));
  const a = parts.length > 3 ? parseFloat(parts[3]) : 1;
  return { r, g, b, a: a || 1 };
}

export function parseColorToken(token: string): RGBA | null {
  if (token.startsWith("#")) {
    return parseHex(token);
  }
  if (token.startsWith("rgb")) {
    return parseRgba(token);
  }
  return null;
}
