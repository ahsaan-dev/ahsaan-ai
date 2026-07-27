"use client";

import { useEffect, useRef } from "react";
import { Message } from "@/lib/types";
import { MessageBubble } from "./MessageBubble";

const SUGGESTIONS = [
  "Build a REST API for a hospital management system",
  "Mera login system crash ho raha hai, help karo",
  "आर्किटेक्चर समझाइए इस प्रोजेक्ट का",
  "Review this function for edge cases",
];

export function ChatWindow({
  messages,
  onSuggestion,
}: {
  messages: Message[];
  onSuggestion: (text: string) => void;
}) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  if (messages.length === 0) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-6 px-6 text-center">
        <div>
          <h1 className="font-display text-2xl font-semibold text-ink">
            What are we building today?
          </h1>
          <p className="mt-2 text-sm text-muted">
            Speak or type — Ahsaan works in English, Urdu, Hindi, and Roman Urdu.
          </p>
        </div>
        <div className="grid w-full max-w-lg grid-cols-1 gap-2 sm:grid-cols-2">
          {SUGGESTIONS.map((s) => (
            <button
              key={s}
              onClick={() => onSuggestion(s)}
              className="rounded-xl border border-border bg-panel px-4 py-3 text-left text-sm text-muted transition hover:text-ink hover:bg-panel2"
            >
              {s}
            </button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 space-y-4 overflow-y-auto px-4 py-6 sm:px-8">
      <div className="mx-auto max-w-3xl space-y-4">
        {messages.map((m) => (
          <MessageBubble key={m.id} message={m} />
        ))}
        <div ref={bottomRef} />
      </div>
    </div>
  );
}
