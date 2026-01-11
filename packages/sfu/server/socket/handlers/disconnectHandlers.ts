import { Admin } from "../../../config/classes/Admin.js";
import { Logger } from "../../../utilities/loggers.js";
import { cleanupRoom } from "../../rooms.js";
import { emitUserLeft } from "../../notifications.js";
import type { ConnectionContext } from "../context.js";

export const registerDisconnectHandlers = (
  context: ConnectionContext,
): void => {
  const { socket, state } = context;

  socket.on("disconnect", () => {
    Logger.info(`Client disconnected: ${socket.id}`);

    if (context.currentRoom && context.currentClient) {
      const userId = context.currentClient.id;
      const roomId = context.currentRoom.id;
      const wasAdmin = context.currentClient instanceof Admin;
      const activeClient = context.currentRoom.getClient(userId);

      if (!activeClient) {
        Logger.info(
          `Stale disconnect for ${userId} in room ${roomId}; client already removed.`,
        );
      } else if (activeClient !== context.currentClient) {
        Logger.info(
          `Stale disconnect for ${userId} in room ${roomId}; active session exists.`,
        );
      } else {
        context.currentRoom.removeClient(userId);
        if (context.currentClient.isGhost) {
          emitUserLeft(context.currentRoom, userId, {
            ghostOnly: true,
            excludeUserId: userId,
          });
        } else {
          socket.to(roomId).emit("userLeft", { userId });
        }

        if (wasAdmin) {
          if (!context.currentRoom.hasActiveAdmin()) {
            Logger.info(
              `Last admin left room ${roomId}. Room remains open without an admin.`,
            );
            if (context.currentRoom.pendingClients.size > 0) {
              Logger.info(
                `Room ${roomId} has pending users but no admins. Notifying waiting clients.`,
              );
              for (const pending of context.currentRoom.pendingClients.values()) {
                pending.socket.emit("waitingRoomStatus", {
                  message: "No one to let you in.",
                  roomId,
                });
              }
            }
            context.currentRoom.startCleanupTimer(() => {
              if (state.rooms.has(roomId)) {
                const room = state.rooms.get(roomId);
                if (room) {
                  if (room.hasActiveAdmin()) {
                    return;
                  }
                  if (room.pendingClients.size > 0) {
                    for (const pending of room.pendingClients.values()) {
                      pending.socket.emit("waitingRoomStatus", {
                        message: "No one to let you in.",
                        roomId,
                      });
                    }
                  }
                  if (room.isEmpty()) {
                    Logger.info(
                      `Cleanup executed for room ${roomId}. Room is empty.`,
                    );
                    cleanupRoom(state, roomId);
                  }
                }
              }
            });
          } else {
            Logger.info(`Admin left room ${roomId}, but other admins remain.`);
          }
        }

        if (state.rooms.has(roomId)) {
          cleanupRoom(state, roomId);
        }

        Logger.info(`User ${userId} left room ${roomId}`);

        if (state.rooms.has(roomId)) {
          const room = state.rooms.get(roomId);
          if (room) {
            const newQuality = room.updateVideoQuality();
            if (newQuality) {
              socket.to(roomId).emit("setVideoQuality", { quality: newQuality });
            }
          }
        }
      }
    }

    if (!context.currentClient && context.pendingRoomId && context.pendingUserKey) {
      const pendingRoom = state.rooms.get(context.pendingRoomId);
      if (pendingRoom) {
        const pending = pendingRoom.pendingClients.get(context.pendingUserKey);
        if (pending?.socket?.id === socket.id) {
          pendingRoom.removePendingClient(context.pendingUserKey);
          for (const admin of pendingRoom.getAdmins()) {
            admin.socket.emit("pendingUserLeft", {
              userId: context.pendingUserKey,
              roomId: context.pendingRoomId,
            });
          }
          if (pendingRoom.isEmpty()) {
            cleanupRoom(state, context.pendingRoomId);
          }
        }
      }
    }

    context.currentRoom = null;
    context.currentClient = null;
    context.pendingRoomId = null;
    context.pendingUserKey = null;
    context.currentUserKey = null;
  });
};
