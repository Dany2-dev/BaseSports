import pandas as pd
from pathlib import Path

from app.db.session import SessionLocal
from app.models.equipo import Equipo
from app.models.jugador import Jugador

# ─────────────────────────────
# Rutas
# ─────────────────────────────
BASE_DIR = Path(__file__).resolve().parents[3]

EQUIPOS_EXCEL = BASE_DIR / "data" / "Equipos_logos.xlsx"
JUGADORES_EXCEL = BASE_DIR / "data" / "Jugadores_Cordobez.xlsx"

# ─────────────────────────────
# Utilidades
# ─────────────────────────────
def normalize_columns(df: pd.DataFrame) -> pd.DataFrame:
    df.columns = df.columns.str.strip().str.lower()
    return df.where(pd.notnull(df), None)  # NaN → None

# ─────────────────────────────
# Carga de datos
# ─────────────────────────────
def load_equipos(db, df: pd.DataFrame):
    for _, row in df.iterrows():
        equipo_id = int(row["id_club"])

        if db.query(Equipo).filter(Equipo.id == equipo_id).first():
            continue

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
        jugador_id = int(row["id_jugador"])

        if db.query(Jugador).filter(Jugador.id == jugador_id).first():
            continue

        jugador = Jugador(
            id=jugador_id,                      # 🔑 ID real para stats
            nombre=row["nombre"],
            numero=row["numcamisa"] if "numcamisa" in df.columns else None,
            imagen_url=row["imagen_jugador"] if "imagen_jugador" in df.columns else None,
            equipo_id=int(row["id_club"])       # 🔗 FK correcta
        )
        db.add(jugador)

    db.commit()

# ─────────────────────────────
# Main
# ─────────────────────────────
def main():
    print("📥 Cargando datos desde Excel...")

    db = SessionLocal()

    try:
        df_equipos = normalize_columns(pd.read_excel(EQUIPOS_EXCEL))
        df_jugadores = normalize_columns(pd.read_excel(JUGADORES_EXCEL))

        load_equipos(db, df_equipos)
        load_jugadores(db, df_jugadores)

        print("✅ Datos cargados correctamente")

    except Exception as e:
        print("❌ Error:", e)

    finally:
        db.close()


if __name__ == "__main__":
    main()
