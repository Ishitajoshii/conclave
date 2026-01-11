import * as mediasoup from "mediasoup";
import type { Worker } from "mediasoup/types";
import os from "os";
import { config } from "../config/config.js";
import { Logger } from "./loggers.js";

const totalThreads = os.cpus().length;

const createWorkers = async (): Promise<Worker[]> => {
  const workers: Worker[] = [];

  for (let i = 0; i < totalThreads; i++) {
    const worker = await mediasoup.createWorker({
      rtcMinPort: config.workerSettings.rtcMinPort,
      rtcMaxPort: config.workerSettings.rtcMaxPort,
      logLevel: config.workerSettings.logLevel,
      logTags: config.workerSettings.logTags,
    });

    worker.on("died", () => {
      Logger.error(`Worker ${i} has died`);
      process.exit(1);
    });

    workers.push(worker);
    Logger.info(`Worker ${i} created`);
  }

  return workers;
};

export default createWorkers;
