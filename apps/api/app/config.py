import os


def _parse_origins(value: str) -> list[str]:
    return [origin.strip() for origin in value.split(",") if origin.strip()]


class Settings:
    app_name: str = "BG Remover API"
    cors_origins: list[str] = _parse_origins(
        os.getenv("API_CORS_ORIGINS", "http://localhost:3000")
    )
    max_upload_size_mb: int = int(os.getenv("MAX_UPLOAD_SIZE_MB", "10"))
    rembg_model: str = os.getenv("REMBG_MODEL", "u2netp")

    @property
    def max_upload_size_bytes(self) -> int:
        return self.max_upload_size_mb * 1024 * 1024


settings = Settings()
