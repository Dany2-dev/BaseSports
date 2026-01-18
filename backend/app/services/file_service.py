import os
from pathlib import Path
from fastapi import HTTPException
from app.models.user_file import UserFile

UPLOAD_DIR = Path("uploads")
MAX_SIZE_MB = 20

def save_file(db, user, file):
    if not file.filename:
        raise HTTPException(status_code=400, detail="Archivo inválido")

    if hasattr(file, "size") and file.size > MAX_SIZE_MB * 1024 * 1024:
        raise HTTPException(status_code=413, detail="Archivo demasiado grande")

    safe_name = file.filename.replace("..", "").replace("/", "")
    user_dir = UPLOAD_DIR / str(user.id)
    user_dir.mkdir(parents=True, exist_ok=True)

    path = user_dir / safe_name
    with open(path, "wb") as f:
        f.write(file.file.read())

    record = UserFile(
        user_id=user.id,
        filename=safe_name,
        path=str(path)
    )
    db.add(record)
    db.commit()
    db.refresh(record)

    return record
