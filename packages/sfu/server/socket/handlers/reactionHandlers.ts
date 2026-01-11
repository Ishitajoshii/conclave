import type { ReactionNotification, SendReactionData } from "../../../types.js";
import { allowedEmojiReactions } from "../../constants.js";
import { isValidReactionAssetPath } from "../../reactions.js";
import type { ConnectionContext } from "../context.js";

export const registerReactionHandlers = (
  context: ConnectionContext,
): void => {
  const { socket } = context;

  socket.on(
    "sendReaction",
    (
      data: SendReactionData,
      callback: (response: { success: boolean } | { error: string }) => void,
    ) => {
      try {
        if (!context.currentClient || !context.currentRoom) {
          callback({ error: "Not in a room" });
          return;
        }
        if (context.currentClient.isGhost) {
          callback({ error: "Ghost mode cannot send reactions" });
          return;
        }

        if (data.kind === "asset" && typeof data.value === "string") {
          if (!isValidReactionAssetPath(data.value)) {
            callback({ error: "Invalid reaction asset" });
            return;
          }

          const reaction: ReactionNotification = {
            userId: context.currentClient.id,
            kind: "asset",
            value: data.value,
            label: data.label,
            timestamp: Date.now(),
          };

          socket.to(context.currentRoom.channelId).emit("reaction", reaction);
          callback({ success: true });
          return;
        }

        const emoji =
          data.kind === "emoji" && typeof data.value === "string"
            ? data.value.trim()
            : data.emoji?.trim();

        if (!emoji || !allowedEmojiReactions.has(emoji)) {
          callback({ error: "Invalid reaction" });
          return;
        }

        const reaction: ReactionNotification = {
          userId: context.currentClient.id,
          kind: "emoji",
          value: emoji,
          label: data.label,
          timestamp: Date.now(),
        };

        socket.to(context.currentRoom.channelId).emit("reaction", reaction);
        callback({ success: true });
      } catch (error) {
        callback({ error: (error as Error).message });
      }
    },
  );
};
