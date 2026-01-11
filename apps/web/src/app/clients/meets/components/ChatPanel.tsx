"use client";

import { Send, X } from "lucide-react";
import { useEffect, useRef } from "react";
import type { ChatMessage } from "../types";
import { formatDisplayName } from "../utils";

interface ChatPanelProps {
  messages: ChatMessage[];
  chatInput: string;
  onInputChange: (value: string) => void;
  onSend: (content: string) => void;
  onClose: () => void;
  currentUserId: string;
  isGhostMode?: boolean;
}

export default function ChatPanel({
  messages,
  chatInput,
  onInputChange,
  onSend,
  onClose,
  currentUserId,
  isGhostMode = false,
}: ChatPanelProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const shouldAutoScrollRef = useRef(true);

  useEffect(() => {
    if (shouldAutoScrollRef.current) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  const handleScroll = () => {
    const container = scrollContainerRef.current;
    if (!container) return;
    const threshold = 64;
    const distanceFromBottom =
      container.scrollHeight - container.scrollTop - container.clientHeight;
    shouldAutoScrollRef.current = distanceFromBottom <= threshold;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isGhostMode) return;
    if (chatInput.trim()) {
      onSend(chatInput);
      onInputChange("");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <div
      className="absolute right-4 top-4 bottom-20 w-80 bg-[#1f1f1f] rounded-lg shadow-2xl flex flex-col border border-white/5 z-10"
      style={{ fontFamily: "'Roboto', sans-serif" }}
    >
      <div className="flex items-center justify-between p-3 border-b border-white/5">
        <h3 className="text-sm tracking-[0.5px]" style={{ fontWeight: 700 }}>
          Chat
        </h3>
        <button
          onClick={onClose}
          className="p-1 hover:bg-white/10 rounded transition-colors text-neutral-400 hover:text-white"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <div
        ref={scrollContainerRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto p-3 space-y-3"
      >
        {messages.length === 0 ? (
          <p className="text-gray-500 text-center text-sm">No messages yet</p>
        ) : (
          messages.map((msg) => {
            const isOwn = msg.userId === currentUserId;
            const displayName = formatDisplayName(msg.displayName || msg.userId);
            return (
              <div
                key={msg.id}
                className={`flex flex-col ${
                  isOwn ? "items-end" : "items-start"
                }`}
              >
                <div
                  className={`max-w-[85%] rounded-lg px-3 py-2 text-sm ${
                    isOwn
                      ? "bg-white text-black"
                      : "bg-[#2a2a2a] text-neutral-200 border border-white/5"
                  }`}
                >
                  {!isOwn && (
                    <p className="text-xs text-gray-400 mb-1">
                      {displayName}
                    </p>
                  )}
                  <p className="text-sm break-words">{msg.content}</p>
                </div>
                <span className="text-xs text-gray-500 mt-1 tabular-nums">
                  {new Date(msg.timestamp).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      <form
        onSubmit={handleSubmit}
        className="p-3 border-t border-white/5 bg-[#1f1f1f]"
      >
        <div className="flex gap-2">
          <input
            type="text"
            value={chatInput}
            onChange={(e) => onInputChange(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type a message..."
            maxLength={1000}
            disabled={isGhostMode}
            className="flex-1 px-3 py-2 bg-[#2a2a2a] border border-white/5 rounded-md text-sm focus:outline-none focus:border-white/30 transition-colors placeholder:text-neutral-600 disabled:cursor-not-allowed disabled:opacity-60"
          />
          <button
            type="submit"
            disabled={isGhostMode || !chatInput.trim()}
            className="p-2 bg-white text-black hover:bg-neutral-200 disabled:bg-neutral-800 disabled:text-neutral-500 disabled:cursor-not-allowed rounded-md transition-colors"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
        {isGhostMode && (
          <div className="mt-2 text-[11px] text-white/40">
            Ghost mode is on. Chat is disabled.
          </div>
        )}
      </form>
    </div>
  );
}
