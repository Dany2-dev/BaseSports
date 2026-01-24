from dotenv import load_dotenv
load_dotenv()

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from starlette.middleware.sessions import SessionMiddleware

from app.db.session import engine
from app.db.base import Base
from app.api.router import router
from app.core.config import FRONTEND_URL, SECRET_KEY

# Importar modelos (OBLIGATORIO para crear tablas)
from app.models.equipo import Equipo
from app.models.jugador import Jugador
from app.models.user import User
from app.models.user_file import UserFile

app = FastAPI(title="DataStrike API")

# ─────────────────────────────
# Startup: crear tablas + seed Excel
# ─────────────────────────────
@app.on_event("startup")
def startup():
    # Crear tablas
    Base.metadata.create_all(bind=engine)

    # Cargar datos iniciales desde Excel (solo si DB está vacía)
    from app.scripts.load_excel import seed_if_empty
    seed_if_empty()

# ─────────────────────────────
# Middlewares
# ─────────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://base-sports-1168-18fax8hev-dany2-devs-projects.vercel.app",
        "https://base-sports-1168.vercel.app",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)



app.add_middleware(
    SessionMiddleware,
    secret_key=SECRET_KEY,
    same_site="lax",
    https_only=False
)

# ─────────────────────────────
# Rutas
# ─────────────────────────────
app.include_router(router)

@app.get("/")
def root():
    return {"status": "ok"}
