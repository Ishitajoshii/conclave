"use client";

import {
  AlertCircle,
  ArrowRight,
  ChevronDown,
  Hand,
  Mic,
  MicOff,
  Monitor,
  Users,
  Video,
  VideoOff,
  X,
  UserMinus,
} from "lucide-react";
import { useState } from "react";
import type { Socket } from "socket.io-client";
import type { RoomInfo } from "@/lib/sfu-types";
import type { Participant } from "../types";
import { formatDisplayName } from "../utils";

export type ParticipantsPanelGetRooms = (
  roomId: string,
) => Promise<RoomInfo[]>;

interface ParticipantsPanelProps {
  participants: Map<string, Participant>;
  currentUserId: string;
  onClose: () => void;
  pendingUsers?: Map<string, string>;
  roomId: string;
  onPendingUserStale?: (userId: string) => void;
  getDisplayName: (userId: string) => string;
  getRooms?: ParticipantsPanelGetRooms;
}

export default function ParticipantsPanel({
  participants,
  currentUserId,
  onClose,
  getDisplayName,
  socket,
  isAdmin,
  pendingUsers,
  roomId,
  onPendingUserStale,
  getRooms,
}: ParticipantsPanelProps & {
  socket: Socket | null;
  isAdmin?: boolean | null;
}) {
  const participantsList = Array.from(participants.values());
  const pendingList = pendingUsers ? Array.from(pendingUsers.entries()) : [];
  const [showRedirectModal, setShowRedirectModal] = useState(false);
  const [availableRooms, setAvailableRooms] = useState<RoomInfo[]>([]);
  const [selectedUserForRedirect, setSelectedUserForRedirect] =
    useState<string | null>(null);
  const [isPendingExpanded, setIsPendingExpanded] = useState(true);
  const filteredRooms = availableRooms.filter((room) => room.id !== roomId);

  const getEmailFromUserId = (userId: string): string => {
    return userId.split("#")[0] || userId;
  };

  const handleCloseProducer = (producerId: string) => {
    if (!socket || !isAdmin) return;
    socket.emit("closeRemoteProducer", { producerId }, (res: any) => {
      if (res.error) console.error("Failed to close producer:", res.error);
    });
  };

  const openRedirectModal = (userId: string) => {
    setSelectedUserForRedirect(userId);
    if (getRooms) {
      getRooms(roomId)
        .then((rooms) => {
          setAvailableRooms(rooms || []);
          setShowRedirectModal(true);
        })
        .catch(() => {
          setAvailableRooms([]);
          setShowRedirectModal(true);
        });
      return;
    }

    socket?.emit("getRooms", (response: { rooms?: RoomInfo[] }) => {
      setAvailableRooms(response.rooms || []);
      setShowRedirectModal(true);
    });
  };

  const handleRedirect = (targetRoomId: string) => {
    if (!selectedUserForRedirect || !socket) return;

    socket.emit(
      "redirectUser",
      { userId: selectedUserForRedirect, newRoomId: targetRoomId },
      (res: { error?: string }) => {
        if (res.error) {
          console.error("Redirect failed:", res.error);
        } else {
          console.log("Redirect success");
          setShowRedirectModal(false);
          setSelectedUserForRedirect(null);
        }
      }
    );
  };

  return (
    <div
      className="absolute right-4 top-4 bottom-20 w-80 bg-[#1f1f1f] rounded-lg shadow-2xl flex flex-col border border-white/5 z-10 overflow-hidden"
      style={{ fontFamily: "'Roboto', sans-serif" }}
    >
      <div className="flex flex-col border-b border-white/5">
        <div className="flex items-center justify-between p-3">
          <h3 className="text-sm tracking-[0.5px]" style={{ fontWeight: 700 }}>
            Participants (
            <span className="tabular-nums">{participantsList.length + 1}</span>)
          </h3>
          <button
            onClick={onClose}
            className="p-1 hover:bg-white/10 rounded transition-colors text-neutral-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        {isAdmin && (
          <div className="px-3 pb-3 flex gap-2">
            <button
              onClick={() =>
                socket?.emit("muteAll", (res: unknown) =>
                  console.log("Muted all:", res)
                )
              }
              className="flex-1 bg-red-500/10 hover:bg-red-500/20 text-red-500 text-xs py-1.5 rounded flex items-center justify-center gap-1.5 transition-colors border border-red-500/20 tracking-[0.5px]"
              style={{ fontWeight: 500 }}
              title="Mute all participants"
            >
              <MicOff className="w-3 h-3" />
              Mute All
            </button>
            <button
              onClick={() =>
                socket?.emit("closeAllVideo", (res: unknown) =>
                  console.log("Stopped all video:", res)
                )
              }
              className="flex-1 bg-red-500/10 hover:bg-red-500/20 text-red-500 text-xs py-1.5 rounded flex items-center justify-center gap-1.5 transition-colors border border-red-500/20 tracking-[0.5px]"
              style={{ fontWeight: 500 }}
              title="Stop video for all participants"
            >
              <VideoOff className="w-3 h-3" />
              Stop Video
            </button>
          </div>
        )}
      </div>

      {isAdmin && pendingList.length > 0 && (
        <div className="border-b border-white/10 bg-blue-500/10">
          <button
            type="button"
            onClick={() => setIsPendingExpanded((prev) => !prev)}
            className="w-full px-3 py-2 flex items-center justify-between hover:bg-blue-500/5 transition-colors"
            aria-expanded={isPendingExpanded}
          >
            <div className="flex items-center gap-2">
              <h4 className="font-bold text-xs text-blue-400 uppercase tracking-wide">
                Pending Requests
              </h4>
              <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-blue-500/20 text-blue-200 tabular-nums">
                {pendingList.length}
              </span>
            </div>
            <ChevronDown
              className={`w-3.5 h-3.5 text-blue-200 transition-transform ${
                isPendingExpanded ? "rotate-180" : ""
              }`}
            />
          </button>
          {isPendingExpanded && (
            <div className="px-3 pb-3">
              <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                {pendingList.map(([userId, displayName]) => {
                  const pendingName = formatDisplayName(displayName || userId);
                  return (
                    <div
                      key={userId}
                      className="relative flex items-center justify-between p-2 rounded bg-black/40 border border-white/10"
                    >
                      <div className="flex items-center gap-2 overflow-hidden flex-1 min-w-0">
                        <div className="w-6 h-6 rounded-full bg-neutral-800 flex items-center justify-center text-[10px] border border-white/10 shrink-0">
                          {pendingName[0]?.toUpperCase() || "?"}
                        </div>
                        <span className="text-sm truncate text-white/80">
                          {pendingName}
                        </span>
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          onClick={() =>
                            socket?.emit(
                              "admitUser",
                              { userId },
                              (res: { success?: boolean; error?: string }) => {
                                if (res?.error) {
                                  console.error("[Meets] Admit failed:", res.error);
                                  onPendingUserStale?.(userId);
                                }
                              }
                            )
                          }
                          className="p-1.5 bg-green-500/20 hover:bg-green-500/30 text-green-500 rounded transition-colors text-xs font-medium"
                          title="Admit"
                        >
                          Admit
                        </button>
                        <button
                          onClick={() =>
                            socket?.emit(
                              "rejectUser",
                              { userId },
                              (res: { success?: boolean; error?: string }) => {
                                if (res?.error) {
                                  console.error(
                                    "[Meets] Reject failed:",
                                    res.error
                                  );
                                  onPendingUserStale?.(userId);
                                }
                              }
                            )
                          }
                          className="p-1.5 bg-red-500/20 hover:bg-red-500/30 text-red-500 rounded transition-colors text-xs font-medium"
                          title="Reject"
                        >
                          Reject
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      <div className="flex-1 min-h-0 overflow-y-auto p-3 space-y-2">
        {participantsList.map((p) => {
          const isMe = p.userId === currentUserId;
          const displayName = getDisplayName(p.userId);
          const userEmail = getEmailFromUserId(p.userId);

          return (
            <div
              key={p.userId}
              className={`relative flex items-center justify-between p-2 rounded-lg border ${
                isMe
                  ? "bg-white/5 border-white/20"
                  : "bg-transparent border-white/5"
              }`}
            >
              <div className="flex items-center gap-3 overflow-hidden flex-1 min-w-0">
                <div
                  className="w-8 h-8 rounded-full bg-neutral-800 flex items-center justify-center text-xs border border-white/10 shrink-0"
                  style={{ fontWeight: 500 }}
                >
                  {displayName[0]?.toUpperCase() || "?"}
                </div>
                <span className="text-sm truncate" style={{ fontWeight: 500 }}>
                  {displayName} {isMe && "(You)"}
                </span>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                {p.isHandRaised && (
                  <div
                    className="flex items-center text-amber-300"
                    title="Hand raised"
                  >
                    <Hand className="w-3 h-3" />
                  </div>
                )}
                {p.screenShareStream && (
                  <div className="flex items-center gap-1">
                    <Monitor className="w-3 h-3 text-green-500" />
                    {isAdmin && !isMe && p.screenShareProducerId && (
                      <button
                        onClick={() => {
                          if (p.screenShareProducerId)
                            handleCloseProducer(p.screenShareProducerId);
                        }}
                        className="text-red-500 hover:text-red-400"
                        title="Stop screen share"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                )}

                {p.isCameraOff ? (
                  <VideoOff className="w-3 h-3 text-red-500" />
                ) : isAdmin && !isMe && p.videoProducerId ? (
                  <button
                    onClick={() => {
                      if (p.videoProducerId)
                        handleCloseProducer(p.videoProducerId);
                    }}
                    className="flex items-center gap-1 text-red-500 hover:text-red-400 p-1 hover:bg-white/5 rounded transition-colors"
                    title="Stop video"
                  >
                    <Video className="w-3 h-3 text-green-500" />
                    <X className="w-3 h-3" />
                  </button>
                ) : (
                  <Video className="w-3 h-3 text-green-500" />
                )}

                {p.isMuted ? (
                  <MicOff className="w-3 h-3 text-red-500" />
                ) : isAdmin && !isMe && p.audioProducerId ? (
                  <button
                    onClick={() => {
                      if (p.audioProducerId)
                        handleCloseProducer(p.audioProducerId);
                    }}
                    className="flex items-center gap-1 text-red-500 hover:text-red-400 p-1 hover:bg-white/5 rounded transition-colors"
                    title="Stop audio"
                  >
                    <Mic className="w-3 h-3 text-green-500" />
                    <X className="w-3 h-3" />
                  </button>
                ) : (
                  <Mic className="w-3 h-3 text-green-500" />
                )}
              </div>

              {isAdmin && !isMe && (
                <div className="flex items-center gap-1 ml-2">
                  <button
                    onClick={() => openRedirectModal(p.userId)}
                    className="text-blue-500 hover:text-blue-400 p-1 hover:bg-white/5 rounded transition-colors"
                    title="Redirect user"
                  >
                    <ArrowRight className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() =>
                      socket?.emit("kickUser", { userId: p.userId }, () => {})
                    }
                    className="text-red-500 hover:text-red-400 p-1 hover:bg-white/5 rounded transition-colors"
                    title="Kick user"
                  >
                    <UserMinus className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {showRedirectModal && (
        <div className="absolute inset-0 bg-[#1a1a1a] z-20 flex flex-col pt-4 pb-2 px-2 animate-in fade-in duration-200">
          <div className="flex items-center justify-between mb-4 border-b border-white/5 pb-3 px-2">
            <div>
              <h4
                className="text-sm tracking-[0.5px] text-white"
                style={{ fontWeight: 700 }}
              >
                Select Room
              </h4>
              <p className="text-[10px] text-neutral-400 mt-0.5">
                Redirect user to another room
              </p>
            </div>
            <button
              onClick={() => setShowRedirectModal(false)}
              className="text-neutral-400 hover:text-white p-1 hover:bg-white/5 rounded transition-all"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto space-y-2 px-1 custom-scrollbar">
            {filteredRooms.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-40 text-neutral-500 gap-2">
                <AlertCircle className="w-8 h-8 opacity-20" />
                <p className="text-sm">No other active rooms</p>
              </div>
            ) : (
              filteredRooms.map((room) => (
                <button
                  key={room.id}
                  onClick={() => handleRedirect(room.id)}
                  className="w-full text-left p-3 rounded-lg bg-[#252525] hover:bg-[#333] border border-white/5 hover:border-white/10 transition-all flex justify-between items-center group relative overflow-hidden"
                >
                  <div className="flex flex-col z-10">
                    <span
                      className="text-sm text-white group-hover:text-blue-400 transition-colors"
                      style={{ fontWeight: 600 }}
                    >
                      {room.id}
                    </span>
                    <span className="text-[10px] text-neutral-500 group-hover:text-neutral-400">
                      ID: {room.id.substring(0, 8)}...
                    </span>
                  </div>
                  <div className="flex items-center gap-3 z-10">
                    <div className="flex items-center gap-1.5 text-xs text-neutral-400 bg-black/20 px-2 py-1 rounded">
                      <Users className="w-3 h-3" />
                      <span className="tabular-nums">{room.userCount}</span>
                    </div>
                    <ArrowRight className="w-3 h-3 text-blue-400 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300" />
                  </div>
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
