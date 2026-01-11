import { EMOJI_REACTIONS, type ReactionEmoji } from "./constants";
import type { MeetError, ReactionOption } from "./types";

export function createMeetError(
  error: unknown,
  defaultCode: MeetError["code"] = "UNKNOWN"
): MeetError {
  const message = error instanceof Error ? error.message : String(error);

  if (
    message.includes("Permission denied") ||
    message.includes("NotAllowedError")
  ) {
    return {
      code: "PERMISSION_DENIED",
      message: "Camera/microphone permission denied",
      recoverable: true,
    };
  }
  if (
    message.includes("NotFoundError") ||
    message.includes("DevicesNotFoundError")
  ) {
    return {
      code: "MEDIA_ERROR",
      message: "Camera or microphone not found",
      recoverable: true,
    };
  }
  if (message.includes("Connection") || message.includes("socket")) {
    return {
      code: "CONNECTION_FAILED",
      message: "Failed to connect to server",
      recoverable: true,
    };
  }

  return { code: defaultCode, message, recoverable: false };
}

export function generateSessionId(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
}

export function formatDisplayName(raw: string): string {
  const base = raw.split("#")[0] || raw;
  const handle = base.split("@")[0] || base;
  const tokens = handle.split(/[^A-Za-z0-9]+/).filter(Boolean);
  const words = tokens
    .map((token) => token.match(/^[A-Za-z]+/)?.[0] || "")
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0]?.toUpperCase() + word.slice(1).toLowerCase());

  return words.length > 0 ? words.join(" ") : handle || raw;
}

export function normalizeDisplayName(value: string): string {
  return value.trim().replace(/\s+/g, " ");
}

export function isReactionEmoji(value: string): value is ReactionEmoji {
  return EMOJI_REACTIONS.includes(value as ReactionEmoji);
}

function formatReactionLabel(fileName: string): string {
  const baseName = fileName.replace(/\.[^/.]+$/, "");
  const words = baseName
    .split(/[^A-Za-z0-9]+/)
    .filter(Boolean)
    .map((word) => word[0]?.toUpperCase() + word.slice(1).toLowerCase());

  return words.length ? words.slice(0, 2).join(" ") : baseName || "Reaction";
}

export function buildAssetReaction(fileName: string): ReactionOption {
  return {
    id: `asset-${fileName}`,
    kind: "asset",
    value: `/reactions/${encodeURIComponent(fileName)}`,
    label: formatReactionLabel(fileName),
  };
}

export function isValidAssetPath(value: string): boolean {
  return value.startsWith("/reactions/") && !value.includes("..");
}

export function getSpeakerHighlightClasses(isActive: boolean): string {
  return isActive
    ? "border-emerald-300/90 ring-4 ring-emerald-400/45 shadow-[0_0_26px_rgba(16,185,129,0.28)]"
    : "";
}
