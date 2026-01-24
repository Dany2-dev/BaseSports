import os
from pathlib import Path
from dotenv import load_dotenv

load_dotenv()

# =========================
# BASE
# =========================
BASE_DIR = Path(__file__).resolve().parents[3]

ENV = os.getenv("ENV", "dev")

# =========================
# DATABASE
# =========================
DATABASE_URL = os.getenv(
    "DATABASE_URL",
    f"sqlite:///{BASE_DIR / 'data' / 'datastrike.db'}"
)

# =========================
# SECURITY
# =========================
SECRET_KEY = os.getenv("SECRET_KEY", "dev-secret-key")
ALGORITHM = os.getenv("ALGORITHM", "HS256")
ACCESS_TOKEN_EXPIRE_MINUTES = int(
    os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "10080")
)

# =========================
# GOOGLE AUTH
# =========================
GOOGLE_CLIENT_ID = os.getenv("GOOGLE_CLIENT_ID")
GOOGLE_CLIENT_SECRET = os.getenv("GOOGLE_CLIENT_SECRET")

# =========================
# FRONTEND
# =========================
FRONTEND_URL = os.getenv(
    "FRONTEND_URL",
    "https://base-sports-1168.vercel.app" if ENV == "prod" else "http://localhost:5173"
)
