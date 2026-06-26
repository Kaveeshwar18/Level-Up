import os
from dotenv import load_dotenv

# Load .env file (used locally)
load_dotenv()


class Settings:
    # MongoDB
    MONGODB_URL: str = os.getenv("MONGODB_URL")
    DATABASE_NAME: str = os.getenv("DATABASE_NAME", "lifetracker")

    # JWT
    JWT_SECRET: str = os.getenv(
        "JWT_SECRET",
        "supersecretjwtkeyforlifetrackerai2026"
    )
    JWT_ALGORITHM: str = os.getenv("JWT_ALGORITHM", "HS256")
    ACCESS_TOKEN_EXPIRE_MINUTES: int = int(
        os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "1440")
    )


settings = Settings()

if not settings.MONGODB_URL:
    raise RuntimeError(
        "MONGODB_URL environment variable is not set!"
    )
