import type { Worker } from "mediasoup/types";
import createWorkers from "../utilities/createWorkers.js";
import { Logger } from "../utilities/loggers.js";
import type { SfuState } from "./state.js";

export const initMediaSoup = async (state: SfuState): Promise<void> => {
  state.workers = (await createWorkers()) as Worker[];
  Logger.info(`Created ${state.workers.length} mediasoup workers`);
};
