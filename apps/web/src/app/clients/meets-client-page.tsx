"use client";

import MeetsClient from "./meets-client";

const getJoinInfo = async (_roomId: string, _sessionId: string) => {
  throw new Error("getJoinInfo is not configured");
};

const getRooms = async () => {
  return [];
};

export default function MeetsClientPage() {
  return (
    <div className="min-h-screen bg-[#1a1a1a]">
      <MeetsClient
        getJoinInfo={getJoinInfo}
        getRooms={getRooms}
        getRoomsForRedirect={async () => []}
        reactionAssets={[]}
        user={{ name: "Guest", email: "guest@example.com" }}
        isAdmin
      />
    </div>
  );
}
