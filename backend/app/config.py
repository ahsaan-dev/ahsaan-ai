from functools import lru_cache
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    environment: str = "development"
    allowed_origins: str = "http://localhost:3000"

    groq_api_key: str = ""
    llm_model: str = "llama-3.3-70b-versatile"
    llm_max_tokens: int = 4096

    rate_limit_per_minute: int = 30
    privacy_mode: bool = True

    whisper_api_key: str = ""
    tts_provider_api_key: str = ""

    @property
    def cors_origins(self) -> list[str]:
        return [o.strip() for o in self.allowed_origins.split(",") if o.strip()]


@lru_cache
def get_settings() -> Settings:
    return Settings()
