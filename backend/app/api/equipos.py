from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.services.equipo_service import get_equipos, get_jugadores_por_equipo
from app.schemas.equipo import EquipoOut
from app.schemas.jugador import JugadorOut

# ❌ quitamos prefix aquí
router = APIRouter(tags=["Equipos"])

@router.get("/", response_model=list[EquipoOut])
def listar_equipos(db: Session = Depends(get_db)):
    return get_equipos(db)

@router.get("/{equipo_id}/jugadores", response_model=list[JugadorOut])
def jugadores_por_equipo(equipo_id: int, db: Session = Depends(get_db)):
    return get_jugadores_por_equipo(db, equipo_id)