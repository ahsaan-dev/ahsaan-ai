"use client";

import { SupportedLanguage, VoiceSettings } from "@/lib/types";

interface SettingsPanelProps {
  open: boolean;
  onClose: () => void;
  settings: VoiceSettings;
  onChange: (settings: VoiceSettings) => void;
  voices: SpeechSynthesisVoice[];
}

const LANGUAGES: { value: SupportedLanguage; label: string }[] = [
  { value: "auto", label: "Auto-detect" },
  { value: "en", label: "English" },
  { value: "ur", label: "Urdu (اردو)" },
  { value: "hi", label: "Hindi (हिन्दी)" },
  { value: "roman-ur", label: "Roman Urdu" },
];

export function SettingsPanel({ open, onClose, settings, onChange, voices }: SettingsPanelProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-30 flex justify-end bg-black/30" onClick={onClose}>
      <div
        onClick={(e) => e.stopPropagation()}
        className="h-full w-full max-w-sm border-l border-border bg-void p-6"
      >
        <div className="mb-6 flex items-center justify-between">
          <h2 className="font-display text-lg font-semibold text-ink">Settings</h2>
          <button onClick={onClose} className="text-muted hover:text-ink">
            ✕
          </button>
        </div>

        <div className="space-y-6 text-sm">
          <div>
            <label className="mb-1.5 block text-muted">Conversation language</label>
            <select
              value={settings.language}
              onChange={(e) => onChange({ ...settings, language: e.target.value as SupportedLanguage })}
              className="w-full rounded-lg border border-border bg-panel px-3 py-2 text-ink"
            >
              {LANGUAGES.map((l) => (
                <option key={l.value} value={l.value}>
                  {l.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1.5 flex items-center justify-between text-muted">
              <span>Speak replies aloud</span>
              <input
                type="checkbox"
                checked={settings.autoSpeak}
                onChange={(e) => onChange({ ...settings, autoSpeak: e.target.checked })}
              />
            </label>
          </div>

          <div>
            <label className="mb-1.5 block text-muted">Speaking speed — {settings.rate.toFixed(2)}x</label>
            <input
              type="range"
              min={0.5}
              max={2}
              step={0.05}
              value={settings.rate}
              onChange={(e) => onChange({ ...settings, rate: Number(e.target.value) })}
              className="w-full accent-signal"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-muted">Voice</label>
            <select
              value={settings.voiceURI ?? ""}
              onChange={(e) => onChange({ ...settings, voiceURI: e.target.value || null })}
              className="w-full rounded-lg border border-border bg-panel px-3 py-2 text-ink"
            >
              <option value="">System default</option>
              {voices.map((v) => (
                <option key={v.voiceURI} value={v.voiceURI}>
                  {v.name} ({v.lang})
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>
    </div>
  );
}
