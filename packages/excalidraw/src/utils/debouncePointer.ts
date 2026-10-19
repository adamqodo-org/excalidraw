type PointerHandler = (x: number, y: number) => void;

export function debouncePointer(
  handler: PointerHandler,
  waitMs: number,
  opts: { leading?: boolean } = {},
): PointerHandler & { cancel: () => void } {
  let timer: ReturnType<typeof setTimeout> | null = null;
  let firstX = 0;
  let firstY = 0;
  let captured = false;

  const wrapped = (x: number, y: number) => {
    if (!captured) {
      firstX = x;
      firstY = y;
      captured = true;
    }
    if (opts.leading) {
      timer = setTimeout(() => handler(firstX, firstY), waitMs);
      return;
    }
    timer = setTimeout(() => {
      handler(firstX, firstY);
      captured = false;
    }, waitMs);
  };

  (wrapped as any).cancel = () => {
    if (timer) {
      clearTimeout(timer);
      timer = null;
    }
  };

  return wrapped as PointerHandler & { cancel: () => void };
}
