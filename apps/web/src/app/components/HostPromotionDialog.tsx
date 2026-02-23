"use client";

import { Crown, X } from "lucide-react";

interface HostPromotionDialogProps {
  isOpen: boolean;
  targetName: string;
  isSubmitting?: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}

export default function HostPromotionDialog({
  isOpen,
  targetName,
  isSubmitting = false,
  onCancel,
  onConfirm,
}: HostPromotionDialogProps) {
  if (!isOpen) return null;

  return (
    <div className="absolute inset-0 z-30 flex items-center justify-center bg-black/65 px-4 backdrop-blur-sm">
      <div
        className="w-full max-w-sm rounded-2xl border border-[#FEFCD9]/15 bg-[#131413] p-4 shadow-2xl"
        style={{ fontFamily: "'PolySans Trial', sans-serif" }}
      >
        <div className="mb-3 flex items-start justify-between gap-3">
          <div className="flex items-start gap-2.5">
            <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-amber-300/30 bg-amber-400/10 text-amber-200">
              <Crown className="h-4 w-4" />
            </span>
            <div>
              <h3 className="text-sm font-medium text-[#FEFCD9]">
                Add Host Privileges
              </h3>
              <p className="mt-1 text-xs leading-relaxed text-[#FEFCD9]/60">
                Promote <span className="text-[#FEFCD9]">{targetName}</span> to
                host? They will gain host controls immediately.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onCancel}
            disabled={isSubmitting}
            className="inline-flex h-6 w-6 items-center justify-center rounded-md text-[#FEFCD9]/45 transition-colors hover:bg-[#FEFCD9]/10 hover:text-[#FEFCD9] disabled:cursor-not-allowed disabled:opacity-40"
            aria-label="Close host promotion dialog"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>

        <div className="flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={onCancel}
            disabled={isSubmitting}
            className="rounded-md border border-[#FEFCD9]/15 px-3 py-1.5 text-xs text-[#FEFCD9]/70 transition-all hover:border-[#FEFCD9]/30 hover:bg-[#FEFCD9]/10 hover:text-[#FEFCD9] disabled:cursor-not-allowed disabled:opacity-40"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isSubmitting}
            className="rounded-md border border-[#F95F4A]/35 bg-[#F95F4A]/15 px-3 py-1.5 text-xs text-[#FEFCD9] transition-all hover:border-[#F95F4A]/55 hover:bg-[#F95F4A]/25 disabled:cursor-not-allowed disabled:opacity-40"
          >
            {isSubmitting ? "Promoting..." : "Add Host"}
          </button>
        </div>
      </div>
    </div>
  );
}
