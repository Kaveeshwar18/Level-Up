from fastapi import APIRouter, Depends, status, UploadFile, File
from app.schemas.auth import UserRegister, UserLogin, UserResponse, Token
from app.services.auth import auth_service
from app.routers.dependencies import get_current_user
import base64

router = APIRouter(prefix="/auth", tags=["auth"])

@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
async def register(schema: UserRegister):
    user = await auth_service.register_user(schema)
    return user

@router.post("/login", response_model=Token)
async def login(schema: UserLogin):
    token = await auth_service.authenticate_user(schema)
    return token

@router.get("/me", response_model=UserResponse)
async def me(current_user: dict = Depends(get_current_user)):
    return current_user

@router.post("/me/avatar", response_model=UserResponse)
async def upload_avatar(
    current_user: dict = Depends(get_current_user),
    file: UploadFile = File(...)
):
    contents = await file.read()
    encoded = base64.b64encode(contents).decode("utf-8")
    mime_type = file.content_type or "image/png"
    avatar_data_url = f"data:{mime_type};base64,{encoded}"
    user = await auth_service.update_avatar(current_user["id"], avatar_data_url)
    return user

@router.post("/me/avatar-base64", response_model=UserResponse)
async def upload_avatar_base64(
    data: dict,
    current_user: dict = Depends(get_current_user)
):
    avatar_base64 = data.get("avatar")
    if not avatar_base64:
        from fastapi import HTTPException
        raise HTTPException(status_code=400, detail="Avatar data is required")
    user = await auth_service.update_avatar(current_user["id"], avatar_base64)
    return user
