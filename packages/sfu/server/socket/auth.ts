import jwt from "jsonwebtoken";
import type { Server as SocketIOServer } from "socket.io";
import { config as defaultConfig } from "../../config/config.js";

export const attachSocketAuth = (
  io: SocketIOServer,
  options?: { config?: typeof defaultConfig },
): void => {
  const config = options?.config ?? defaultConfig;

  io.use((socket, next) => {
    const token = socket.handshake.auth.token;
    if (!token) {
      return next(new Error("Authentication error: No token provided"));
    }

    jwt.verify(token, config.sfuSecret, (err: Error | null, decoded: any) => {
      if (err) {
        return next(new Error("Authentication error: Invalid token"));
      }

      if (!decoded || typeof decoded !== "object") {
        return next(new Error("Authentication error: Invalid token payload"));
      }

      (socket as any).user = decoded;
      next();
    });
  });
};
