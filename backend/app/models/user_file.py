# app/models/user_file.py
from sqlalchemy import Column, Integer, String, ForeignKey, DateTime, func
from sqlalchemy.orm import relationship
from app.db.base import Base


class UserFile(Base):
    __tablename__ = "user_files"

    id = Column(Integer, primary_key=True, index=True)

    user_id = Column(
        Integer,
        ForeignKey("users.id", ondelete="CASCADE"),  # ✅ FIX
        nullable=False
    )

    filename = Column(String, nullable=False)
    path = Column(String, nullable=False)

    created_at = Column(DateTime, server_default=func.now())  # ✅ FIX

    user = relationship("User")
