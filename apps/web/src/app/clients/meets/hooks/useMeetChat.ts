"use client";

import { useCallback, useRef, useState } from "react";
import type { Socket } from "socket.io-client";
import type { ChatMessage } from "../types";

interface UseMeetChatOptions {
  socketRef: React.MutableRefObject<Socket | null>;
  ghostEnabled: boolean;
}

export function useMeetChat({ socketRef, ghostEnabled }: UseMeetChatOptions) {
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatOverlayMessages, setChatOverlayMessages] = useState<ChatMessage[]>(
    []
  );
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [chatInput, setChatInput] = useState("");
  const isChatOpenRef = useRef(false);

  const toggleChat = useCallback(() => {
    setIsChatOpen((prev) => {
      const newValue = !prev;
      isChatOpenRef.current = newValue;
      if (newValue) {
        setUnreadCount(0);
      }
      return newValue;
    });
  }, []);

  const sendChat = useCallback(
    (content: string) => {
      if (ghostEnabled) return;
      const socket = socketRef.current;
      if (!socket || !content.trim()) return;

      socket.emit(
        "sendChat",
        { content: content.trim() },
        (
          response:
            | { success: boolean; message?: ChatMessage }
            | { error: string }
        ) => {
          if ("error" in response) {
            console.error("[Meets] Chat error:", response.error);
            return;
          }
          if (response.message) {
            const newMessage = response.message;
            setChatMessages((prev) => [...prev, newMessage]);
          }
        }
      );
    },
    [ghostEnabled, socketRef]
  );

  return {
    chatMessages,
    setChatMessages,
    chatOverlayMessages,
    setChatOverlayMessages,
    isChatOpen,
    unreadCount,
    setUnreadCount,
    chatInput,
    setChatInput,
    toggleChat,
    sendChat,
    isChatOpenRef,
  };
}
