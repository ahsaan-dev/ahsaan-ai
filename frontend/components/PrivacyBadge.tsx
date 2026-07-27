"use client";

import { useState } from "react";

export function PrivacyBadge() {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-1.5 rounded-full border border-border bg-panel px-3 py-1.5 text-xs font-medium text-live transition hover:bg-panel2"
      >
        <span className="relative flex h-2 w-2">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-live opacity-60" />
          <span className="relative inline-flex h-2 w-2 rounded-full bg-live" />
        </span>
        Privacy mode
      </button>

      {open && (
        <div className="absolute right-0 z-20 mt-2 w-72 rounded-xl border border-border bg-panel p-4 text-sm shadow-xl">
          <p className="font-display font-semibold text-ink">Nothing outlives this tab.</p>
          <ul className="mt-2 space-y-1.5 text-muted">
            <li>• No conversation is written to a database.</li>
            <li>• Voice is recognized and spoken locally in your browser.</li>
            <li>• Uploaded files are used only for this session.</li>
            <li>• Closing or refreshing the tab discards everything.</li>
          </ul>
        </div>
      )}
    </div>
  );
}
