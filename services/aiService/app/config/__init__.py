from pydantic import computed_field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=None)

    BACKEND_BASE_URL: str = "http://localhost"

    @computed_field
    @property
    def USER_AUTH_SERVICE_URL(self) -> str:
        return f"{self.BACKEND_BASE_URL}/api/user/auth"

    GEMINI_API_KEY: str = "YOUR_KEY"


settings = Settings()
