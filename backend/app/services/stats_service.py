import pandas as pd
from sqlalchemy.orm import Session
from app.models.jugador import Jugador
from app.models.equipo import Equipo

def normalize_stats(df: pd.DataFrame) -> pd.DataFrame:
    df.columns = df.columns.str.strip().str.lower()
    posibles = ["player", "player_id", "id_jugador", "idjugador", "jugador"]
    for col in posibles:
        if col in df.columns:
            df = df.rename(columns={col: "player_id"})
            break

    if "player_id" not in df.columns:
        raise ValueError("No se encontró columna de jugador")

    df["player_id"] = pd.to_numeric(df["player_id"], errors="coerce")
    return df

def sanitize_df(df: pd.DataFrame) -> pd.DataFrame:
    df.columns = [
        "_".join(map(str, c)) if isinstance(c, tuple) else c
        for c in df.columns
    ]
    return df.loc[:, ~df.columns.duplicated()]

def merge_stats_with_players(db: Session, df_stats: pd.DataFrame):
    df_stats = sanitize_df(normalize_stats(df_stats))

    jugadores = db.query(Jugador).all()
    equipos = db.query(Equipo).all()

    df_jug = pd.DataFrame([
        {
            "player_id": j.id,
            "jugador": j.nombre,
            "imagen_jugador": j.imagen_url,
            "equipo_id": j.equipo_id
        }
        for j in jugadores
    ])

    df_eq = pd.DataFrame([
        {
            "equipo_id": e.id,
            "logo_equipo": e.logo_url
        }
        for e in equipos
    ])

    df_jug["player_id"] = pd.to_numeric(df_jug["player_id"], errors="coerce")
    df_jug["equipo_id"] = pd.to_numeric(df_jug["equipo_id"], errors="coerce")
    df_eq["equipo_id"] = pd.to_numeric(df_eq["equipo_id"], errors="coerce")

    result = (
        df_stats
        .merge(df_jug, on="player_id", how="left")
        .merge(df_eq, on="equipo_id", how="left")
    )

    result["jugador"] = result["jugador"].fillna("Desconocido")
    result["imagen_jugador"] = result["imagen_jugador"].fillna("")

    return result

def filter_stats_by_equipo(df_stats: pd.DataFrame, equipo_id: int):
    if df_stats is None or df_stats.empty:
        return df_stats

    if "equipo_id" not in df_stats.columns:
        return df_stats

    df_stats["equipo_id"] = pd.to_numeric(df_stats["equipo_id"], errors="coerce")
    return df_stats[df_stats["equipo_id"] == equipo_id]
