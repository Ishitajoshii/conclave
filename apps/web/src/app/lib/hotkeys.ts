
export interface HotkeyDefinition {
  keys: string;
  label: string;
  description: string;
}

export type HotkeyAction =
  | "toggleMute"
  | "toggleCamera"
  | "toggleHandRaise"
  | "toggleChat"
  | "toggleParticipants";

export const HOTKEYS: Record<HotkeyAction, HotkeyDefinition> = {
  toggleMute: {
    keys: "Mod+D",
    label: "Mute / Unmute",
    description: "Toggle your microphone on or off.",
  },
  toggleCamera: {
    keys: "Mod+E",
    label: "Camera on / off",
    description: "Toggle your camera on or off.",
  },
  toggleHandRaise: {
    keys: "Mod+Alt+H",
    label: "Raise / Lower hand",
    description: "Raise or lower your hand to get the presenter's attention.",
  },
  toggleChat: {
    keys: "Mod+Alt+C",
    label: "Chat",
    description: "Open or close the chat panel.",
  },
  toggleParticipants: {
    keys: "Mod+Alt+P",
    label: "Participants",
    description: "Open or close the participants panel.",
  },
} as const;

export const HOTKEY_LIST: (HotkeyDefinition & { action: HotkeyAction })[] =
  (Object.entries(HOTKEYS) as [HotkeyAction, HotkeyDefinition][]).map(
    ([action, definition]) => ({ action, ...definition }),
  );
