from fastapi import APIRouter

from ..config import get_settings
from ..schemas import HealthResponse

router = APIRouter(tags=["health"])


@router.get("/api/health", response_model=HealthResponse)
async def health() -> HealthResponse:
    settings = get_settings()
    return HealthResponse(status="ok", privacy_mode=settings.privacy_mode)
