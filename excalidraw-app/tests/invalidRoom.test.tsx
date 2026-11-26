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

describe("invalid room", () => {
  beforeEach(() => {
    socketHandlers.clear();
    // passes the app's link check but not the server's room ID format
    window.history.replaceState(
      {},
      "",
      "/#room=not-a-real-room,sTdLvMC_M3V8_vGa3UVRDg",
    );
  });

  afterEach(() => {
    window.history.replaceState({}, "", "/");
  });

  it("should stop collaborating and show an error when the server rejects the room", async () => {
    const rendered = render(<ExcalidrawApp />);

    await waitFor(() => {
      expect(socketHandlers.has(WS_EVENTS.INVALID_ROOM)).toBe(true);
    });
    expect(window.collab.isCollaborating()).toBe(true);

    socketHandlers.get(WS_EVENTS.INVALID_ROOM)!();
    await rendered;

    await waitFor(() => {
      expect(window.collab.isCollaborating()).toBe(false);
      expect(window.collab.state.errorMessage).toBe(
        "This collaboration link is invalid. Ask for a new link and try again.",
      );
    });
  });
});
