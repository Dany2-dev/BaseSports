import pandas as pd
from pathlib import Path

from app.db.session import SessionLocal
from app.models.equipo import Equipo
from app.models.jugador import Jugador

# ─────────────────────────────
# Rutas
# ─────────────────────────────
BASE_DIR = Path(__file__).resolve().parents[3]

EQUIPOS_EXCEL = BASE_DIR / "data" / "Equipos.xlsx"
JUGADORES_EXCEL = BASE_DIR / "data" / "LigaPremier.xlsx"

# ─────────────────────────────
# Utilidades
# ─────────────────────────────
def normalize_columns(df: pd.DataFrame) -> pd.DataFrame:
    df.columns = df.columns.str.strip().str.lower()
    return df.where(pd.notnull(df), None)  # NaN → None

# ─────────────────────────────
# Limpieza de tablas
# ─────────────────────────────
def clear_tables(db):
    print("🧹 Eliminando datos anteriores...")
    db.query(Jugador).delete()
    db.query(Equipo).delete()
    db.commit()

# ─────────────────────────────
# Carga de datos
# ─────────────────────────────
def load_equipos(db, df: pd.DataFrame):
    for _, row in df.iterrows():
        equipo_id = int(row["id_club"])

        equipo = Equipo(
            id=equipo_id,
            nombre=row["nombre_equipo"],
            logo_url=row["imagen_logo"] if "imagen_logo" in df.columns else None,
            liga=None
        )
        db.add(equipo)

    db.commit()


def load_jugadores(db, df: pd.DataFrame):
    for _, row in df.iterrows():
        jugador = Jugador(
            id=int(row["id_jugador"]),          # 🔑 ID compuesto
            nombre=row["nombre"],
            numero=row["numcamisa"] if "numcamisa" in df.columns else None,
            imagen_url=row["imagen_jugador"] if "imagen_jugador" in df.columns else None,
            equipo_id=int(row["id_club"])       # 🔗 FK
        )
        db.add(jugador)

    db.commit()

# ─────────────────────────────
# Main
# ─────────────────────────────
def main():
    print("🚀 Iniciando carga desde Excel...")

    db = SessionLocal()

    try:
        clear_tables(db)

        df_equipos = normalize_columns(pd.read_excel(EQUIPOS_EXCEL))
        df_jugadores = normalize_columns(pd.read_excel(JUGADORES_EXCEL))

        load_equipos(db, df_equipos)
        load_jugadores(db, df_jugadores)

        print("✅ Datos cargados correctamente")

    except Exception as e:
        db.rollback()
        print("❌ Error:", e)

    finally:
        db.close()


if __name__ == "__main__":
    main()
import pandas as pd
from pathlib import Path

from app.db.session import SessionLocal
from app.models.equipo import Equipo
from app.models.jugador import Jugador

# ─────────────────────────────
# Rutas
# ─────────────────────────────
BASE_DIR = Path(__file__).resolve().parents[3]

EQUIPOS_EXCEL = BASE_DIR / "data" / "Equipos.xlsx"
JUGADORES_EXCEL = BASE_DIR / "data" / "LigaPremier_G2_IdJugadorActualizado.xlsx"

# ─────────────────────────────
# Utilidades
# ─────────────────────────────
def normalize_columns(df: pd.DataFrame) -> pd.DataFrame:
    df.columns = df.columns.str.strip().str.lower()
    return df.where(pd.notnull(df), None)  # NaN → None

# ─────────────────────────────
# Limpieza (SOLO jugadores)
# ─────────────────────────────
def clear_jugadores(db):
    print("🧹 Eliminando jugadores anteriores...")
    db.query(Jugador).delete()
    db.commit()

# ─────────────────────────────
# Carga de equipos (se respeta)
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
            logo_url=row["imagen_logo"] if "imagen_logo" in df.columns else None,
            liga=None
        )
        db.add(equipo)

    db.commit()

# ─────────────────────────────
# Upsert de jugadores (UPDATE / INSERT)
# ─────────────────────────────
def upsert_jugadores(db, df: pd.DataFrame):
    for _, row in df.iterrows():
        jugador_id = int(row["id_jugador"])

        jugador = db.query(Jugador).filter(Jugador.id == jugador_id).first()

        if jugador:
            # UPDATE
            jugador.nombre = row["nombre"]
            jugador.numero = row.get("numcamisa")
            jugador.imagen_url = row.get("imagen_jugador")
            jugador.equipo_id = int(row["id_club"])
        else:
            # INSERT
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
# Main
# ─────────────────────────────
def main():
    print("🚀 Actualizando jugadores desde Excel...")

    db = SessionLocal()

    try:
        df_equipos = normalize_columns(pd.read_excel(EQUIPOS_EXCEL))
        df_jugadores = normalize_columns(pd.read_excel(JUGADORES_EXCEL))

        load_equipos(db, df_equipos)
        clear_jugadores(db)
        upsert_jugadores(db, df_jugadores)

        print("✅ Jugadores actualizados correctamente")

    except Exception as e:
        db.rollback()
        print("❌ Error:", e)

    finally:
        db.close()

if __name__ == "__main__":
    main()
