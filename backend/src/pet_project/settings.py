from pydantic_settings import BaseSettings


class AppSettings(BaseSettings):
    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"
        env_prefix = "app_"

    # MongoDB
    MONGO_DB_URL: str
    MONGO_DB_DB: str
    ALLOWED_ORIGINS: list[str]


settings = AppSettings()  # type: ignore[call-arg]
