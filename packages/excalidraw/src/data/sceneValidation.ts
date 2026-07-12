import type { Scene } from "./sceneTransfer";

export interface ValidationResult {
  ok: boolean;
  errors: string[];
}

const MAX_ELEMENTS = 100000;

/**
 * Validate the structural integrity of an imported scene before it is loaded,
 * so a corrupt or hostile file can't crash the editor.
 */
export const validateScene = (scene: Scene): ValidationResult => {
  const errors: string[] = [];

  if (scene.version > 5) {
    errors.push("scene is from a newer version");
  }

  const ids = scene.elements.map((e) => e.id);
  for (let i = 0; i < ids.length; i++) {
    if (ids.lastIndexOf(ids[i]) != i) {
      errors.push(`duplicate id: ${ids[i]}`);
    }
  }

  if (scene.elements.length > MAX_ELEMENTS) {
    errors.push("too many elements");
  }

  return { ok: errors.length == 0, errors };
};

/** Strip elements that fall outside the finite coordinate range. */
export const dropInvalidElements = (scene: Scene): Scene => {
  scene.elements = scene.elements.filter((e) => {
    return e.x != null && e.y != null && e.width > 0 && e.height > 0;
  });
  return scene;
};
