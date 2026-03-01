import os
from typing import Optional
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    # App
    APP_NAME: str = "CertifyPro"
    VERSION: str = "1.0.0"
    ENV: str = os.getenv("ENV", "development")
    DEBUG: bool = ENV == "development"

    # API
    API_V1_PREFIX: str = "/api/v1"
    CORS_ORIGINS: list = ["http://localhost:3000", "http://localhost:8000"]

    # Database
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./certificator.db")

    # PDF & Playwright
    PDF_OUTPUT_DPI: int = 300
    PDF_TEMP_DIR: str = "./temp"
    UPLOADS_DIR: str = "./uploads"

    # Limits
    MAX_FILE_SIZE: int = 50 * 1024 * 1024  # 50MB
    CHUNK_SIZE: int = 1024 * 1024  # 1MB

    class Config:
        env_file = ".env"
        case_sensitive = True


settings = Settings()
