"use client";

import { Ghost, Hand, MicOff } from "lucide-react";
import { memo, useEffect, useMemo, useRef } from "react";
import type { Participant } from "../lib/types";
import { isSystemUserId } from "../lib/utils";
import ParticipantVideo from "./ParticipantVideo";

interface GridLayoutProps {
  localStream: MediaStream | null;
  isCameraOff: boolean;
  isMuted: boolean;
  isHandRaised: boolean;
  isGhost: boolean;
  participants: Map<string, Participant>;
  userEmail: string;
  isMirrorCamera: boolean;
  activeSpeakerId: string | null;
  currentUserId: string;
  audioOutputDeviceId?: string;
  isAdmin?: boolean;
  selectedParticipantId?: string | null;
  onParticipantClick?: (userId: string) => void;
  getDisplayName: (userId: string) => string;
}

const MAX_GRID_TILES = 16;

function GridLayout({
  localStream,
  isCameraOff,
  isMuted,
  isHandRaised,
  isGhost,
  participants,
  userEmail,
  isMirrorCamera,
  activeSpeakerId,
  currentUserId,
  audioOutputDeviceId,
  isAdmin = false,
  selectedParticipantId,
  onParticipantClick,
  getDisplayName,
}: GridLayoutProps) {
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const isLocalActiveSpeaker = activeSpeakerId === currentUserId;

  useEffect(() => {
    const video = localVideoRef.current;
    if (video && localStream) {
      video.srcObject = localStream;
      video.play().catch((err) => {
        if (err.name !== "AbortError") {
          console.error("[Meets] Grid local video play error:", err);
        }
      });
    }
  }, [localStream]);

  const remoteParticipants = useMemo(
    () =>
      Array.from(participants.values()).filter(
        (participant) =>
          !isSystemUserId(participant.userId) &&
          participant.userId !== currentUserId
      ),
    [participants, currentUserId]
  );

  const maxVisibleRemoteParticipants = Math.max(0, MAX_GRID_TILES - 1);
  const visibleParticipants = useMemo(() => {
    if (remoteParticipants.length <= maxVisibleRemoteParticipants) {
      return remoteParticipants;
    }

    const selectedIds = new Set<string>();
    const activeRemoteParticipant =
      activeSpeakerId
        ? remoteParticipants.find(
            (participant) => participant.userId === activeSpeakerId
          )
        : null;

    if (activeRemoteParticipant) {
      selectedIds.add(activeRemoteParticipant.userId);
    }

    for (const participant of remoteParticipants) {
      if (selectedIds.size >= maxVisibleRemoteParticipants) {
        break;
      }
      const hasVideo = Boolean(participant.videoStream) && !participant.isCameraOff;
      if (hasVideo) {
        selectedIds.add(participant.userId);
      }
    }

    const visible: Participant[] = [];
    for (const participant of remoteParticipants) {
      if (visible.length >= maxVisibleRemoteParticipants) {
        break;
      }
      if (selectedIds.has(participant.userId)) {
        visible.push(participant);
      }
    }

    if (visible.length < maxVisibleRemoteParticipants) {
      for (const participant of remoteParticipants) {
        if (visible.length >= maxVisibleRemoteParticipants) {
          break;
        }
        if (!selectedIds.has(participant.userId)) {
          visible.push(participant);
        }
      }
    }

    return visible;
  }, [remoteParticipants, activeSpeakerId, maxVisibleRemoteParticipants]);

  const hiddenParticipantsCount = Math.max(
    0,
    remoteParticipants.length - visibleParticipants.length
  );
  const totalParticipants = visibleParticipants.length + 1;

  const localDisplayName = getDisplayName(currentUserId);

  const getGridLayout = (count: number) => {
    if (count === 1) return "grid-cols-1 grid-rows-1";
    if (count === 2) return "grid-cols-2 grid-rows-1";
    if (count === 3) return "grid-cols-3 grid-rows-1";
    if (count === 4) return "grid-cols-2 grid-rows-2";
    if (count <= 6) return "grid-cols-3 grid-rows-2";
    if (count <= 9) return "grid-cols-3 grid-rows-3";
    if (count <= 12) return "grid-cols-4 grid-rows-3";
    if (count <= 16) return "grid-cols-4 grid-rows-4";
    return "grid-cols-3 sm:grid-cols-4 xl:grid-cols-5 auto-rows-[minmax(150px,1fr)]";
  };

  const gridClass = getGridLayout(totalParticipants);

  const localSpeakerHighlight = isLocalActiveSpeaker 
    ? "speaking" 
    : "";

  return (
    <div className="relative flex-1 min-h-0">
      {hiddenParticipantsCount > 0 ? (
        <div
          className="absolute right-6 top-6 z-10 rounded-full border border-[#FEFCD9]/15 bg-black/55 px-3 py-1 text-[10px] uppercase tracking-wide text-[#FEFCD9]/70"
          style={{ fontFamily: "'PolySans Mono', monospace" }}
        >
          +{hiddenParticipantsCount} more
        </div>
      ) : null}
      <div className={`h-full grid ${gridClass} gap-3 overflow-hidden p-4`}>
      <div
        className={`acm-video-tile ${localSpeakerHighlight}`}
        style={{ fontFamily: "'PolySans Trial', sans-serif" }}
      >
        <video
          ref={localVideoRef}
          autoPlay
          muted
          playsInline
          className={`w-full h-full object-cover ${
            isCameraOff ? "hidden" : ""
          } ${isMirrorCamera ? "scale-x-[-1]" : ""}`}
        />
        {isCameraOff && (
          <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-[#1a1a1a] to-[#0d0e0d]">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#F95F4A]/20 to-[#FF007A]/20 border border-[#FEFCD9]/20 flex items-center justify-center text-3xl text-[#FEFCD9] font-bold">
              {userEmail[0]?.toUpperCase() || "?"}
            </div>
          </div>
        )}
        {isGhost && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none bg-black/40">
            <div className="flex flex-col items-center gap-2">
              <Ghost className="w-16 h-16 text-[#FF007A] drop-shadow-[0_0_22px_rgba(255,0,122,0.5)]" />
              <span 
                className="text-[11px] text-[#FF007A] bg-black/60 border border-[#FF007A]/30 px-3 py-1 rounded-full uppercase tracking-[0.1em]"
                style={{ fontFamily: "'PolySans Mono', monospace" }}
              >
                Ghost
              </span>
            </div>
          </div>
        )}
        {isHandRaised && (
          <div
            className="absolute top-3 left-3 p-2 rounded-full bg-amber-500/20 border border-amber-400/40 text-amber-300 shadow-[0_0_15px_rgba(251,191,36,0.3)]"
            title="Hand raised"
          >
            <Hand className="w-4 h-4" />
          </div>
        )}
        <div
          className="absolute bottom-3 left-3 px-3 py-1.5 bg-black/70 backdrop-blur-sm border border-[#FEFCD9]/10 rounded-full text-xs flex items-center gap-2 text-[#FEFCD9] uppercase tracking-wide"
          style={{ fontFamily: "'PolySans Mono', monospace" }}
        >
          <div className="flex items-center gap-1">
            <span className="font-medium text-[#FEFCD9] uppercase tracking-wide">
              {localDisplayName}
            </span>
            <span className="text-[9px] text-[#F95F4A]/60 uppercase tracking-[0.15em]">
              You
            </span>
          </div>
          {isMuted && <MicOff className="w-3 h-3 text-[#F95F4A]" />}
        </div>
      </div>

      {visibleParticipants.map((participant) => (
        <ParticipantVideo
          key={participant.userId}
          participant={participant}
          displayName={getDisplayName(participant.userId)}
          isActiveSpeaker={activeSpeakerId === participant.userId}
          audioOutputDeviceId={audioOutputDeviceId}
          isAdmin={isAdmin}
          isSelected={selectedParticipantId === participant.userId}
          onAdminClick={onParticipantClick}
        />
      ))}
      </div>
    </div>
  );
}

export default memo(GridLayout);
