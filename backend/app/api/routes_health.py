from fastapi import APIRouter
from app.config import settings
from app.hindsight.client import hindsight_service
from app.llm.client import llm_service
from app.schemas import HealthResponse

router = APIRouter()

@router.get("/health", response_model=HealthResponse)
def get_health_status():
    hindsight_stat = "Connected (Live)" if hindsight_service.is_live else "Configured (Demo Fallback Mode)" if settings.ALLOW_DEMO_FALLBACK else "Not Configured"
    llm_stat = "Connected (Live)" if llm_service.is_live else "Configured (Demo Mode)" if settings.ALLOW_DEMO_FALLBACK else "Not Configured"

    return HealthResponse(
        status="OK",
        backend="OK",
        llm=llm_stat,
        llm_model=settings.GROQ_MODEL if settings.is_groq_configured else "Deterministic Engine (Demo Mode)",
        hindsight=hindsight_stat,
        hindsight_base_url=settings.HINDSIGHT_BASE_URL,
        hindsight_bank_id=settings.HINDSIGHT_BANK_ID,
        database="Connected (SQLite)",
        is_demo_mode=not (hindsight_service.is_live and llm_service.is_live)
    )
