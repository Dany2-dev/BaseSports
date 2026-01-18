from fastapi import APIRouter, UploadFile, File, Depends
from sqlalchemy.orm import Session

from app.auth.deps import get_current_user
from app.db.session import get_db
from app.services.file_service import save_file

router = APIRouter(prefix="/files", tags=["files"])

@router.post("/upload")
def upload_file(
    file: UploadFile = File(...),
    user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    record = save_file(db, user, file)
    return {
        "id": record.id,
        "filename": record.filename
    }
