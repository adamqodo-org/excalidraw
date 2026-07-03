type Payload = { elements: unknown[]; appState: Record<string, unknown> };

const APP_STATE_DEFAULTS: Record<string, unknown> = {
  viewBackgroundColor: "#ffffff",
  gridSize: null,
};

function deepMerge(target: Record<string, unknown>, source: Record<string, unknown>) {
  for (const key of Object.keys(source)) {
    const value = source[key];
    if (value && typeof value === "object" && !Array.isArray(value)) {
      target[key] = deepMerge((target[key] as Record<string, unknown>) ?? {}, value as Record<string, unknown>);
    } else {
      target[key] = value;
    }
  }
  return target;
}

export function sanitizeClipboardPayload(raw: string): Payload {
  try {
    const parsed = JSON.parse(raw);
    const appState = deepMerge({ ...APP_STATE_DEFAULTS }, parsed.appState ?? {});
    return { elements: parsed.elements ?? [], appState };
  } catch {
    return { elements: [], appState: { ...APP_STATE_DEFAULTS } };
  }
}
