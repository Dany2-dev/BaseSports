from dotenv import load_dotenv
load_dotenv()

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from starlette.middleware.sessions import SessionMiddleware

from app.db.session import engine
from app.db.base import Base
from app.api.router import router
from app.core.config import FRONTEND_URL, SECRET_KEY

# Importar modelos (MUY IMPORTANTE)
from app.models.equipo import Equipo
from app.models.jugador import Jugador
from app.models.user import User
from app.models.user_file import UserFile

app = FastAPI(title="DataStrike API")

@app.on_event("startup")
def startup():
    Base.metadata.create_all(bind=engine)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://127.0.0.1:5173",
        "http://localhost:5173",
        FRONTEND_URL,
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

app.include_router(router)

@app.get("/")
def root():
    return {"status": "ok"}
