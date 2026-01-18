from pydantic import BaseModel

class EquipoOut(BaseModel):
    id: int
    nombre: str
    logo_url: str | None = None
    liga: str | None = None

    class Config:
        from_attributes = True
