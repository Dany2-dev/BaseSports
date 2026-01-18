from fastapi import APIRouter, UploadFile, File, Depends, HTTPException
from sqlalchemy.orm import Session
import os, tempfile

from app.db.session import get_db
from app.utils.stats_loader import load_stats
from app.services.stats_service import merge_stats_with_players, filter_stats_by_equipo
from app.services.kpi_service import kpis_por_periodo

router = APIRouter()

def _tmp(file: UploadFile):
    suffix = os.path.splitext(file.filename)[1].lower()
    with tempfile.NamedTemporaryFile(delete=False, suffix=suffix, mode="wb") as tmp:
        tmp.write(file.file.read())
        return tmp.name

@router.post("/by-equipo/{equipo_id}")
def kpis_equipo(
    equipo_id: int,
    file: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    path = _tmp(file)
    try:
        df = load_stats(path)
        merged = merge_stats_with_players(db, df)
        filtered = filter_stats_by_equipo(db, merged, equipo_id)

        if filtered is None or filtered.empty:
            raise HTTPException(status_code=422, detail="No hay datos")

        return kpis_por_periodo(filtered)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
    finally:
        os.remove(path)
