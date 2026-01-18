from sqlalchemy import Column, Integer, String, DateTime
from datetime import datetime
from app.db.base import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    nombre = Column(String)
    google_id = Column(String, unique=True)
    avatar_url = Column(String)
    created_at = Column(DateTime, default=datetime.utcnow)
