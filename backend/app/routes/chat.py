import json

from anthropic import AsyncAnthropic
from fastapi import APIRouter, HTTPException, Request
from fastapi.responses import StreamingResponse

from ..config import get_settings
from ..language import detect_language_hint
from ..prompts import build_system_prompt
from ..schemas import ChatRequest

router = APIRouter(prefix="/api/chat", tags=["chat"])


def _client() -> AsyncAnthropic:
    settings = get_settings()
    if not settings.anthropic_api_key:
        raise HTTPException(
            status_code=500,
            detail="ANTHROPIC_API_KEY is not configured on the server.",
        )
    return AsyncAnthropic(api_key=settings.anthropic_api_key)


@router.post("")
async def chat(payload: ChatRequest, request: Request):
    """
    Streams the assistant's reply as Server-Sent Events.

    Privacy note: this handler never writes `payload` to a database, file,
    or log line. The conversation exists only for the lifetime of this
    request — the client is responsible for holding history in memory and
    resending it each turn (see frontend/lib/useChatStream.ts).
    """
    settings = get_settings()
    client = _client()

    last_user_message = next(
        (m.content for m in reversed(payload.messages) if m.role == "user"), ""
    )
    language_hint = detect_language_hint(last_user_message)
    system_prompt = build_system_prompt(language_hint, voice_mode=payload.voice_mode)

    anthropic_messages = [
        {"role": m.role, "content": m.content} for m in payload.messages
    ]

    async def event_stream():
        try:
            async with client.messages.stream(
                model=settings.llm_model,
                max_tokens=settings.llm_max_tokens,
                system=system_prompt,
                messages=anthropic_messages,
            ) as stream:
                async for text in stream.text_stream:
                    yield f"data: {json.dumps({'type': 'token', 'text': text})}\n\n"
            yield f"data: {json.dumps({'type': 'done'})}\n\n"
        except Exception as exc:  # noqa: BLE001 — surfaced to client, not logged with content
            yield f"data: {json.dumps({'type': 'error', 'message': str(exc)})}\n\n"

    return StreamingResponse(
        event_stream(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-store",
            "X-Accel-Buffering": "no",
        },
    )
