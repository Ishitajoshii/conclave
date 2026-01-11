"use client";

import { RefreshCw, UserX } from "lucide-react";
import type { ConnectionState } from "../types";
import ConnectionIndicator from "./ConnectionIndicator";
import VideoSettings from "./video-settings";

interface MeetsHeaderProps {
  isJoined: boolean;
  isAdmin: boolean;
  roomId: string;
  isMirrorCamera: boolean;
  isVideoSettingsOpen: boolean;
  onToggleVideoSettings: () => void;
  onToggleMirror: () => void;
  isCameraOff: boolean;
  displayNameInput: string;
  displayNameStatus: { type: "success" | "error"; message: string } | null;
  isDisplayNameUpdating: boolean;
  canUpdateDisplayName: boolean;
  onDisplayNameInputChange: (value: string) => void;
  onDisplayNameSubmit: () => void;
  selectedAudioInputDeviceId?: string;
  selectedAudioOutputDeviceId?: string;
  onAudioInputDeviceChange: (deviceId: string) => void;
  onAudioOutputDeviceChange: (deviceId: string) => void;
  isScreenSharing: boolean;
  ghostEnabled: boolean;
  connectionState: ConnectionState;
}

export default function MeetsHeader({
  isJoined,
  isAdmin,
  roomId,
  isMirrorCamera,
  isVideoSettingsOpen,
  onToggleVideoSettings,
  onToggleMirror,
  isCameraOff,
  displayNameInput,
  displayNameStatus,
  isDisplayNameUpdating,
  canUpdateDisplayName,
  onDisplayNameInputChange,
  onDisplayNameSubmit,
  selectedAudioInputDeviceId,
  selectedAudioOutputDeviceId,
  onAudioInputDeviceChange,
  onAudioOutputDeviceChange,
  isScreenSharing,
  ghostEnabled,
  connectionState,
}: MeetsHeaderProps) {
  return (
    <div className="flex items-center justify-between p-4 bg-[#151515] border-b border-white/5">
      <div className="flex items-center gap-2">
        <h1
          className="text-xl font-bold tracking-[0.5px]"
          style={{ fontWeight: 700 }}
        >
          ACM c0nclav3
        </h1>
        {isJoined && (
          <div className="flex items-stretch gap-2 ml-2 hidden sm:flex h-8">
            {isAdmin && (
              <div
                className="flex items-center bg-white/5 px-3 rounded-md text-sm text-white/80 border border-white/10"
                style={{ fontWeight: 500 }}
              >
                <span className="text-white/40 mr-2">Room:</span>
                <span
                  className="font-bold tabular-nums"
                  style={{ fontWeight: 700 }}
                >
                  {roomId}
                </span>
              </div>
            )}
            <VideoSettings
              isMirrorCamera={isMirrorCamera}
              isOpen={isVideoSettingsOpen}
              onToggleOpen={onToggleVideoSettings}
              onToggleMirror={onToggleMirror}
              isCameraOff={isCameraOff}
              isAdmin={isAdmin}
              displayNameInput={displayNameInput}
              displayNameStatus={displayNameStatus}
              isDisplayNameUpdating={isDisplayNameUpdating}
              canUpdateDisplayName={canUpdateDisplayName}
              onDisplayNameInputChange={onDisplayNameInputChange}
              onDisplayNameSubmit={onDisplayNameSubmit}
              selectedAudioInputDeviceId={selectedAudioInputDeviceId}
              selectedAudioOutputDeviceId={selectedAudioOutputDeviceId}
              onAudioInputDeviceChange={onAudioInputDeviceChange}
              onAudioOutputDeviceChange={onAudioOutputDeviceChange}
            />
          </div>
        )}
      </div>
      <div className="flex items-center gap-3">
        {isScreenSharing && (
          <span
            className="bg-red-500/10 border border-red-500/20 text-red-500 text-xs px-2 py-0.5 rounded-full animate-pulse tracking-[0.5px]"
            style={{ fontWeight: 500 }}
          >
            Screen is being shared
          </span>
        )}
        {ghostEnabled && isJoined && (
          <span
            className="bg-blue-500/10 border border-blue-500/20 text-blue-300 text-xs px-2 py-0.5 rounded-full tracking-[0.5px] flex items-center gap-1"
            style={{ fontWeight: 500 }}
          >
            <UserX className="w-3 h-3" />
            Ghost mode
          </span>
        )}
        {connectionState === "reconnecting" && (
          <span
            className="bg-yellow-600 text-xs px-2 py-1 rounded flex items-center gap-1 tracking-[0.5px]"
            style={{ fontWeight: 500 }}
          >
            <RefreshCw className="w-3 h-3 animate-spin" />
            Reconnecting...
          </span>
        )}
        {/* <ConnectionIndicator state={connectionState} /> */}
      </div>
    </div>
  );
}
