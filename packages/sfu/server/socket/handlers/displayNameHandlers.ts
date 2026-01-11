import { Admin } from "../../../config/classes/Admin.js";
import { MAX_DISPLAY_NAME_LENGTH } from "../../constants.js";
import { normalizeDisplayName } from "../../identity.js";
import type { ConnectionContext } from "../context.js";

export const registerDisplayNameHandlers = (
  context: ConnectionContext,
): void => {
  const { socket, io } = context;

  socket.on(
    "updateDisplayName",
    (
      data: { displayName?: string },
      callback: (
        response:
          | { success: boolean; displayName: string }
          | { error: string },
      ) => void,
    ) => {
      try {
        if (!context.currentClient || !context.currentRoom) {
          callback({ error: "Not in a room" });
          return;
        }

        if (!(context.currentClient instanceof Admin)) {
          callback({ error: "Only admins can update display name" });
          return;
        }

        const displayName = normalizeDisplayName(data.displayName);
        if (!displayName) {
          callback({ error: "Display name cannot be empty" });
          return;
        }

        if (displayName.length > MAX_DISPLAY_NAME_LENGTH) {
          callback({ error: "Display name too long" });
          return;
        }

        if (!context.currentUserKey) {
          callback({ error: "Missing user identity" });
          return;
        }

        const updatedUserIds = context.currentRoom.updateDisplayName(
          context.currentUserKey,
          displayName,
        );

        for (const userId of updatedUserIds) {
          io.to(context.currentRoom.id).emit("displayNameUpdated", {
            userId,
            displayName,
            roomId: context.currentRoom.id,
          });
        }

        callback({ success: true, displayName });
      } catch (error) {
        callback({ error: (error as Error).message });
      }
    },
  );
};
