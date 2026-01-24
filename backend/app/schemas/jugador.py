from pydantic import BaseModel

class JugadorOut(BaseModel):
    id: int
    nombre: str
    numero: int | None = None
    imagen_url: str | None = None
    equipo_id: int
    

    class Config:
        from_attributes = True
