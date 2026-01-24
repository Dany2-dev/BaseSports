from datetime import datetime, timedelta
from jose import jwt
from app.core.config import SECRET_KEY, ALGORITHM, ACCESS_TOKEN_EXPIRE_MINUTES

def create_access_token(data: dict):
    to_encode = data.copy()

    now = datetime.utcnow()
    to_encode.update({
        "iat": int(now.timestamp()),  # ✅ FIX
        "exp": int((now + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)).timestamp())  # ✅ FIX
    })

    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
