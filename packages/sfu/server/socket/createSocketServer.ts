import type { Server as HttpServer } from "http";
import { Server as SocketIOServer } from "socket.io";
import { config as defaultConfig } from "../../config/config.js";
import type { SfuState } from "../state.js";
import { attachSocketAuth } from "./auth.js";
import { registerConnectionHandlers } from "./registerConnectionHandlers.js";

export type CreateSocketServerOptions = {
  state: SfuState;
  config?: typeof defaultConfig;
};

export const createSfuSocketServer = (
  httpServer: HttpServer,
  options: CreateSocketServerOptions,
): SocketIOServer => {
  const io = new SocketIOServer(httpServer, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
    },
  });

  attachSocketAuth(io, { config: options.config });
  registerConnectionHandlers(io, options.state);

  return io;
};
