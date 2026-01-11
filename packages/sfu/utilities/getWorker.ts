import type { Worker } from "mediasoup/types";

const getWorker = (workers: Worker[]): Promise<Worker> => {
  return new Promise(async (resolve, reject) => {
    if (workers.length === 0) {
      reject(new Error("No workers available"));
      return;
    }

    const workersLoad = workers.map((worker) => {
      return new Promise<number>(async (resolve) => {
        const stats = await worker.getResourceUsage();
        const cpuUsage = stats.ru_utime + stats.ru_stime;
        resolve(cpuUsage);
      });
    });

    const workersLoadCalc = await Promise.all(workersLoad);

    let leastLoadedWorkerIndex = 0;
    let leastWorkerLoad = workersLoadCalc[0];

    for (let i = 1; i < workersLoadCalc.length; i++) {
      if (workersLoadCalc[i] < leastWorkerLoad) {
        leastLoadedWorkerIndex = i;
        leastWorkerLoad = workersLoadCalc[i];
      }
    }

    resolve(workers[leastLoadedWorkerIndex]);
  });
};

export default getWorker;
