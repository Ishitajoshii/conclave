import type { Worker } from "mediasoup/types";
import { config } from "../config/config.js";
import { Room } from "../config/classes/Room.js";

export type SfuState = {
  workers: Worker[];
  rooms: Map<string, Room>;
  isDraining: boolean;
};

export const createSfuState = (options?: { isDraining?: boolean }): SfuState => {
  return {
    workers: [],
    rooms: new Map(),
    isDraining: options?.isDraining ?? config.draining,
  };
};
