import json

from openai import AsyncOpenAI
from fastapi import APIRouter, HTTPException, Request
from fastapi.responses import StreamingResponse

from ..config import get_settings
from ..language import detect_language_hint
from ..prompts import build_system_prompt
from ..schemas import ChatRequest

router = APIRouter(prefix="/api/chat", tags=["chat"])


def _client() -> AsyncOpenAI:
    settings = get_settings()
    if not settings.groq_api_key:
        raise HTTPException(
            status_code=500,
            detail="GROQ_API_KEY is not configured on the server.",
        )
    return AsyncOpenAI(
        api_key=settings.groq_api_key,
        base_url="https://api.groq.com/openai/v1",
    )


@router.post("")
async def chat(payload: ChatRequest, request: Request):
    settings = get_settings()
    client = _client()

    last_user_message = next(
        (m.content for m in reversed(payload.messages) if m.role == "user"), ""
    )
    language_hint = detect_language_hint(last_user_message)
    system_prompt = build_system_prompt(language_hint, voice_mode=payload.voice_mode)

    openai_messages = [{"role": "system", "content": system_prompt}] + [
        {"role": m.role, "content": m.content} for m in payload.messages
    ]

    async def event_stream():
        try:
            stream = await client.chat.completions.create(
                model=settings.llm_model,
                max_tokens=settings.llm_max_tokens,
                messages=openai_messages,
                stream=True,
            )
            async for chunk in stream:
                delta = chunk.choices[0].delta.content
                if delta:
                    yield f"data: {json.dumps({'type': 'token', 'text': delta})}\n\n"
            yield f"data: {json.dumps({'type': 'done'})}\n\n"
        except Exception as exc:  # noqa: BLE001
            yield f"data: {json.dumps({'type': 'error', 'message': str(exc)})}\n\n"

    return StreamingResponse(
        event_stream(),
        media_type="text/event-stream",
        headers={"Cache-Control": "no-store", "X-Accel-Buffering": "no"},
    )
