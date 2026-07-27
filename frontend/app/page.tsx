"use client";

import { useCallback, useState } from "react";
import { Sidebar } from "@/components/Sidebar";
import { ChatWindow } from "@/components/ChatWindow";
import { Composer } from "@/components/Composer";
import { PrivacyBadge } from "@/components/PrivacyBadge";
import { ThemeToggle } from "@/components/ThemeToggle";
import { SettingsPanel } from "@/components/SettingsPanel";
import { useChatStream } from "@/lib/useChatStream";
import { useSpeech } from "@/lib/useSpeech";
import { DEFAULT_VOICE_SETTINGS, VoiceSettings } from "@/lib/types";

export default function Home() {
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [voiceSettings, setVoiceSettings] = useState<VoiceSettings>(DEFAULT_VOICE_SETTINGS);
  const [lastTurnWasVoice, setLastTurnWasVoice] = useState(false);

  const { messages, isStreaming, error, sendMessage, clearConversation } = useChatStream(
    (fullText) => {
      if (lastTurnWasVoice) speak(fullText);
    }
  );

  const handleFinalTranscript = useCallback(
    (text: string) => {
      if (!text) return;
      setLastTurnWasVoice(true);
      sendMessage(text, true);
    },
    [sendMessage]
  );

  const {
    supported: voiceSupported,
    listening,
    interimTranscript,
    startListening,
    stopListening,
    speak,
    stopSpeaking,
    speaking,
    voices,
  } = useSpeech(voiceSettings, handleFinalTranscript);

  const handleTextSend = (text: string, voiceMode: boolean) => {
    setLastTurnWasVoice(voiceMode);
    sendMessage(text, voiceMode);
  };

  return (
    <main className="flex h-screen bg-void">
      <Sidebar onNewSession={clearConversation} onOpenSettings={() => setSettingsOpen(true)} />

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex items-center justify-between border-b border-border px-6 py-3">
          <div>
            <h1 className="font-display text-sm font-semibold text-ink">Ahsaan AI</h1>
            <p className="text-xs text-muted">Voice engineering agent</p>
          </div>
          <div className="flex items-center gap-2">
            {error && <span className="text-xs text-danger">{error}</span>}
            <PrivacyBadge />
            <ThemeToggle />
          </div>
        </header>

        <ChatWindow messages={messages} onSuggestion={(s) => handleTextSend(s, false)} />

        <Composer
          onSend={handleTextSend}
          disabled={isStreaming}
          voiceSupported={voiceSupported}
          listening={listening}
          speaking={speaking}
          interimTranscript={interimTranscript}
          onStartVoice={startListening}
          onStopVoice={stopListening}
          onInterruptVoice={stopSpeaking}
        />
      </div>

      <SettingsPanel
        open={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        settings={voiceSettings}
        onChange={setVoiceSettings}
        voices={voices}
      />
    </main>
  );
}
