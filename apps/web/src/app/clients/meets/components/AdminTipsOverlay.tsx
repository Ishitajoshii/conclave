"use client";

import { UserCheck, X } from "lucide-react";

interface AdminTipsOverlayProps {
  currentStep: number;
  onNextStep: () => void;
  onSkip: () => void;
  onClose: () => void;
}

export default function AdminTipsOverlay({
  onSkip,
  onClose,
}: AdminTipsOverlayProps) {
  return (
    <div className="fixed bottom-24 right-4 z-40 animate-in slide-in-from-right-full duration-300">
      <div className="bg-[#1f1f1f] border border-white/10 rounded-lg shadow-xl max-w-xs overflow-hidden">
        <div className="p-3">
          <div className="flex items-start justify-between gap-3 mb-1.5">
            <div className="flex items-center gap-2">
              <UserCheck className="w-4 h-4 text-green-400" />
              <span className="text-sm font-medium text-white">
                New participant joined
              </span>
            </div>
            <button
              onClick={onClose}
              className="p-0.5 text-white/40 hover:text-white transition-colors shrink-0"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <p className="text-sm text-white/60 mb-2">
            Click their video to verify attendance
          </p>

          <button
            onClick={onSkip}
            className="text-xs text-white/40 hover:text-white/60 transition-colors"
          >
            Don&apos;t show again
          </button>
        </div>
      </div>
    </div>
  );
}
