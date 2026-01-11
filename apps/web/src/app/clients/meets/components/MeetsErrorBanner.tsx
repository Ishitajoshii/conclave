"use client";

import { AlertCircle, X } from "lucide-react";
import type { MeetError } from "../types";

interface MeetsErrorBannerProps {
  meetError: MeetError;
  onDismiss: () => void;
}

export default function MeetsErrorBanner({
  meetError,
  onDismiss,
}: MeetsErrorBannerProps) {
  return (
    <div className="p-3 bg-red-900/50 border-b border-red-700 flex items-center justify-between">
      <div className="flex items-center gap-2 text-red-200">
        <AlertCircle className="w-4 h-4" />
        <span>{meetError.message}</span>
      </div>
      <button
        onClick={onDismiss}
        className="p-1 hover:bg-red-800/50 rounded-full transition-colors text-red-200"
        title="Dismiss error"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}
