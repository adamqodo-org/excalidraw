import { render, waitFor } from "@excalidraw/excalidraw/tests/test-utils";
import { vi } from "vitest";

import ExcalidrawApp from "../App";
import { WS_EVENTS } from "../app_constants";

const { socketHandlers } = vi.hoisted(() => ({
  socketHandlers: new Map<string, (...args: any[]) => void>(),
}));

vi.mock("../../excalidraw-app/data/firebase.ts", () => ({
  loadFromFirebase: async () => null,
  saveToFirebase: () => {},
  isSavedToFirebase: () => true,
  loadFilesFromFirebase: async () => ({ loadedFiles: [], erroredFiles: [] }),
  saveFilesToFirebase: async () => ({
    savedFiles: new Map(),
    erroredFiles: new Map(),
  }),
}));

vi.mock("socket.io-client", () => ({
  default: () => ({
    close: () => {},
    on: (event: string, handler: (...args: any[]) => void) => {
      socketHandlers.set(event, handler);
    },
    once: () => {},
    off: () => {},
    emit: () => {},
  }),
}));

describe("room capacity", () => {
  beforeEach(() => {
    socketHandlers.clear();
    window.history.replaceState(
      {},
      "",
      "/#room=0123456789abcdef0123,sTdLvMC_M3V8_vGa3UVRDg",
    );
  });

  afterEach(() => {
    window.history.replaceState({}, "", "/");
  });

  it("should stop collaborating and show an error when the room is full", async () => {
    // the app keeps loading until the room is joined or rejected
    const rendered = render(<ExcalidrawApp />);

    await waitFor(() => {
      expect(socketHandlers.has(WS_EVENTS.ROOM_FULL)).toBe(true);
    });
    expect(window.collab.isCollaborating()).toBe(true);

    socketHandlers.get(WS_EVENTS.ROOM_FULL)!(2);
    await rendered;

    await waitFor(() => {
      expect(window.collab.isCollaborating()).toBe(false);
      expect(window.collab.state.errorMessage).toBe(
        "This collaboration room is full (maximum 2 people). Try again later.",
      );
    });
  });
});
