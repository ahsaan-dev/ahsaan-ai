"use client";

import { useState, KeyboardEvent } from "react";
import { VoiceButton } from "./VoiceButton";

interface ComposerProps {
  onSend: (text: string, voiceMode: boolean) => void;
  disabled: boolean;
  voiceSupported: boolean;
  listening: boolean;
  speaking: boolean;
  interimTranscript: string;
  onStartVoice: () => void;
  onStopVoice: () => void;
  onInterruptVoice: () => void;
}

export function Composer({
  onSend,
  disabled,
  voiceSupported,
  listening,
  speaking,
  interimTranscript,
  onStartVoice,
  onStopVoice,
  onInterruptVoice,
}: ComposerProps) {
  const [text, setText] = useState("");

  const submit = () => {
    if (!text.trim() || disabled) return;
    onSend(text, false);
    setText("");
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      submit();
    }
  };

  return (
    <div className="border-t border-border bg-void px-4 py-4">
      {interimTranscript && (
        <div className="mb-2 text-xs italic text-muted">Listening: {interimTranscript}</div>
      )}
      <div className="flex items-end gap-3 rounded-2xl border border-border bg-panel p-2 pl-4">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          rows={1}
          placeholder="Ask Ahsaan to build, debug, or explain something…"
          className="max-h-40 flex-1 resize-none bg-transparent py-2 text-sm text-ink placeholder:text-muted focus:outline-none"
        />
        <VoiceButton
          supported={voiceSupported}
          listening={listening}
          speaking={speaking}
          onStart={onStartVoice}
          onStop={onStopVoice}
          onInterrupt={onInterruptVoice}
        />
        <button
          onClick={submit}
          disabled={disabled || !text.trim()}
          className="flex h-12 shrink-0 items-center justify-center rounded-full bg-signal px-5 text-sm font-medium text-void transition disabled:opacity-40"
        >
          Send
        </button>
      </div>
      <p className="mt-2 text-center text-[11px] text-muted">
        Nothing typed or spoken here is saved once this tab closes.
      </p>
    </div>
  );
}
