# Ahsaan AI

A privacy-first, multilingual voice-to-voice engineering agent. This repo is
a working scaffold: a real Next.js frontend talking to a real streaming
FastAPI backend, structured so the rest of the spec (more languages, more
tools, other voice providers) can be added without a rewrite.

## Architecture

```
ahsaan-ai/
├── backend/                 FastAPI service — the only thing that talks to the LLM
│   ├── app/
│   │   ├── main.py          App entrypoint, CORS, rate limiting
│   │   ├── config.py        Env-driven settings (no hardcoded secrets)
│   │   ├── prompts.py       Builds the system prompt (persona + language mirroring)
│   │   ├── language.py      Cheap heuristic to detect Urdu/Hindi/Roman Urdu/English
│   │   ├── schemas.py       Request/response models
│   │   └── routes/
│   │       ├── chat.py      POST /api/chat — streams tokens over SSE
│   │       └── health.py    GET  /api/health — privacy-mode status for the UI badge
│   └── requirements.txt
│
├── frontend/                 Next.js 14 (App Router) + TypeScript + Tailwind
│   ├── app/                 page.tsx (main screen), layout.tsx (fonts/theme)
│   ├── components/          Sidebar, ChatWindow, MessageBubble, Composer,
│   │                        VoiceButton, SettingsPanel, PrivacyBadge, ThemeToggle
│   └── lib/
│       ├── useChatStream.ts In-memory conversation state + SSE client
│       ├── useSpeech.ts     Web Speech API wrapper (STT + TTS, on-device)
│       └── types.ts
│
└── docker-compose.yml
```

### Why this shape

- **The backend never persists a conversation.** `POST /api/chat` takes the
  full message list from the client, builds a system prompt, streams a
  reply, and returns. No database, no server-side session store, no
  request-body logging (see the comment in `main.py`).
- **The frontend never persists a conversation either.** `useChatStream`
  keeps messages in React state only — no `localStorage`, no cookies. A
  page refresh is a new session, on purpose.
- **Voice runs in the browser.** `useSpeech` uses the native
  `SpeechRecognition` / `SpeechSynthesis` APIs, so audio never leaves the
  user's machine for the default setup. `backend/.env.example` leaves room
  for a server-side STT/TTS provider (Whisper, ElevenLabs, etc.) later —
  swap it in behind the same hook without touching the rest of the UI.
- **Language mirroring, not translation.** `language.py` + `prompts.py`
  detect whether the user is writing in Urdu script, Devanagari, Roman
  Urdu, or English, and tell the model to reply in that same register —
  it never auto-translates.

## Design

Dark by default ("signal board" palette: ink-navy surfaces, an amber
signal accent for active/primary actions, a cool trace-blue for links,
green for "live/speaking" states). Light mode mirrors the same tokens.
Type: Space Grotesk for headings, IBM Plex Sans for body text, JetBrains
Mono for code — set as CSS variables in `globals.css` so the palette and
type scale are the single source of truth. The signature element is the
mic button's concentric pulse rings, doubling as a status indicator for
listening vs. speaking vs. idle.

## Running it locally

**Backend**

```bash
cd backend
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env        # then add your ANTHROPIC_API_KEY
uvicorn app.main:app --reload
```

**Frontend**

```bash
cd frontend
npm install
cp .env.local.example .env.local
npm run dev
```

Open http://localhost:3000. Voice input needs a Chromium-based browser
(Chrome/Edge) — Firefox and Safari have limited `SpeechRecognition`
support as of this writing; the UI degrades gracefully to text-only.

**Or with Docker:**

```bash
cp backend/.env.example backend/.env   # add your key
docker compose up --build
```

## What's implemented vs. roadmap

**Implemented:** streaming chat, voice input/output with barge-in,
English/Urdu/Hindi/Roman Urdu mirroring, markdown + syntax-highlighted
code blocks with copy buttons, dark/light mode, privacy indicator,
per-request rate limiting, Dockerized deploy.

**Roadmap (architected for, not yet built):** file upload + analysis,
sandboxed code execution, project scaffolding ("build me a hospital
management system" → full repo), pluggable cloud STT/TTS providers,
additional LLM providers behind the same `chat.py` interface, and
persistent *opt-in* workspaces for teams that explicitly want history —
kept as a separate, clearly-labeled mode so the default stays
zero-retention.

## Privacy model

This is the one rule everything else bends around: **the backend and
frontend are both stateless with respect to conversation content.** If
you extend this project, keep new features on that side of the line —
add observability by logging method/path/status, not bodies; add
persistence, if ever, as an explicit opt-in the user turns on, not a
default.
