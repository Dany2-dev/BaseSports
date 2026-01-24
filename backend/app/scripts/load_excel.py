import pandas as pd
from pathlib import Path

from app.db.session import SessionLocal
from app.models.equipo import Equipo
from app.models.jugador import Jugador

# ─────────────────────────────
# Rutas (CORRECTAS PARA GIT + RAILWAY)
# ─────────────────────────────
BASE_DIR = Path.cwd()          # En Railway = /app
DATA_DIR = BASE_DIR / "data"

EQUIPOS_EXCEL = DATA_DIR / "Equipos.xlsx"
JUGADORES_EXCEL = DATA_DIR / "LigaPremier.xlsx"

# ─────────────────────────────
# Utilidades
# ─────────────────────────────
def normalize_columns(df: pd.DataFrame) -> pd.DataFrame:
    df.columns = df.columns.str.strip().str.lower()
    return df.where(pd.notnull(df), None)

# ─────────────────────────────
# Carga de equipos (sin duplicar)
# ─────────────────────────────
def load_equipos(db, df: pd.DataFrame):
    for _, row in df.iterrows():
        equipo_id = int(row["id_club"])

        existe = db.query(Equipo).filter(Equipo.id == equipo_id).first()
        if existe:
            continue

        equipo = Equipo(
            id=equipo_id,
            nombre=row["nombre_equipo"],
            logo_url=row.get("imagen_logo"),
            liga=None
        )
        db.add(equipo)

    db.commit()

# ─────────────────────────────
# Upsert de jugadores
# ─────────────────────────────
def upsert_jugadores(db, df: pd.DataFrame):
    for _, row in df.iterrows():
        jugador_id = int(row["id_jugador"])

        jugador = db.query(Jugador).filter(Jugador.id == jugador_id).first()

        if jugador:
            jugador.nombre = row["nombre"]
            jugador.numero = row.get("numcamisa")
            jugador.imagen_url = row.get("imagen_jugador")
            jugador.equipo_id = int(row["id_club"])
        else:
            jugador = Jugador(
                id=jugador_id,
                nombre=row["nombre"],
                numero=row.get("numcamisa"),
                imagen_url=row.get("imagen_jugador"),
                equipo_id=int(row["id_club"])
            )
            db.add(jugador)

    db.commit()

# ─────────────────────────────
# Seed seguro (Railway / Producción)
# ─────────────────────────────
def seed_if_empty():
    db = SessionLocal()
    try:
        print("📂 DATA_DIR:", DATA_DIR)
        print("📄 Equipos.xlsx existe:", EQUIPOS_EXCEL.exists())
        print("📄 LigaPremier.xlsx existe:", JUGADORES_EXCEL.exists())

        if not EQUIPOS_EXCEL.exists() or not JUGADORES_EXCEL.exists():
            raise FileNotFoundError("❌ No se encontraron los archivos Excel en /data")

        if db.query(Equipo).count() == 0:
            print("🌱 Base vacía, cargando datos desde Excel...")

            df_equipos = normalize_columns(pd.read_excel(EQUIPOS_EXCEL))
            df_jugadores = normalize_columns(pd.read_excel(JUGADORES_EXCEL))

            load_equipos(db, df_equipos)
            upsert_jugadores(db, df_jugadores)

            print("✅ Datos cargados correctamente")
        else:
            print("ℹ️ Datos ya existen, no se recargan")

    except Exception as e:
        db.rollback()
        print("❌ Error cargando datos:", e)

    finally:
        db.close()
