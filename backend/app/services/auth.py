from datetime import datetime, timezone
from fastapi import HTTPException, status
from app.repositories.mongodb import user_repository
from app.schemas.auth import UserRegister, UserLogin
from app.utils.auth import get_password_hash, verify_password, create_access_token

class AuthService:
    async def register_user(self, schema: UserRegister) -> dict:
        # Check if email exists
        existing_user = await user_repository.find_one({"email": schema.email})
        if existing_user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email is already registered"
            )
        
        user_data = {
            "name": schema.name,
            "email": schema.email,
            "password": get_password_hash(schema.password),
            "avatar": None,
            "createdAt": datetime.now(timezone.utc)
        }
        
        created_user = await user_repository.create(user_data)
        return created_user

    async def authenticate_user(self, schema: UserLogin) -> dict:
        user = await user_repository.find_one({"email": schema.email})
        if not user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Incorrect email or password",
                headers={"WWW-Authenticate": "Bearer"},
            )
        
        if not verify_password(schema.password, user["password"]):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Incorrect email or password",
                headers={"WWW-Authenticate": "Bearer"},
            )
        
        access_token = create_access_token(data={"sub": user["id"], "email": user["email"]})
        return {
            "access_token": access_token,
            "token_type": "bearer"
        }

    async def get_user_by_id(self, user_id: str) -> dict:
        user = await user_repository.get_by_id(user_id)
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )
        return user

    async def update_avatar(self, user_id: str, avatar_data: str) -> dict:
        user = await user_repository.update(user_id, {"avatar": avatar_data})
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )
        return user

auth_service = AuthService()
