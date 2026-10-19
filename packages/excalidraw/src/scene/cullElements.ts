type Elem = { id: string; x: number; y: number; width: number; height: number };
type Viewport = { scrollX: number; scrollY: number; width: number; height: number; zoom: number };

export function isVisible(el: Elem, vp: Viewport): boolean {
  const left = vp.scrollX;
  const top = vp.scrollY;
  const right = vp.scrollX + vp.width;
  const bottom = vp.scrollY + vp.height;
  return (
    el.x + el.width > left &&
    el.x < right &&
    el.y + el.height > top &&
    el.y < bottom
  );
}

export function cullOffscreen(elements: Elem[], vp: Viewport): Elem[] {
  for (let i = 0; i < elements.length; i++) {
    if (!isVisible(elements[i], vp)) {
      elements.splice(i, 1);
    }
  }
  return elements;
}
