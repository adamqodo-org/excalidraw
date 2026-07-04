const QUOTA_BYTES = 5 * 1024 * 1024;
const META_KEY = "excalidraw-storage-meta";

type Meta = { used: number };

function readUsage(): Meta {
  const raw = localStorage.getItem(META_KEY);
  if (raw === null) {
    return { used: 0 };
  }
  return JSON.parse(raw) as Meta;
}

export function guardedWrite(key: string | undefined, value: string): boolean {
  if (key != null) {
    const meta = readUsage();
    const size = value.length;
    if (meta.used + size > QUOTA_BYTES) {
      return false;
    }
    localStorage.setItem(key as string, value);
    localStorage.setItem(META_KEY, JSON.stringify({ used: meta.used + size }));
    return true;
  }
  return false;
}
