import os
from dataclasses import dataclass
from functools import lru_cache
from pathlib import Path

ENV_FILE = Path(__file__).with_name(".env")


def _load_env_file(path: Path = ENV_FILE) -> None:
    """Минимальный парсер .env, чтобы не тянуть python-dotenv ради пяти переменных."""
    if not path.is_file():
        return

    for line in path.read_text(encoding="utf-8").splitlines():
        entry = line.strip()
        if not entry or entry.startswith("#") or "=" not in entry:
            continue
        key, _, value = entry.partition("=")
        os.environ.setdefault(key.strip(), value.strip().strip("'\""))


_load_env_file()


def _env_str(name: str, default: str) -> str:
    value = os.getenv(name)
    return value.strip() if value and value.strip() else default


def _env_float(name: str, default: float) -> float:
    try:
        return float(_env_str(name, str(default)))
    except ValueError:
        return default


def _env_list(name: str, default: tuple[str, ...]) -> tuple[str, ...]:
    raw = _env_str(name, "")
    if not raw:
        return default
    return tuple(item.strip() for item in raw.split(",") if item.strip())


@dataclass(frozen=True)
class Settings:
    onec_base_url: str
    onec_timeout: float
    cors_origins: tuple[str, ...]
    work_day_start: str
    work_day_end: str


@lru_cache
def get_settings() -> Settings:
    return Settings(
        onec_base_url=_env_str(
            "ONEC_BASE_URL",
            "http://localhost:8080/spacehub/hs/api/v1",
        ).rstrip("/"),
        onec_timeout=_env_float("ONEC_TIMEOUT", 10.0),
        cors_origins=_env_list(
            "CORS_ORIGINS",
            ("http://localhost:5173", "http://127.0.0.1:5173"),
        ),
        work_day_start=_env_str("WORK_DAY_START", "09:00"),
        work_day_end=_env_str("WORK_DAY_END", "19:00"),
    )
