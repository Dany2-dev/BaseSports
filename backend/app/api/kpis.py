from fastapi import APIRouter, UploadFile, File, Depends, HTTPException
from sqlalchemy.orm import Session
import os
import tempfile
import pandas as pd

from app.db.session import get_db
from app.utils.stats_loader import load_stats
from app.services.stats_service import merge_stats_with_players, filter_stats_by_equipo
from app.services.kpi_service import calcular_kpis

router = APIRouter(prefix="/kpis", tags=["kpis"])

# --- FUNCION AUXILIAR PARA PROCESAR ---
def procesar_datos_kpi(db, equipo_id, df_input=None):
    filtered = filter_stats_by_equipo(db, df_input, equipo_id)

    if filtered is None or (isinstance(filtered, pd.DataFrame) and filtered.empty):
        return None

    event_col = next(
        (c for c in filtered.columns if c.lower() in ["event", "evento", "type"]),
        None
    )

    kpis = calcular_kpis(filtered)
    eventos_dict = []

    if not filtered.empty:
        columnas = ["x", "y", "x2", "y2"]
        if event_col:
            columnas.append(event_col)

        cols_to_use = [c for c in columnas if c in filtered.columns]
        eventos_dict = filtered[cols_to_use].fillna(0).to_dict("records")

    return {**kpis, "eventos": eventos_dict}


# --- ENDPOINT PARA LA TABLA (GET) ---
@router.get("/by-equipo/{equipo_id}")
def get_kpis_equipo(equipo_id: int, db: Session = Depends(get_db)):
    resultado = procesar_datos_kpi(db, equipo_id)
    if not resultado:
        return {"por_jugador": {}, "eventos": []}
    return resultado


# --- ENDPOINT PARA CARGAR EXCEL (POST) ---
@router.post("/by-equipo/{equipo_id}")
def post_kpis_equipo(
    equipo_id: int,
    file: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    suffix = os.path.splitext(file.filename or "")[1].lower() or ".xlsx"

    tmp = tempfile.NamedTemporaryFile(delete=False, suffix=suffix)
    path = tmp.name

    try:
        # Guardar archivo subido
        with open(path, "wb") as f:
            f.write(file.file.read())

        # Cargar Excel (se cierra correctamente en load_stats)
        df = load_stats(path)

        merged = merge_stats_with_players(db, df)
        resultado = procesar_datos_kpi(db, equipo_id, df_input=merged)

        if not resultado:
            raise HTTPException(status_code=422, detail="No hay datos para este equipo")

        return resultado

    finally:
        # Cerrar archivo subido y eliminar temporal
        try:
            file.file.close()
        except Exception:
            pass

        try:
            if os.path.exists(path):
                os.remove(path)
        except PermissionError:
            pass
