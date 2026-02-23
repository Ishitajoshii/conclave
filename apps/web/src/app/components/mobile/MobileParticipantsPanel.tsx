"use client";

import { Crown, Ghost, Hand, MicOff, X } from "lucide-react";
import { memo, useState } from "react";
import type { Socket } from "socket.io-client";
import HostPromotionDialog from "../HostPromotionDialog";
import type { Participant } from "../../lib/types";
import { isSystemUserId, truncateDisplayName } from "../../lib/utils";

interface MobileParticipantsPanelProps {
  participants: Map<string, Participant>;
  currentUserId: string;
  onClose: () => void;
  socket: Socket | null;
  isAdmin: boolean;
  pendingUsers: Map<string, string>;
  getDisplayName: (userId: string) => string;
  hostUserId?: string | null;
  hostUserIds?: string[];
}

function MobileParticipantsPanel({
  participants,
  currentUserId,
  onClose,
  socket,
  isAdmin,
  pendingUsers,
  getDisplayName,
  hostUserId,
  hostUserIds,
}: MobileParticipantsPanelProps) {
  const participantArray = Array.from(participants.values()).filter(
    (participant) => !isSystemUserId(participant.userId),
  );
  const pendingArray = Array.from(pendingUsers.entries());
  const effectiveHostUserId = hostUserId ?? (isAdmin ? currentUserId : null);
  const effectiveHostUserIds = new Set<string>(
    hostUserIds && hostUserIds.length > 0
      ? hostUserIds
      : effectiveHostUserId
        ? [effectiveHostUserId]
        : [],
  );
  const canManageHost = Boolean(isAdmin);
  const [promotingHostUserId, setPromotingHostUserId] = useState<string | null>(
    null,
  );
  const [pendingHostPromotionUserId, setPendingHostPromotionUserId] = useState<
    string | null
  >(null);
  const [hostActionError, setHostActionError] = useState<string | null>(null);
  const formatName = (value: string, maxLength = 18) =>
    truncateDisplayName(value, maxLength);

  const handleAdmit = (userId: string) => {
    socket?.emit("admitUser", { userId });
  };

  const handleReject = (userId: string) => {
    socket?.emit("rejectUser", { userId });
  };

  const handlePromoteHost = (targetUserId: string) => {
    if (!socket || !canManageHost || effectiveHostUserIds.has(targetUserId)) {
      return;
    }

    setHostActionError(null);
    setPromotingHostUserId(targetUserId);
    socket.emit(
      "promoteHost",
      { userId: targetUserId },
      (res: { success?: boolean; hostUserId?: string; error?: string }) => {
        setPromotingHostUserId(null);
        setPendingHostPromotionUserId(null);
        if (res.error || !res.success) {
          setHostActionError(res.error || "Failed to promote host.");
        }
      },
    );
  };

  const openPromoteHostDialog = (targetUserId: string) => {
    if (!canManageHost || effectiveHostUserIds.has(targetUserId)) return;
    setHostActionError(null);
    setPendingHostPromotionUserId(targetUserId);
  };

  const closePromoteHostDialog = () => {
    if (promotingHostUserId) return;
    setPendingHostPromotionUserId(null);
  };

  return (
    <div className="fixed inset-0 bg-[#1a1a1a] z-50 flex flex-col safe-area-pt safe-area-pb">
      {/* Header */}
      <div
        className="flex items-center justify-between px-4 py-3 border-b border-[#FEFCD9]/10"
        style={{ fontFamily: "'PolySans Mono', monospace" }}
      >
        <h2 className="text-lg font-semibold text-[#FEFCD9] uppercase tracking-wide">
          Participants ({participantArray.length + 1})
        </h2>
        <button
          onClick={onClose}
          className="p-2 rounded-full hover:bg-[#FEFCD9]/10 text-[#FEFCD9]/70"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto">
        {/* Waiting room section (for admins) */}
        {isAdmin && pendingArray.length > 0 && (
          <div className="px-4 py-3 border-b border-[#FEFCD9]/10">
            <p className="text-[10px] text-[#FEFCD9]/40 uppercase tracking-widest mb-3">
              Waiting ({pendingArray.length})
            </p>
            <div className="space-y-2">
              {pendingArray.map(([userId, displayName]) => (
                <div
                  key={userId}
                  className="flex items-center justify-between bg-[#252525] rounded-xl p-3"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#F95F4A]/20 to-[#FF007A]/20 border border-[#FEFCD9]/20 flex items-center justify-center text-[#FEFCD9] font-bold">
                      {displayName[0]?.toUpperCase() || "?"}
                    </div>
                    <span
                      className="text-sm text-[#FEFCD9]"
                      title={displayName}
                    >
                      {formatName(displayName)}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleReject(userId)}
                      className="px-3 py-1.5 text-xs text-red-400 border border-red-400/30 rounded-lg active:bg-red-400/10"
                    >
                      Deny
                    </button>
                    <button
                      onClick={() => handleAdmit(userId)}
                      className="px-3 py-1.5 text-xs text-white bg-[#F95F4A] rounded-lg active:bg-[#e8553f]"
                    >
                      Admit
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* In meeting section */}
        <div className="px-4 py-3">
          {hostActionError && (
            <div className="mb-3 text-[11px] px-2.5 py-1.5 rounded-lg bg-red-500/10 text-red-300 border border-red-500/20">
              {hostActionError}
            </div>
          )}
          <p className="text-[10px] text-[#FEFCD9]/40 uppercase tracking-widest mb-3">
            In meeting
          </p>
          <div className="space-y-2">
            {/* Current user (You) */}
            <div className="flex items-center gap-3 bg-[#252525] rounded-xl p-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#F95F4A]/20 to-[#FF007A]/20 border border-[#FEFCD9]/20 flex items-center justify-center text-[#FEFCD9] font-bold">
                {getDisplayName(currentUserId)[0]?.toUpperCase() || "?"}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-[#FEFCD9]">
                    {formatName(getDisplayName(currentUserId), 16)}
                  </span>
                  <span className="text-[9px] text-[#F95F4A]/60 uppercase">
                    (You)
                  </span>
                  {effectiveHostUserIds.has(currentUserId) && (
                    <span className="inline-flex shrink-0 items-center gap-1 rounded-full border border-amber-300/30 bg-amber-400/10 px-1.5 py-0.5 text-[9px] uppercase tracking-wide text-amber-200">
                      Host
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Other participants */}
            {participantArray.map((participant) => (
              <div
                key={participant.userId}
                className="flex items-center gap-3 bg-[#252525] rounded-xl p-3"
              >
                <div className="relative">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#F95F4A]/20 to-[#FF007A]/20 border border-[#FEFCD9]/20 flex items-center justify-center text-[#FEFCD9] font-bold">
                    {getDisplayName(participant.userId)[0]?.toUpperCase() ||
                      "?"}
                  </div>
                  {participant.isGhost && (
                    <Ghost className="absolute -bottom-0.5 -right-0.5 w-4 h-4 text-[#FF007A] bg-[#252525] rounded-full p-0.5" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="text-sm text-[#FEFCD9] truncate block">
                      {formatName(getDisplayName(participant.userId), 16)}
                    </span>
                    {effectiveHostUserIds.has(participant.userId) && (
                      <span className="inline-flex shrink-0 items-center gap-1 rounded-full border border-amber-300/30 bg-amber-400/10 px-1.5 py-0.5 text-[9px] uppercase tracking-wide text-amber-200">
                        Host
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {canManageHost &&
                    !effectiveHostUserIds.has(participant.userId) &&
                    !participant.isGhost && (
                      <button
                        onClick={() => openPromoteHostDialog(participant.userId)}
                        disabled={promotingHostUserId === participant.userId}
                        className="px-2 py-1 text-[10px] text-amber-200 border border-amber-300/30 rounded-md disabled:opacity-40 disabled:cursor-not-allowed"
                      >
                        {promotingHostUserId === participant.userId ? (
                          "Promoting..."
                        ) : (
                          <span className="inline-flex items-center gap-1">
                            <Crown className="w-3 h-3" />
                            Host
                          </span>
                        )}
                      </button>
                    )}
                  {participant.isHandRaised && (
                    <Hand className="w-4 h-4 text-amber-400" />
                  )}
                  {participant.isMuted && (
                    <MicOff className="w-4 h-4 text-[#F95F4A]" />
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <HostPromotionDialog
        isOpen={Boolean(pendingHostPromotionUserId)}
        targetName={
          pendingHostPromotionUserId
            ? formatName(getDisplayName(pendingHostPromotionUserId), 24)
            : ""
        }
        isSubmitting={Boolean(
          promotingHostUserId &&
            pendingHostPromotionUserId &&
            promotingHostUserId === pendingHostPromotionUserId,
        )}
        onCancel={closePromoteHostDialog}
        onConfirm={() => {
          if (!pendingHostPromotionUserId) return;
          handlePromoteHost(pendingHostPromotionUserId);
        }}
      />
    </div>
  );
}

export default memo(MobileParticipantsPanel);
