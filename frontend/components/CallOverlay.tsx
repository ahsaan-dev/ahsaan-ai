"use client";

interface CallOverlayProps {
  listening: boolean;
  speaking: boolean;
  muted: boolean;
  interimTranscript: string;
  lastAssistantText: string;
  onToggleMute: () => void;
  onEndCall: () => void;
}

export function CallOverlay({
  listening,
  speaking,
  muted,
  interimTranscript,
  lastAssistantText,
  onToggleMute,
  onEndCall,
}: CallOverlayProps) {
  const state = speaking ? "speaking" : listening ? "listening" : "idle";
  const colorClass =
    state === "speaking" ? "bg-live" : state === "listening" ? "bg-signal" : "bg-trace";

  const caption = interimTranscript || lastAssistantText || "Listening…";

  return (
    <div className="fixed inset-0 z-40 flex flex-col items-center justify-between bg-void/95 px-6 py-12">
      <div className="text-center">
        <p className="font-display text-lg font-semibold text-ink">Ahsaan</p>
        <p className="text-xs text-muted">
          {state === "speaking" ? "Speaking…" : state === "listening" ? "Listening…" : muted ? "Muted" : "Connecting…"}
        </p>
      </div>

      <div className="relative flex h-40 w-40 items-center justify-center">
        {(state === "listening" || state === "speaking") && (
          <>
            <span className={`absolute inset-0 rounded-full ${colorClass} opacity-25 animate-pulse_ring`} />
            <span
              className={`absolute inset-0 rounded-full ${colorClass} opacity-25 animate-pulse_ring`}
              style={{ animationDelay: "0.6s" }}
            />
          </>
        )}
        <span className={`relative flex h-24 w-24 items-center justify-center rounded-full ${colorClass}`}>
          <svg width="32" height="36" viewBox="0 0 24 24" fill="rgb(var(--void))">
            <path d="M12 15a3 3 0 003-3V6a3 3 0 10-6 0v6a3 3 0 003 3z" />
            <path d="M19 11a1 1 0 10-2 0 5 5 0 01-10 0 1 1 0 10-2 0 7 7 0 006 6.92V21a1 1 0 102 0v-3.08A7 7 0 0019 11z" />
          </svg>
        </span>
      </div>

      <p className="max-w-md text-center text-sm text-muted line-clamp-3">{caption}</p>

      <div className="flex items-center gap-4">
        <button
          onClick={onToggleMute}
          className="flex h-14 w-14 items-center justify-center rounded-full border border-border bg-panel text-ink transition hover:bg-panel2"
        >
          {muted ? "🔇" : "🎙️"}
        </button>
        <button
          onClick={onEndCall}
          className="flex h-14 w-14 items-center justify-center rounded-full bg-danger text-void transition hover:opacity-90"
          aria-label="End call"
        >
          ✕
        </button>
      </div>
    </div>
  );
}
