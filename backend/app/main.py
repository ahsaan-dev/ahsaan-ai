from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded
from slowapi.util import get_remote_address

from .config import get_settings
from .routes import chat, health

settings = get_settings()

limiter = Limiter(key_func=get_remote_address, default_limits=[
    f"{settings.rate_limit_per_minute}/minute"
])

app = FastAPI(
    title="Ahsaan AI",
    description="Privacy-first voice engineering agent — API layer",
    version="0.1.0",
)

app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

app.add_middleware(
    CORSMiddleware,
    allow_origin_regex=r"https://.*\.vercel\.app",
    allow_credentials=False,
    allow_methods=["GET", "POST"],
    allow_headers=["Content-Type"],
)

# Deliberately no request/response logging middleware is registered here.
# If you add observability tooling later, log method + path + status only —
# never request or response bodies — to keep the privacy guarantee real.

app.include_router(health.router)
app.include_router(chat.router)
