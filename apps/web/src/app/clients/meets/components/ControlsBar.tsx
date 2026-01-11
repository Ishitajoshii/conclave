"use client";

import {
  Hand,
  MessageSquare,
  Mic,
  MicOff,
  Monitor,
  Phone,
  Smile,
  Users,
  Video,
  VideoOff,
} from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import type { ReactionOption } from "../types";

interface ControlsBarProps {
  isMuted: boolean;
  isCameraOff: boolean;
  isScreenSharing: boolean;
  activeScreenShareId: string | null;
  isChatOpen: boolean;
  unreadCount: number;
  isHandRaised: boolean;
  reactionOptions: ReactionOption[];
  onToggleMute: () => void;
  onToggleCamera: () => void;
  onToggleScreenShare: () => void;
  onToggleChat: () => void;
  onToggleHandRaised: () => void;
  onSendReaction: (reaction: ReactionOption) => void;
  onLeave: () => void;
  isAdmin?: boolean | null;
  isGhostMode?: boolean;
  isParticipantsOpen?: boolean;
  onToggleParticipants?: () => void;
  pendingUsersCount?: number;
}

export default function ControlsBar({
  isMuted,
  isCameraOff,
  isScreenSharing,
  activeScreenShareId,
  isChatOpen,
  unreadCount,
  isHandRaised,
  reactionOptions,
  onToggleMute,
  onToggleCamera,
  onToggleScreenShare,
  onToggleChat,
  onToggleHandRaised,
  onSendReaction,
  onLeave,
  isAdmin,
  isGhostMode = false,
  isParticipantsOpen,
  onToggleParticipants,
  pendingUsersCount = 0,
}: ControlsBarProps) {
  const canStartScreenShare = !activeScreenShareId || isScreenSharing;
  const [isReactionMenuOpen, setIsReactionMenuOpen] = useState(false);
  const reactionMenuRef = useRef<HTMLDivElement>(null);
  const lastReactionTimeRef = useRef<number>(0);
  const REACTION_COOLDOWN_MS = 150;
  const ghostDisabledClass =
    "bg-[#1a1a1a] text-neutral-600 cursor-not-allowed";
  const screenShareDisabled = isGhostMode || !canStartScreenShare;

  useEffect(() => {
    if (!isReactionMenuOpen) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (
        reactionMenuRef.current &&
        !reactionMenuRef.current.contains(event.target as Node)
      ) {
        setIsReactionMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isReactionMenuOpen]);

  const handleReactionClick = useCallback(
    (reaction: ReactionOption) => {
      const now = Date.now();
      if (now - lastReactionTimeRef.current < REACTION_COOLDOWN_MS) {
        return;
      }
      lastReactionTimeRef.current = now;
      onSendReaction(reaction);
    },
    [onSendReaction]
  );

  return (
    <div className="flex justify-center gap-2 mt-4 shrink-0">
      {isAdmin && (
        <button
          onClick={onToggleParticipants}
          className={`relative w-12 h-12 rounded-full transition-all duration-200 flex items-center justify-center ${
            isParticipantsOpen
              ? "bg-white text-black hover:bg-neutral-200"
              : "bg-[#2a2a2a] text-white hover:bg-[#3a3a3a]"
          }`}
          title="Participants"
        >
          <Users className="w-5 h-5" />
          {pendingUsersCount > 0 && (
            <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 text-xs font-medium bg-orange-500 text-white rounded-full flex items-center justify-center">
              {pendingUsersCount > 9 ? "9+" : pendingUsersCount}
            </span>
          )}
        </button>
      )}

      <button
        onClick={onToggleMute}
        disabled={isGhostMode}
        className={`w-12 h-12 rounded-full transition-all duration-200 flex items-center justify-center ${
          isGhostMode
            ? ghostDisabledClass
            : isMuted
            ? "bg-red-500 text-white hover:bg-red-600"
            : "bg-[#2a2a2a] text-white hover:bg-[#3a3a3a]"
        }`}
        title={isGhostMode ? "Ghost mode: mic locked" : isMuted ? "Unmute" : "Mute"}
      >
        {isMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
      </button>

      <button
        onClick={onToggleCamera}
        disabled={isGhostMode}
        className={`w-12 h-12 rounded-full transition-all duration-200 flex items-center justify-center ${
          isGhostMode
            ? ghostDisabledClass
            : isCameraOff
            ? "bg-red-500 text-white hover:bg-red-600"
            : "bg-[#2a2a2a] text-white hover:bg-[#3a3a3a]"
        }`}
        title={
          isGhostMode
            ? "Ghost mode: camera locked"
            : isCameraOff
            ? "Turn on camera"
            : "Turn off camera"
        }
      >
        {isCameraOff ? (
          <VideoOff className="w-5 h-5" />
        ) : (
          <Video className="w-5 h-5" />
        )}
      </button>

      <button
        onClick={onToggleScreenShare}
        disabled={screenShareDisabled}
        className={`w-12 h-12 rounded-full transition-all duration-200 flex items-center justify-center ${
          isScreenSharing
            ? "bg-white text-black hover:bg-neutral-200"
            : screenShareDisabled
            ? ghostDisabledClass
            : "bg-[#2a2a2a] text-white hover:bg-[#3a3a3a]"
        }`}
        title={
          isGhostMode
            ? "Ghost mode: screen share locked"
            : !canStartScreenShare
            ? "Someone else is presenting"
            : isScreenSharing
            ? "Stop sharing"
            : "Share screen"
        }
      >
        <Monitor className="w-5 h-5" />
      </button>

      <button
        onClick={onToggleHandRaised}
        disabled={isGhostMode}
        className={`w-12 h-12 rounded-full transition-all duration-200 flex items-center justify-center ${
          isGhostMode
            ? ghostDisabledClass
            : isHandRaised
            ? "bg-amber-400 text-black hover:bg-amber-300"
            : "bg-[#2a2a2a] text-white hover:bg-[#3a3a3a]"
        }`}
        title={
          isGhostMode
            ? "Ghost mode: hand raise locked"
            : isHandRaised
            ? "Lower hand"
            : "Raise hand"
        }
      >
        <Hand className="w-5 h-5" />
      </button>

      <div ref={reactionMenuRef} className="relative">
        <button
          onClick={() => setIsReactionMenuOpen((prev) => !prev)}
          disabled={isGhostMode}
          className={`w-12 h-12 rounded-full transition-all duration-200 flex items-center justify-center ${
            isGhostMode
              ? ghostDisabledClass
              : isReactionMenuOpen
              ? "bg-white text-black hover:bg-neutral-200"
              : "bg-[#2a2a2a] text-white hover:bg-[#3a3a3a]"
          }`}
          title={isGhostMode ? "Ghost mode: reactions locked" : "Reactions"}
        >
          <Smile className="w-5 h-5" />
        </button>

        {isReactionMenuOpen && (
          <div className="absolute bottom-14 left-1/2 -translate-x-1/2 flex items-center gap-1 rounded-full border border-white/10 bg-[#1f1f1f] px-2 py-1 shadow-lg max-w-[320px] overflow-x-auto no-scrollbar">
            {reactionOptions.map((reaction) => (
              <button
                key={reaction.id}
                onClick={() => handleReactionClick(reaction)}
                className="w-9 h-9 shrink-0 rounded-full text-xl hover:bg-white/10 transition-colors flex items-center justify-center"
                title={`React ${reaction.label}`}
              >
                {reaction.kind === "emoji" ? (
                  reaction.value
                ) : (
                  <img
                    src={reaction.value}
                    alt={reaction.label}
                    className="w-6 h-6 object-contain"
                    loading="lazy"
                  />
                )}
              </button>
            ))}
          </div>
        )}
      </div>

      <button
        onClick={onToggleChat}
        className={`w-12 h-12 rounded-full transition-all duration-200 flex items-center justify-center relative ${
          isChatOpen
            ? "bg-white text-black hover:bg-neutral-200"
            : "bg-[#2a2a2a] text-white hover:bg-[#3a3a3a]"
        }`}
        title="Chat"
      >
        <MessageSquare className="w-5 h-5" />
        {unreadCount > 0 && (
          <span
            className="absolute -top-1 -right-1 bg-white text-black text-[10px] min-w-[18px] h-[18px] rounded-full flex items-center justify-center tabular-nums"
            style={{ fontWeight: 500 }}
          >
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      <button
        onClick={onLeave}
        className="w-12 h-12 rounded-full bg-red-500 hover:bg-red-600 text-white transition-all duration-200 flex items-center justify-center"
        title="Leave meeting"
      >
        <Phone className="rotate-[135deg] w-5 h-5" />
      </button>
    </div>
  );
}
