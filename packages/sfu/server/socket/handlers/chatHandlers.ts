import type { ChatMessage, SendChatData } from "../../../types.js";
import { Logger } from "../../../utilities/loggers.js";
import type { ConnectionContext } from "../context.js";

export const registerChatHandlers = (context: ConnectionContext): void => {
  const { socket } = context;

  socket.on(
    "sendChat",
    (
      data: SendChatData,
      callback: (
        response:
          | { success: boolean; message?: ChatMessage }
          | { error: string },
      ) => void,
    ) => {
      try {
        if (!context.currentClient || !context.currentRoom) {
          callback({ error: "Not in a room" });
          return;
        }
        if (context.currentClient.isGhost) {
          callback({ error: "Ghost mode cannot send chat messages" });
          return;
        }

        const content = data.content?.trim();
        if (!content || content.length === 0) {
          callback({ error: "Message cannot be empty" });
          return;
        }

        if (content.length > 1000) {
          callback({ error: "Message too long (max 1000 characters)" });
          return;
        }

        const displayName =
          context.currentRoom.getDisplayNameForUser(context.currentClient.id) ||
          context.currentClient.id.split("#")[0]?.split("@")[0] ||
          "Anonymous";

        const message: ChatMessage = {
          id: `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
          userId: context.currentClient.id,
          displayName,
          content,
          timestamp: Date.now(),
        };

        socket.to(context.currentRoom.id).emit("chatMessage", message);
        Logger.info(
          `Chat in room ${context.currentRoom.id}: ${displayName}: ${content.substring(
            0,
            50,
          )}`,
        );

        callback({ success: true, message });
      } catch (error) {
        callback({ error: (error as Error).message });
      }
    },
  );
};
