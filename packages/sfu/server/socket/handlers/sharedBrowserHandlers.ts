import { Admin } from "../../../config/classes/Admin.js";
import type {
    LaunchBrowserData,
    LaunchBrowserResponse,
    BrowserNavigateData,
    BrowserStateNotification,
} from "../../../types.js";
import { Logger } from "../../../utilities/loggers.js";
import type { ConnectionContext } from "../context.js";
import { respond } from "./ack.js";

const BROWSER_SERVICE_URL = process.env.BROWSER_SERVICE_URL || "http://localhost:3040";

interface RoomBrowserState {
    active: boolean;
    url?: string;
    noVncUrl?: string;
    controllerUserId?: string;
}

const roomBrowserStates: Map<string, RoomBrowserState> = new Map();

const getBrowserState = (channelId: string): RoomBrowserState => {
    return roomBrowserStates.get(channelId) || { active: false };
};

const setBrowserState = (channelId: string, state: RoomBrowserState): void => {
    roomBrowserStates.set(channelId, state);
};

export const clearBrowserState = (channelId: string): void => {
    roomBrowserStates.delete(channelId);
};

export const registerSharedBrowserHandlers = (context: ConnectionContext): void => {
    const { socket } = context;

    socket.on(
        "browser:launch",
        async (
            data: LaunchBrowserData,
            callback: (response: LaunchBrowserResponse | { error: string }) => void
        ) => {
            try {
                if (!context.currentClient || !context.currentRoom) {
                    respond(callback, { error: "Not in a room" });
                    return;
                }

                if (!(context.currentClient instanceof Admin)) {
                    respond(callback, { error: "Only admins can launch the shared browser" });
                    return;
                }

                const channelId = context.currentRoom.channelId;
                const userId = context.currentClient.id;

                const currentState = getBrowserState(channelId);
                if (currentState.active) {
                    respond(callback, { error: "Browser session already active" });
                    return;
                }

                const response = await fetch(`${BROWSER_SERVICE_URL}/launch`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        roomId: channelId,
                        url: data.url,
                        controllerUserId: userId,
                    }),
                });

                const result = await response.json();

                if (!result.success) {
                    respond(callback, { error: result.error || "Failed to launch browser" });
                    return;
                }

                const newState: RoomBrowserState = {
                    active: true,
                    url: data.url,
                    noVncUrl: result.session?.noVncUrl,
                    controllerUserId: userId,
                };
                setBrowserState(channelId, newState);

                socket.to(channelId).emit("browser:state", {
                    active: true,
                    url: data.url,
                    noVncUrl: result.session?.noVncUrl,
                    controllerUserId: userId,
                } as BrowserStateNotification);

                Logger.success(`Browser launched in room ${context.currentRoom.id}: ${data.url}`);
                respond(callback, { success: true, noVncUrl: result.session?.noVncUrl });
            } catch (error) {
                Logger.error("[SharedBrowser] Failed to launch:", error);
                respond(callback, { error: "Failed to connect to browser service" });
            }
        }
    );

    socket.on(
        "browser:navigate",
        async (
            data: BrowserNavigateData,
            callback: (response: LaunchBrowserResponse | { error: string }) => void
        ) => {
            try {
                if (!context.currentClient || !context.currentRoom) {
                    respond(callback, { error: "Not in a room" });
                    return;
                }

                if (!(context.currentClient instanceof Admin)) {
                    respond(callback, { error: "Only admins can control the shared browser" });
                    return;
                }

                const channelId = context.currentRoom.channelId;
                const currentState = getBrowserState(channelId);

                if (!currentState.active) {
                    respond(callback, { error: "No active browser session" });
                    return;
                }

                const response = await fetch(`${BROWSER_SERVICE_URL}/navigate`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        roomId: channelId,
                        url: data.url,
                    }),
                });

                const result = await response.json();

                if (!result.success) {
                    respond(callback, { error: result.error || "Failed to navigate" });
                    return;
                }

                currentState.url = data.url;
                currentState.noVncUrl = result.session?.noVncUrl;
                setBrowserState(channelId, currentState);

                socket.to(channelId).emit("browser:state", {
                    active: true,
                    url: data.url,
                    noVncUrl: result.session?.noVncUrl,
                    controllerUserId: currentState.controllerUserId,
                } as BrowserStateNotification);

                Logger.info(`Browser navigated in room ${context.currentRoom.id}: ${data.url}`);
                respond(callback, { success: true, noVncUrl: result.session?.noVncUrl });
            } catch (error) {
                Logger.error("[SharedBrowser] Failed to navigate:", error);
                respond(callback, { error: "Failed to connect to browser service" });
            }
        }
    );

    socket.on(
        "browser:close",
        async (callback: (response: { success: boolean } | { error: string }) => void) => {
            try {
                if (!context.currentClient || !context.currentRoom) {
                    respond(callback, { error: "Not in a room" });
                    return;
                }

                if (!(context.currentClient instanceof Admin)) {
                    respond(callback, { error: "Only admins can close the shared browser" });
                    return;
                }

                const channelId = context.currentRoom.channelId;
                const currentState = getBrowserState(channelId);

                if (!currentState.active) {
                    respond(callback, { success: true });
                    return;
                }

                await fetch(`${BROWSER_SERVICE_URL}/close`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ roomId: channelId }),
                });

                clearBrowserState(channelId);

                socket.to(channelId).emit("browser:closed", { closedBy: context.currentClient.id });

                Logger.info(`Browser closed in room ${context.currentRoom.id}`);
                respond(callback, { success: true });
            } catch (error) {
                Logger.error("[SharedBrowser] Failed to close:", error);
                respond(callback, { error: "Failed to connect to browser service" });
            }
        }
    );

    socket.on("browser:getState", (callback: (state: BrowserStateNotification) => void) => {
        if (!context.currentRoom) {
            callback({ active: false });
            return;
        }

        const state = getBrowserState(context.currentRoom.channelId);
        callback({
            active: state.active,
            url: state.url,
            noVncUrl: state.noVncUrl,
            controllerUserId: state.controllerUserId,
        });
    });

    socket.on("browser:activity", async () => {
        if (!context.currentRoom) return;

        const channelId = context.currentRoom.channelId;
        const state = getBrowserState(channelId);
        if (!state.active) return;

        try {
            await fetch(`${BROWSER_SERVICE_URL}/activity`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ roomId: channelId }),
            });
        } catch {
        }
    });
};

export const cleanupRoomBrowser = async (channelId: string): Promise<void> => {
    const state = getBrowserState(channelId);
    if (!state.active) return;

    try {
        await fetch(`${BROWSER_SERVICE_URL}/close`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ roomId: channelId }),
        });
    } catch (error) {
        Logger.error("[SharedBrowser] Failed to cleanup on room close:", error);
    }

    clearBrowserState(channelId);
};
