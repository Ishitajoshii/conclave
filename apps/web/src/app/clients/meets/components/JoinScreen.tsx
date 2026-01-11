"use client";

import { AlertCircle, Loader2, Users } from "lucide-react";
import type { RoomInfo } from "@/lib/sfu-types";
import type { ConnectionState } from "../types";

interface JoinScreenProps {
  roomId: string;
  onRoomIdChange: (id: string) => void;
  onJoin: () => void;
  onJoinRoom: (roomId: string) => void;
  isLoading: boolean;
  userEmail: string;
  connectionState: ConnectionState;
  isAdmin: boolean;
  showPermissionHint: boolean;
  rooms: RoomInfo[];
  roomsStatus: "idle" | "loading" | "error";
  onRefreshRooms: () => void;
  displayNameInput: string;
  onDisplayNameInputChange: (value: string) => void;
  isGhostMode: boolean;
  onGhostModeChange: (value: boolean) => void;
}

export default function JoinScreen({
  roomId,
  onRoomIdChange,
  onJoin,
  onJoinRoom,
  isLoading,
  userEmail,
  connectionState,
  isAdmin,
  showPermissionHint,
  rooms,
  roomsStatus,
  onRefreshRooms,
  displayNameInput,
  onDisplayNameInputChange,
  isGhostMode,
  onGhostModeChange,
}: JoinScreenProps) {
  const canJoin = roomId.trim().length > 0;

  return (
    <div className="flex flex-col items-center justify-center flex-1 gap-4">
      <div className="text-center mb-4">
        <h2
          className="text-2xl font-bold mb-2 tracking-[0.5px]"
          style={{ fontWeight: 700 }}
        >
          Join a meeting
        </h2>
        <p className="text-gray-400" style={{ fontWeight: 500 }}>
          Logged in as: {userEmail}
        </p>
      </div>

      <input
        type="text"
        value={roomId}
        onChange={(e) => onRoomIdChange(e.target.value)}
        placeholder="Enter Room ID"
        disabled={isLoading}
        className="px-4 py-2 bg-[#252525] border border-white/10 rounded-md w-64 text-center focus:outline-none focus:border-white transition-colors disabled:opacity-50 placeholder:text-neutral-600"
      />
      {isAdmin && (
        <div className="w-full max-w-sm">
          <label htmlFor="display-name" className="text-xs text-white/60">
            Display name
          </label>
          <input
            id="display-name"
            type="text"
            value={displayNameInput}
            onChange={(e) => onDisplayNameInputChange(e.target.value)}
            placeholder="Enter display name"
            maxLength={40}
            disabled={isLoading}
            className="mt-1 w-full px-4 py-2 bg-[#252525] border border-white/10 rounded-md text-center focus:outline-none focus:border-white transition-colors disabled:opacity-50 placeholder:text-neutral-600"
          />
          <div className="mt-1 text-[11px] text-white/50 text-center">
            Used when you join the room.
          </div>
        </div>
      )}

      {isAdmin && (
        <div className="w-full max-w-sm">
          <button
            type="button"
            onClick={() => onGhostModeChange(!isGhostMode)}
            disabled={isLoading}
            className="w-full flex items-center justify-between gap-3 px-4 py-3 bg-[#252525] border border-white/10 rounded-md text-left hover:bg-[#2a2a2a] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <div>
              <div className="text-sm font-medium">Ghost mode</div>
              <div className="text-xs text-white/50">
                Join invisibly with mic & camera locked.
              </div>
            </div>
            <div className="ml-auto">
              <div
                className={`w-10 h-6 rounded-full transition-colors relative ${
                  isGhostMode ? "bg-blue-600" : "bg-white/20"
                }`}
              >
                <div
                  className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${
                    isGhostMode ? "left-5" : "left-1"
                  }`}
                />
              </div>
            </div>
          </button>
        </div>
      )}

      <button
        onClick={onJoin}
        disabled={!canJoin || isLoading}
        className="px-6 py-2 bg-white text-black hover:bg-neutral-200 disabled:bg-neutral-800 disabled:text-neutral-500 disabled:cursor-not-allowed rounded-md transition-colors flex items-center gap-2 text-sm tracking-[0.5px]"
        style={{ fontWeight: 500 }}
      >
        {isLoading && <Loader2 className="w-3 h-3 animate-spin" />}
        {connectionState === "reconnecting"
          ? "Reconnecting..."
          : isLoading
          ? "Joining..."
          : "Join Room"}
      </button>

      {showPermissionHint && (
        <div className="flex items-center gap-2 rounded-md border border-white/10 bg-white/5 px-3 py-2 text-xs text-white/70">
          <AlertCircle className="w-3.5 h-3.5 text-blue-300" />
          <span>
            Please allow camera/microphone permissions to connect to the
            meeting.
          </span>
        </div>
      )}

      {isAdmin && (
        <div className="w-full max-w-2xl mt-6">
          <div className="flex items-center justify-between mb-2 px-1">
            <h3 className="text-sm tracking-[0.5px]" style={{ fontWeight: 700 }}>
              Active meetings
            </h3>
            <button
              onClick={onRefreshRooms}
              disabled={roomsStatus === "loading"}
              className="text-xs px-3 py-1 rounded bg-white/5 border border-white/10 text-neutral-300 hover:bg-white/10 disabled:opacity-50 transition-colors"
              style={{ fontWeight: 500 }}
            >
              {roomsStatus === "loading" ? "Refreshing..." : "Refresh"}
            </button>
          </div>

          {roomsStatus === "loading" ? (
            <div className="flex items-center justify-center gap-2 py-6 text-neutral-400">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span className="text-sm">Loading rooms...</span>
            </div>
          ) : rooms.length === 0 ? (
            <div className="text-sm text-neutral-500 text-center py-6">
              {roomsStatus === "error"
                ? "Unable to load rooms. Try again."
                : "No active rooms right now."}
            </div>
          ) : (
            <div className="max-h-64 overflow-y-auto pr-1">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {rooms.map((room) => (
                  <div
                    key={room.id}
                    className="flex items-center justify-between gap-4 p-3 rounded-lg bg-[#252525] border border-white/5"
                  >
                    <div className="min-w-0">
                      <div
                        className="text-sm text-white truncate"
                        style={{ fontWeight: 600 }}
                      >
                        {room.id}
                      </div>
                      <div className="text-xs text-neutral-500 flex items-center gap-1">
                        <Users className="w-3 h-3" />
                        <span className="tabular-nums">
                          {room.userCount} participant
                          {room.userCount === 1 ? "" : "s"}
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={() => onJoinRoom(room.id)}
                      disabled={isLoading}
                      className="px-3 py-1 text-xs rounded-md bg-blue-500/20 text-blue-300 border border-blue-500/30 hover:bg-blue-500/30 disabled:opacity-50 transition-colors"
                      style={{ fontWeight: 500 }}
                    >
                      Join
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
