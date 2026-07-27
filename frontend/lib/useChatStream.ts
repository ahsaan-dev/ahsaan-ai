"use client";

import { useCallback, useRef, useState } from "react";
import { Message } from "./types";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";

function uid(): string {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

export interface UseChatStreamResult {
  messages: Message[];
  isStreaming: boolean;
  error: string | null;
  sendMessage: (content: string, voiceMode: boolean) => Promise<void>;
  clearConversation: () => void;
}

/**
 * Conversation state lives only in memory for this component's lifetime.
 * Nothing is written to localStorage, sessionStorage, cookies, or any
 * backend database — refreshing the page or ending the session loses it,
 * by design.
 */
export function useChatStream(onAssistantChunk?: (fullText: string) => void): UseChatStreamResult {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const finalTextRef = useRef<string>("");

  const clearConversation = useCallback(() => {
    setMessages([]);
    setError(null);
  }, []);

  const sendMessage = useCallback(
    async (content: string, voiceMode: boolean) => {
      const trimmed = content.trim();
      if (!trimmed || isStreaming) return;

      setError(null);
      const userMsg: Message = { id: uid(), role: "user", content: trimmed };
      const assistantId = uid();
      const assistantMsg: Message = {
        id: assistantId,
        role: "assistant",
        content: "",
        streaming: true,
      };

      const history = [...messages, userMsg];
      setMessages([...history, assistantMsg]);
      setIsStreaming(true);
      finalTextRef.current = "";

      try {
        const res = await fetch(`${API_BASE}/api/chat`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            messages: history.map((m) => ({ role: m.role, content: m.content })),
            voice_mode: voiceMode,
          }),
        });

        if (!res.ok || !res.body) {
          throw new Error(`Request failed (${res.status})`);
        }

        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let buffer = "";

        // eslint-disable-next-line no-constant-condition
        while (true) {
          const { value, done } = await reader.read();
          if (done) break;
          buffer += decoder.decode(value, { stream: true });

          const lines = buffer.split("\n\n");
          buffer = lines.pop() || "";

          for (const line of lines) {
            const trimmedLine = line.trim();
            if (!trimmedLine.startsWith("data:")) continue;
            const jsonStr = trimmedLine.slice(5).trim();
            if (!jsonStr) continue;

            const event = JSON.parse(jsonStr) as
              | { type: "token"; text: string }
              | { type: "done" }
              | { type: "error"; message: string };

            if (event.type === "token") {
              finalTextRef.current += event.text;
              setMessages((prev) =>
                prev.map((m) =>
                  m.id === assistantId ? { ...m, content: finalTextRef.current } : m
                )
              );
            } else if (event.type === "error") {
              throw new Error(event.message);
            }
          }
        }

        setMessages((prev) =>
          prev.map((m) => (m.id === assistantId ? { ...m, streaming: false } : m))
        );
        onAssistantChunk?.(finalTextRef.current);
      } catch (err) {
        const message = err instanceof Error ? err.message : "Something went wrong.";
        setError(message);
        setMessages((prev) =>
          prev.map((m) =>
            m.id === assistantId
              ? { ...m, streaming: false, content: m.content || `⚠️ ${message}` }
              : m
          )
        );
      } finally {
        setIsStreaming(false);
      }
    },
    [messages, isStreaming, onAssistantChunk]
  );

  return { messages, isStreaming, error, sendMessage, clearConversation };
}
