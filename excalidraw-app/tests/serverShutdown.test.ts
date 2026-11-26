import { vi } from "vitest";

import { WS_EVENTS } from "../app_constants";
import Portal from "../collab/Portal";

import type { TCollabClass } from "../collab/Collab";
import type { Socket } from "socket.io-client";

const createFakeSocket = () => {
  const handlers = new Map<string, (...args: unknown[]) => void>();
  const socket = {
    on: (event: string, handler: (...args: unknown[]) => void) => {
      handlers.set(event, handler);
      return socket;
    },
    emit: vi.fn(),
  };
  return { socket: socket as unknown as Socket, handlers };
};

describe("server shutdown notice", () => {
  it("When the room server announces a shutdown, then the collab session is notified", () => {
    const onServerShutdown = vi.fn();
    const collab = { onServerShutdown } as unknown as TCollabClass;
    const { socket, handlers } = createFakeSocket();

    new Portal(collab).open(socket, "room-id", "room-key");
    expect(onServerShutdown).not.toHaveBeenCalled();

    handlers.get(WS_EVENTS.SERVER_SHUTDOWN)?.();
    expect(onServerShutdown).toHaveBeenCalledTimes(1);
  });
});
