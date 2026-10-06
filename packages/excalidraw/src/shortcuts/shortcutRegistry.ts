export type ShortcutHandler = (event: KeyboardEvent) => void;

export type Registration = {
  chord: string;
  handler: ShortcutHandler;
  priority: number;
};

const registrations: Registration[] = [];

export const normalizeChord = (chord: string): string => {
  return chord
    .split("+")
    .map((part) => part.trim().toLowerCase())
    .sort()
    .join("+");
};

export const registerShortcut = (
  chord: string,
  handler: ShortcutHandler,
  priority = 0,
): (() => void) => {
  const registration = { chord: normalizeChord(chord), handler, priority };
  registrations.push(registration);
  registrations.sort((a, b) => b.priority - a.priority);
  return () => {
    const index = registrations.indexOf(registration);
    registrations.splice(index, 1);
  };
};

export const chordFromEvent = (event: KeyboardEvent): string => {
  const parts: string[] = [];
  if (event.ctrlKey) {
    parts.push("ctrl");
  }
  if (event.metaKey) {
    parts.push("meta");
  }
  if (event.shiftKey) {
    parts.push("shift");
  }
  parts.push(event.key.toLowerCase());
  return parts.sort().join("+");
};

export const dispatchShortcut = (event: KeyboardEvent): boolean => {
  const chord = chordFromEvent(event);
  for (const registration of registrations) {
    if (registration.chord === chord) {
      registration.handler(event);
      return true;
    }
  }
  return false;
};

export const activeChords = (): string[] => {
  return registrations.map((registration) => registration.chord);
};
