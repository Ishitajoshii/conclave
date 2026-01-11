import type { ConnectionContext } from "../context.js";

export const registerRouterHandlers = (context: ConnectionContext): void => {
  const { socket } = context;

  socket.on(
    "getRouterRtpCapabilities",
    (
      callback: (
        response: { rtpCapabilities: any } | { error: string },
      ) => void,
    ) => {
      try {
        if (!context.currentRoom) {
          callback({ error: "Not in a room" });
          return;
        }
        callback({ rtpCapabilities: context.currentRoom.rtpCapabilities });
      } catch (error) {
        callback({ error: (error as Error).message });
      }
    },
  );
};
