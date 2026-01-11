export const RECONNECT_DELAY_MS = 1000;
export const MAX_RECONNECT_ATTEMPTS = 8;
export const SOCKET_TIMEOUT_MS = 10000;
export const SPEAKER_CHECK_INTERVAL_MS = 250;
export const SPEAKER_THRESHOLD = 0.03;
export const ACTIVE_SPEAKER_HOLD_MS = 900;
export const REACTION_LIFETIME_MS = 3800;
export const MAX_REACTIONS = 30;
export const EMOJI_REACTIONS = ["👍", "👏", "😂", "❤️", "🎉", "😮"] as const;

export const STANDARD_QUALITY_CONSTRAINTS = {
  width: { ideal: 640, max: 640 },
  height: { ideal: 360, max: 360 },
  frameRate: { ideal: 24, max: 24 },
};

export const LOW_QUALITY_CONSTRAINTS = {
  width: { ideal: 256, max: 256 },
  height: { ideal: 144, max: 144 },
  frameRate: { ideal: 15, max: 15 },
};

export const MEETS_ICE_SERVERS: RTCIceServer[] = (() => {
  const urls = (
    process.env.NEXT_PUBLIC_TURN_URLS ??
    process.env.NEXT_PUBLIC_TURN_URL ??
    ""
  )
    .split(",")
    .map((value) => value.trim())
    .filter(Boolean);

  if (!urls.length) return [];

  const iceServer: RTCIceServer = {
    urls: urls.length === 1 ? urls[0] : urls,
  };
  const username = process.env.NEXT_PUBLIC_TURN_USERNAME;
  const credential = process.env.NEXT_PUBLIC_TURN_PASSWORD;

  if (username && credential) {
    iceServer.username = username;
    iceServer.credential = credential;
  }

  return [iceServer];
})();

export type ReactionEmoji = (typeof EMOJI_REACTIONS)[number];
