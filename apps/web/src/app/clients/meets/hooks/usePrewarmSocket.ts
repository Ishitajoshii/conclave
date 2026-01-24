"use client";

import { useEffect, useRef, useState } from "react";

type PrewarmState = {
  mediasoupDevice: typeof import("mediasoup-client").Device | null;
  socketIo: typeof import("socket.io-client").io | null;
  isReady: boolean;
};

export type PrewarmModules = {
  Device: typeof import("mediasoup-client").Device | null;
  io: typeof import("socket.io-client").io | null;
  isReady: boolean;
};

export function usePrewarmSocket(): PrewarmModules {
  const [state, setState] = useState<PrewarmState>({
    mediasoupDevice: null,
    socketIo: null,
    isReady: false,
  });

  const startedRef = useRef(false);

  useEffect(() => {
    if (startedRef.current) return;
    startedRef.current = true;

    const prewarm = async () => {
      const startTime = performance.now();

      const [mediasoupModule, socketIoModule] = await Promise.all([
        import("mediasoup-client"),
        import("socket.io-client"),
      ]);

      const duration = performance.now() - startTime;
      console.log(`[Meets] Pre-warmed libraries in ${duration.toFixed(0)}ms`);

      setState({
        mediasoupDevice: mediasoupModule.Device,
        socketIo: socketIoModule.io,
        isReady: true,
      });
    };

    prewarm().catch((err) => {
      console.warn("[Meets] Failed to prewarm libraries:", err);
    });
  }, []);

  return {
    Device: state.mediasoupDevice,
    io: state.socketIo,
    isReady: state.isReady,
  };
}
