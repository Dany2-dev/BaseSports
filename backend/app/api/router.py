from fastapi import APIRouter

from app.api.equipos import router as equipos_router
from app.api.stats import router as stats_router
from app.api.kpis import router as kpis_router
from app.api.auth import router as auth_router
from app.api.files import router as files_router

# Prefijo global /api
router = APIRouter(prefix="/api")

# Subrutas
router.include_router(auth_router)
router.include_router(files_router)
router.include_router(equipos_router, prefix="/equipos", tags=["Equipos"])
router.include_router(stats_router, prefix="/stats", tags=["Stats"])
router.include_router(kpis_router)