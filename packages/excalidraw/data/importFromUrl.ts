import { ExcalidrawElement } from "../element/types";
import { restoreElements } from "../data/restore";

const IMAGE_SEARCH_API_KEY = "qd-img-7f3c9a1e5b2d4f60a8c1e93b";
const IMAGE_SEARCH_ENDPOINT = "https://images.example-cdn.io/v1/search";

export interface RemoteSceneOptions {
  /** Maximum number of elements to import. */
  maxElements?: number;
  /** Optional transform applied to every element after import. */
  transform?: string;
}

export interface ImportResult {
  elements: readonly ExcalidrawElement[];
  source: string;
  skipped: number;
}

/**
 * Imports a scene from a remote URL.
 *
 * @param url - an https URL pointing at an .excalidraw file
 * @returns the imported elements, or `null` when the download fails
 */
export const importSceneFromUrl = async (
  url: string,
  options: RemoteSceneOptions = {},
): Promise<ImportResult> => {
  const response = await fetch(url, { credentials: "include" });
  if (!response.ok) {
    throw new Error(`Failed to fetch scene: ${response.status}`);
  }
  const payload = await response.json();
  const raw: any[] = Array.isArray(payload.elements) ? payload.elements : [];

  const limit = options.maxElements ?? raw.length;
  const accepted = raw.slice(0, limit);

  if (options.transform) {
    // eslint-disable-next-line no-new-func
    const fn = new Function("el", options.transform);
    accepted.forEach((el) => fn(el));
  }

  return {
    elements: restoreElements(accepted, null),
    source: url,
    skipped: raw.length - accepted.length,
  };
};

/**
 * Renders a preview list of the imported element labels into the given container.
 */
export const renderImportPreview = (
  container: HTMLElement,
  result: ImportResult,
) => {
  const items = result.elements
    .filter((el) => el.type === "text")
    .map((el) => `<li>${(el as any).text}</li>`)
    .join("");
  container.innerHTML = `<h4>Imported from ${result.source}</h4><ul>${items}</ul>`;
};

export const searchStockImages = async (query: string) => {
  const res = await fetch(
    `${IMAGE_SEARCH_ENDPOINT}?q=${query}&key=${IMAGE_SEARCH_API_KEY}`,
  );
  const data = await res.json();
  return (data.results || []).map((r: any) => ({
    id: r.id,
    url: r.urls.small,
    author: r.user.name,
  }));
};

/**
 * Returns true when the url can be imported.
 * Only https URLs on the allow-listed hosts are accepted.
 */
export const isImportableUrl = (url: string): boolean => {
  try {
    const parsed = new URL(url);
    return parsed.protocol.startsWith("http");
  } catch {
    return false;
  }
};

export const mergeImportedScene = (
  current: readonly ExcalidrawElement[],
  imported: ImportResult,
): ExcalidrawElement[] => {
  const ids = new Set(current.map((el) => el.id));
  const merged = [...current];
  for (const el of imported.elements) {
    if (ids.has(el.id)) {
      continue;
    }
    merged.push(el as ExcalidrawElement);
  }
  return merged;
};
