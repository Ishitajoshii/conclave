import type { CreateTransportResponse, ConnectTransportData } from "../../../types.js";
import { Logger } from "../../../utilities/loggers.js";
import type { ConnectionContext } from "../context.js";

export const registerTransportHandlers = (context: ConnectionContext): void => {
  const { socket } = context;

  socket.on(
    "createProducerTransport",
    async (
      callback: (response: CreateTransportResponse | { error: string }) => void,
    ) => {
      try {
        if (!context.currentRoom || !context.currentClient) {
          callback({ error: "Not in a room" });
          return;
        }

        const transport = await context.currentRoom.createWebRtcTransport();
        context.currentClient.producerTransport = transport;

        callback({
          id: transport.id,
          iceParameters: transport.iceParameters,
          iceCandidates: transport.iceCandidates as any,
          dtlsParameters: transport.dtlsParameters,
        });
      } catch (error) {
        Logger.error("Error creating producer transport:", error);
        callback({ error: (error as Error).message });
      }
    },
  );

  socket.on(
    "createConsumerTransport",
    async (
      callback: (response: CreateTransportResponse | { error: string }) => void,
    ) => {
      try {
        if (!context.currentRoom || !context.currentClient) {
          callback({ error: "Not in a room" });
          return;
        }

        const transport = await context.currentRoom.createWebRtcTransport();
        context.currentClient.consumerTransport = transport;

        callback({
          id: transport.id,
          iceParameters: transport.iceParameters,
          iceCandidates: transport.iceCandidates as any,
          dtlsParameters: transport.dtlsParameters,
        });
      } catch (error) {
        Logger.error("Error creating consumer transport:", error);
        callback({ error: (error as Error).message });
      }
    },
  );

  socket.on(
    "connectProducerTransport",
    async (
      data: ConnectTransportData,
      callback: (response: { success: boolean } | { error: string }) => void,
    ) => {
      try {
        if (!context.currentClient?.producerTransport) {
          callback({ error: "Producer transport not found" });
          return;
        }

        await context.currentClient.producerTransport.connect({
          dtlsParameters: data.dtlsParameters,
        });

        callback({ success: true });
      } catch (error) {
        Logger.error("Error connecting producer transport:", error);
        callback({ error: (error as Error).message });
      }
    },
  );

  socket.on(
    "connectConsumerTransport",
    async (
      data: ConnectTransportData,
      callback: (response: { success: boolean } | { error: string }) => void,
    ) => {
      try {
        if (!context.currentClient?.consumerTransport) {
          callback({ error: "Consumer transport not found" });
          return;
        }

        await context.currentClient.consumerTransport.connect({
          dtlsParameters: data.dtlsParameters,
        });

        callback({ success: true });
      } catch (error) {
        Logger.error("Error connecting consumer transport:", error);
        callback({ error: (error as Error).message });
      }
    },
  );
};
