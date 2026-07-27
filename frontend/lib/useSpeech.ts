"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { toSpeechLang, VoiceSettings } from "./types";

// Minimal ambient typing for the (still non-standard) SpeechRecognition API.
interface SpeechRecognitionResultLike {
  isFinal: boolean;
  0: { transcript: string };
}
interface SpeechRecognitionEventLike extends Event {
  resultIndex: number;
  results: ArrayLike<SpeechRecognitionResultLike>;
}
interface SpeechRecognitionLike extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start: () => void;
  stop: () => void;
  abort: () => void;
  onresult: ((ev: SpeechRecognitionEventLike) => void) | null;
  onerror: ((ev: Event) => void) | null;
  onend: (() => void) | null;
}

function getRecognitionCtor(): (new () => SpeechRecognitionLike) | null {
  if (typeof window === "undefined") return null;
  const w = window as unknown as Record<string, unknown>;
  return (w.SpeechRecognition || w.webkitSpeechRecognition || null) as
    | (new () => SpeechRecognitionLike)
    | null;
}

export interface UseSpeechResult {
  supported: boolean;
  listening: boolean;
  interimTranscript: string;
  startListening: () => void;
  stopListening: () => void;
  speak: (text: string) => void;
  stopSpeaking: () => void;
  speaking: boolean;
  voices: SpeechSynthesisVoice[];
}

/**
 * All recognition and synthesis happens locally in the browser via the
 * Web Speech API — no audio is sent to any server by this hook. The
 * text transcript is what eventually gets sent to the backend as a
 * normal chat message, same as if the user had typed it.
 */
export function useSpeech(
  settings: VoiceSettings,
  onFinalTranscript: (text: string) => void
): UseSpeechResult {
  const [supported, setSupported] = useState(false);
  const [listening, setListening] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const [interimTranscript, setInterimTranscript] = useState("");
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);

  useEffect(() => {
    const RecognitionCtor = getRecognitionCtor();
    const hasSynthesis = typeof window !== "undefined" && "speechSynthesis" in window;
    setSupported(Boolean(RecognitionCtor) && hasSynthesis);

    if (hasSynthesis) {
      const loadVoices = () => setVoices(window.speechSynthesis.getVoices());
      loadVoices();
      window.speechSynthesis.onvoiceschanged = loadVoices;
    }
  }, []);

  const stopListening = useCallback(() => {
    recognitionRef.current?.stop();
    setListening(false);
  }, []);

  const startListening = useCallback(() => {
    const RecognitionCtor = getRecognitionCtor();
    if (!RecognitionCtor) return;

    // Barge-in: if the assistant is currently speaking, cut it off the
    // moment the user starts talking again.
    if (typeof window !== "undefined" && window.speechSynthesis.speaking) {
      window.speechSynthesis.cancel();
      setSpeaking(false);
    }

    const recognition = new RecognitionCtor();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = toSpeechLang(settings.language);

recognition.onresult = (event: SpeechRecognitionEventLike) => {
      let interim = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        if (!result) continue;
        if (result.isFinal) {
          onFinalTranscript(result[0].transcript.trim());
        } else {
          interim += result[0].transcript;
        }
      }
      setInterimTranscript(interim);
    };

    recognition.onerror = () => {
      setListening(false);
    };

    recognition.onend = () => {
      setListening(false);
      setInterimTranscript("");
    };

    recognitionRef.current = recognition;
    recognition.start();
    setListening(true);
  }, [settings.language, onFinalTranscript]);

  const stopSpeaking = useCallback(() => {
    if (typeof window !== "undefined") {
      window.speechSynthesis.cancel();
    }
    setSpeaking(false);
  }, []);

  const speak = useCallback(
    (text: string) => {
      if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
      if (!settings.autoSpeak) return;

      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = settings.rate;
      utterance.lang = toSpeechLang(settings.language);

      if (settings.voiceURI) {
        const match = voices.find((v) => v.voiceURI === settings.voiceURI);
        if (match) utterance.voice = match;
      }

      utterance.onstart = () => setSpeaking(true);
      utterance.onend = () => setSpeaking(false);
      utterance.onerror = () => setSpeaking(false);

      window.speechSynthesis.speak(utterance);
    },
    [settings.rate, settings.language, settings.voiceURI, settings.autoSpeak, voices]
  );

  return {
    supported,
    listening,
    interimTranscript,
    startListening,
    stopListening,
    speak,
    stopSpeaking,
    speaking,
    voices,
  };
}
