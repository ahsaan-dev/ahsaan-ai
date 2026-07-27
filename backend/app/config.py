"""
Central configuration.

Everything here comes from environment variables (see .env.example).
No config value is ever persisted back to disk, and no user content
is ever read from or written to this module.
"""
from functools import lru_cache

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    environment: str = "development"
    allowed_origins: str = "http://localhost:3000"

    anthropic_api_key: str = ""
    llm_model: str = "claude-sonnet-4-6"
    llm_max_tokens: int = 4096

    rate_limit_per_minute: int = 30

    # When true, no request/response body is ever logged and no
    # conversation content touches disk. This should stay true in
    # every real deployment; it exists as a config flag only so it
    # can be audited, not so it can be safely turned off.
    privacy_mode: bool = True

    whisper_api_key: str = ""
    tts_provider_api_key: str = ""

    @property
    def cors_origins(self) -> list[str]:
        return [o.strip() for o in self.allowed_origins.split(",") if o.strip()]


@lru_cache
def get_settings() -> Settings:
    return Settings()
