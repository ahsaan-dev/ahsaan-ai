export type Role = "user" | "assistant";

export interface Message {
  id: string;
  role: Role;
  content: string;
  /** true while a streaming assistant reply is still arriving */
  streaming?: boolean;
}

export type SupportedLanguage = "auto" | "en" | "ur" | "hi" | "roman-ur";

export interface VoiceSettings {
  enabled: boolean;
  language: SupportedLanguage;
  rate: number; // 0.5–2.0, speaking speed
  voiceURI: string | null; // selected SpeechSynthesisVoice.voiceURI
  autoSpeak: boolean; // speak assistant replies aloud automatically
}

export const DEFAULT_VOICE_SETTINGS: VoiceSettings = {
  enabled: true,
  language: "auto",
  rate: 1,
  voiceURI: null,
  autoSpeak: true,
};

/** Maps our language selector to a BCP-47 tag for the Web Speech API. */
export function toSpeechLang(lang: SupportedLanguage): string {
  switch (lang) {
    case "ur":
      return "ur-PK";
    case "hi":
      return "hi-IN";
    case "roman-ur":
      // No dedicated tag exists for Roman Urdu; English recognition
      // handles Latin-script Urdu reasonably well.
      return "en-PK";
    case "en":
      return "en-US";
    default:
      return "en-US";
  }
}
