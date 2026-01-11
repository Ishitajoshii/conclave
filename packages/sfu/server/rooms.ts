import type { Worker } from "mediasoup/types";
import { Room } from "../config/classes/Room.js";
import { config } from "../config/config.js";
import getWorker from "../utilities/getWorker.js";
import { Logger } from "../utilities/loggers.js";
import type { SfuState } from "./state.js";

export const getOrCreateRoom = async (
  state: SfuState,
  roomId: string,
): Promise<Room> => {
  let room = state.rooms.get(roomId);
  if (room) {
    return room;
  }

  const worker = await getWorker(state.workers as Worker[]);

  const router = await worker.createRouter({
    mediaCodecs: config.routerMediaCodecs as any,
  });

  room = new Room({ id: roomId, router });
  state.rooms.set(roomId, room);
  Logger.success(`Created room: ${roomId}`);

  return room;
};

export const cleanupRoom = (state: SfuState, roomId: string): void => {
  const room = state.rooms.get(roomId);
  if (room && room.isEmpty()) {
    room.close();
    state.rooms.delete(roomId);
    Logger.info(`Closed empty room: ${roomId}`);
  }
};
