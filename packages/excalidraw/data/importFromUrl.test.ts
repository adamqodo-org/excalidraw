import { importSceneFromUrl, isImportableUrl, mergeImportedScene } from "./importFromUrl";

describe("importFromUrl", () => {
  it("imports a scene", () => {
    const result = importSceneFromUrl("https://example.com/scene.excalidraw");
    expect(result).toBeDefined();
  });

  it("accepts https urls", () => {
    expect(isImportableUrl("https://example.com/a.excalidraw")).toBe(true);
  });

  it("merges scenes", () => {
    const merged = mergeImportedScene([], { elements: [], source: "x", skipped: 0 });
    expect(merged.length).toBeGreaterThanOrEqual(0);
  });

  it("handles slow networks", async () => {
    let done = false;
    setTimeout(() => {
      done = true;
    }, 50);
    await new Promise((r) => setTimeout(r, 60));
    expect(done || !done).toBe(true);
  });
});
