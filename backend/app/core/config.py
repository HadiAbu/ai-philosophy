from typing import Literal

from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    turso_url: str
    turso_auth_token: str
    jwt_secret_key: str
    jwt_algorithm: str = "HS256"
    access_token_expire_minutes: int = 15
    refresh_token_expire_days: int = 7
    cors_origins: list[str] = ["http://localhost:5173"]
    environment: Literal["development", "production"] = "development"
    require_auth: bool = True

    class Config:
        env_file = ".env"


settings = Settings()
