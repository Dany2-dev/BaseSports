from sqlalchemy.orm import Session
from sqlalchemy import nulls_last
from app.models.equipo import Equipo
from app.models.jugador import Jugador

def get_equipos(db: Session):
    return db.query(Equipo).order_by(Equipo.nombre).all()

def get_jugadores_por_equipo(db: Session, equipo_id: int):
    return (
        db.query(Jugador)
        .filter(Jugador.equipo_id == equipo_id)
        .order_by(nulls_last(Jugador.numero))  # ✅ FIX
        .all()
    )
