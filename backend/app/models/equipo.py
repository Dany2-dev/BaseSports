from sqlalchemy import Column, Integer, String
from sqlalchemy.orm import relationship
from app.db.base import Base

class Equipo(Base):
    __tablename__ = "equipos"

    id = Column(Integer, primary_key=True, index=True)
    nombre = Column(String, unique=True, nullable=False)
    logo_url = Column(String, nullable=True)
    liga = Column(String, nullable=True)

    jugadores = relationship(
        "Jugador",
        back_populates="equipo",
        cascade="all, delete-orphan"  # ✅ FIX
    )
