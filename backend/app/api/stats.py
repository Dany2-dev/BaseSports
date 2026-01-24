from fastapi import APIRouter, UploadFile, File, Depends, HTTPException
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.utils.stats_loader import load_stats
from app.services.stats_service import (
    merge_stats_with_players,
    filter_stats_by_equipo
)
import tempfile, os, gc

router = APIRouter()

def _load_tmp_file(file: UploadFile) -> str:
    suffix = os.path.splitext(file.filename)[1].lower()
    with tempfile.NamedTemporaryFile(delete=False, suffix=suffix, mode="wb") as tmp:
        tmp.write(file.file.read())
        return tmp.name


@router.post("/upload")
def upload_stats(
    file: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    path = _load_tmp_file(file)
    try:
        df = load_stats(path)
        merged = merge_stats_with_players(db, df)
        res = merged.fillna("").to_dict(orient="records")
        del df
        return res
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
    finally:
        try:
            file.file.close()          # ✅ FIX
        except Exception:
            pass
        gc.collect()
        if os.path.exists(path):
            try:
                os.remove(path)
            except:
                pass


@router.post("/by-equipo/{equipo_id}")
def stats_por_equipo(
    equipo_id: int,
    file: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    path = _load_tmp_file(file)
    try:
        df = load_stats(path)
        merged = merge_stats_with_players(db, df)
        filtered = filter_stats_by_equipo(db, merged, equipo_id)
        res = filtered.fillna("").to_dict(orient="records")
        del df
        return res
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
    finally:
        try:
            file.file.close()          # ✅ FIX
        except Exception:
            pass
        gc.collect()
        if os.path.exists(path):
            try:
                os.remove(path)
            except:
                pass
