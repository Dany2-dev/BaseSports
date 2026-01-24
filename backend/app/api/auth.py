from fastapi import APIRouter, Request, Depends
from fastapi.responses import RedirectResponse

from app.auth.google import oauth
from app.auth.jwt import create_access_token
from app.auth.deps import get_current_user
from app.db.session import get_db
from app.models.user import User
from app.models.user_file import UserFile
from app.core.config import FRONTEND_URL

router = APIRouter(prefix="/auth", tags=["auth"])

@router.get("/login/google")
async def login_google(request: Request):
    redirect_uri = request.url_for("auth_google")
    return await oauth.google.authorize_redirect(request, redirect_uri)

@router.get("/google", name="auth_google")
async def auth_google(request: Request, db=Depends(get_db)):
    token = await oauth.google.authorize_access_token(request)
    userinfo = token["userinfo"]

    user = db.query(User).filter(User.email == userinfo["email"]).first()
    if not user:
        user = User(
            email=userinfo["email"],
            nombre=userinfo["name"],
            google_id=userinfo["sub"],
            avatar_url=userinfo["picture"]
        )
        db.add(user)
        db.commit()
        db.refresh(user)

    jwt_token = create_access_token({"sub": str(user.id)})

    response = RedirectResponse(FRONTEND_URL)
    # Así debería verse al final de tu función de login/callback
    response.set_cookie(
        key="access_token",
        value=jwt_token,
        httponly=True,
        samesite="none",   # ✅
        secure=True,       # ✅ OBLIGATORIO en HTTPS
        path="/"
    )

    return response # <--- ESTO ES VITAL
@router.get("/me")
def me(user: User = Depends(get_current_user)):
    return {
        "id": user.id,
        "email": user.email,
        "nombre": user.nombre,
        "avatar": user.avatar_url
    }

@router.get("/my-files")
def my_files(
    user: User = Depends(get_current_user),
    db=Depends(get_db)
):
    return db.query(UserFile).filter(UserFile.user_id == user.id).all()
