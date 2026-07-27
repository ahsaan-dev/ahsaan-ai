"use client";

interface VoiceButtonProps {
  supported: boolean;
  listening: boolean;
  speaking: boolean;
  onStart: () => void;
  onStop: () => void;
  onInterrupt: () => void;
}

export function VoiceButton({
  supported,
  listening,
  speaking,
  onStart,
  onStop,
  onInterrupt,
}: VoiceButtonProps) {
  if (!supported) {
    return (
      <div className="text-xs text-muted px-2">
        Voice isn&apos;t supported in this browser — try Chrome or Edge.
      </div>
    );
  }

  const handleClick = () => {
    if (speaking) {
      onInterrupt();
      return;
    }
    if (listening) {
      onStop();
    } else {
      onStart();
    }
  };

  const state = speaking ? "speaking" : listening ? "listening" : "idle";
  const colorClass =
    state === "listening" ? "bg-signal" : state === "speaking" ? "bg-live" : "bg-trace";

  return (
    <button
      onClick={handleClick}
      aria-label={
        state === "speaking" ? "Interrupt" : state === "listening" ? "Stop listening" : "Start voice input"
      }
      className="relative flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-border bg-panel transition hover:bg-panel2"
    >
      {(state === "listening" || state === "speaking") && (
        <>
          <span className={`absolute inset-0 rounded-full ${colorClass} opacity-30 animate-pulse_ring`} />
          <span
            className={`absolute inset-0 rounded-full ${colorClass} opacity-30 animate-pulse_ring`}
            style={{ animationDelay: "0.5s" }}
          />
        </>
      )}
      <span className={`relative flex h-8 w-8 items-center justify-center rounded-full ${colorClass}`}>
        {state === "speaking" ? (
          <svg width="14" height="14" viewBox="0 0 24 24" fill="rgb(var(--void))">
            <rect x="6" y="6" width="12" height="12" rx="2" />
          </svg>
        ) : (
          <svg width="14" height="16" viewBox="0 0 24 24" fill="rgb(var(--void))">
            <path d="M12 15a3 3 0 003-3V6a3 3 0 10-6 0v6a3 3 0 003 3z" />
            <path d="M19 11a1 1 0 10-2 0 5 5 0 01-10 0 1 1 0 10-2 0 7 7 0 006 6.92V21a1 1 0 102 0v-3.08A7 7 0 0019 11z" />
          </svg>
        )}
      </span>
    </button>
  );
}
