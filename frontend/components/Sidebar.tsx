"use client";

interface SidebarProps {
  onNewSession: () => void;
  onOpenSettings: () => void;
}

export function Sidebar({ onNewSession, onOpenSettings }: SidebarProps) {
  return (
    <aside className="flex w-16 shrink-0 flex-col items-center gap-4 border-r border-border bg-void py-5">
      <div className="mb-2 flex h-9 w-9 items-center justify-center rounded-lg bg-signal font-display text-sm font-bold text-void">
        A
      </div>

      <button
        onClick={onNewSession}
        title="New session (clears this conversation)"
        className="flex h-10 w-10 items-center justify-center rounded-xl border border-border bg-panel text-muted transition hover:text-ink hover:bg-panel2"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M12 5v14M5 12h14" />
        </svg>
      </button>

      <div className="flex-1" />

      <button
        onClick={onOpenSettings}
        title="Settings"
        className="flex h-10 w-10 items-center justify-center rounded-xl border border-border bg-panel text-muted transition hover:text-ink hover:bg-panel2"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="3" />
          <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 11-2.83 2.83l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09a1.65 1.65 0 00-1-1.51 1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 11-2.83-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09a1.65 1.65 0 001.51-1 1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 112.83-2.83l.06.06a1.65 1.65 0 001.82.33H9a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 112.83 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z" />
        </svg>
      </button>
    </aside>
  );
}
