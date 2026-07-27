from typing import Literal

from pydantic import BaseModel, Field


class ChatMessage(BaseModel):
    role: Literal["user", "assistant"]
    content: str = Field(..., max_length=50_000)


class ChatRequest(BaseModel):
    # The full conversation lives only in the client's memory and is sent
    # with every request. The server never stores it — see routes/chat.py.
    messages: list[ChatMessage] = Field(..., min_length=1, max_length=200)
    voice_mode: bool = False


class HealthResponse(BaseModel):
    status: str
    privacy_mode: bool
