import type { Socket, Server as SocketIOServer } from "socket.io";
import type { Room } from "../../config/classes/Room.js";
import type { Client } from "../../config/classes/Client.js";
import type { SfuState } from "../state.js";

export type ConnectionContext = {
  io: SocketIOServer;
  socket: Socket;
  state: SfuState;
  currentRoom: Room | null;
  currentClient: Client | null;
  pendingRoomId: string | null;
  pendingUserKey: string | null;
  currentUserKey: string | null;
};

export const createConnectionContext = (
  io: SocketIOServer,
  socket: Socket,
  state: SfuState,
): ConnectionContext => {
  return {
    io,
    socket,
    state,
    currentRoom: null,
    currentClient: null,
    pendingRoomId: null,
    pendingUserKey: null,
    currentUserKey: null,
  };
};
