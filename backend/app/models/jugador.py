from sqlalchemy import Column, Integer, String, ForeignKey
from sqlalchemy.orm import relationship
from app.db.base import Base

class Jugador(Base):
    __tablename__ = "jugadores"

    # 🔑 ESTE ID ES EL MISMO QUE VIENE EN EL CSV DE ESTADÍSTICAS
    id = Column(Integer, primary_key=True, index=True)

    nombre = Column(String, nullable=False)
    numero = Column(Integer, nullable=True)
    imagen_url = Column(String, nullable=True)

    equipo_id = Column(Integer, ForeignKey("equipos.id"), nullable=False)

    equipo = relationship("Equipo", back_populates="jugadores")
