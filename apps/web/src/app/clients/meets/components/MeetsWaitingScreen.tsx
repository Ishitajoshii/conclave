"use client";

import { Loader2 } from "lucide-react";

interface MeetsWaitingScreenProps {
  waitingTitle: string;
  waitingIntro: string;
  roomId: string;
  isAdmin: boolean;
}

export default function MeetsWaitingScreen({
  waitingTitle,
  waitingIntro,
  roomId,
  isAdmin,
}: MeetsWaitingScreenProps) {
  return (
    <div className="flex flex-col h-full w-full bg-[#252525] items-center justify-center text-white">
      <Loader2 className="w-12 h-12 text-blue-500 animate-spin mb-4" />
      <h2 className="text-2xl font-bold mb-2">{waitingTitle}</h2>
      <p className="text-white/70 text-center max-w-lg px-4">
        {waitingIntro} If you are facing issues or have questions, please feel
        free to ask away on the ACM Community Informal WhatsApp Group{" "}
        <a
          href="https://chat.whatsapp.com/Lj6GFN4bLggBJmQWBwUSTz"
          className="text-blue-300 hover:text-blue-200 underline"
          target="_blank"
          rel="noreferrer"
        >
          here
        </a>
        .
      </p>
      {isAdmin && <p className="text-white/60">Using room ID: {roomId}</p>}
    </div>
  );
}
