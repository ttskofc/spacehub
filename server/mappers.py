"""Маппинг ответов 1С в контракт фронта.

1С отдаёт: id, name, category, capacity, step_minutes, description, location, area,
preview_image, equipment[], specifications[]. Галерея 1С не используется, код, этаж-списком
и занятость не отдаёт — для них подставляются пустые значения, а карточка рисует заглушки.
"""

from typing import Any

from config import get_settings
from schemas import Booking, Resource, ResourceFeature

ICON_RULES: tuple[tuple[str, tuple[str, ...]], ...] = (
    ("capacity", ("чел", "мест", "вместим")),
    ("area", ("м²", "м2", "кв. м", "квм")),
    ("display", ("проектор", "projector")),
    ("screen", ("тв", "экран", "дисплей", "монитор", "led")),
    ("vcs", ("камер", "webex", "zoom", "teams", "вкс", "видеосвяз", "стрим")),
    ("wifi", ("wi-fi", "wi fi", "wifi")),
    ("whiteboard", ("доска", "флипчарт", "маркер")),
    ("acoustics", ("шум", "дб", "db", "акуст", "изоляц")),
    ("climate", ("климат", "температур", "кондиц")),
    ("speakers", ("спикер", "колонк", "акустическ")),
    ("audio", ("микрофон", "мик", "shure", "rodecaster", "sennheiser", "звуковой пульт")),
    ("light", ("софтбокс", "свет", "лайт", "осветит")),
    ("hotdog", ("кофе", "перекус")),
    ("blinds", ("сцена")),
)

# Чипы, которые уже показывают вместимость — отдельный «N чел.» тогда не нужен.
CAPACITY_LIKE_ICONS = frozenset({"capacity", "speakers"})

VALID_STATUSES = frozenset({"busy", "pending", "maintenance", "free"})

START_KEYS = ("start", "from", "begin", "starts_at", "start_time", "date_start")
END_KEYS = ("end", "to", "finish", "ends_at", "end_time", "date_end")

PREVIEW_KEYS = (
    "preview_image",
    "previewImage",
    "image_url",
    "imageUrl",
    "main_photo",
    "mainPhoto",
    "photo",
)


def resource_from_onec(raw: dict[str, Any]) -> Resource:
    settings = get_settings()
    capacity = _as_int(raw.get("capacity"))
    area = _as_float(raw.get("area"))

    return Resource(
        id=str(raw.get("id") or ""),
        title=str(raw.get("name") or raw.get("title") or ""),
        code=str(raw.get("code") or ""),
        category=str(raw.get("category") or ""),
        location=str(raw.get("location") or ""),
        capacity=capacity,
        area=area,
        image_url=_preview_image(raw),
        description=str(raw.get("description") or ""),
        features=_features(raw.get("equipment"), capacity, area),
        timeline_start=settings.work_day_start,
        timeline_end=settings.work_day_end,
        bookings=[],
        instant_booking=bool(raw.get("instant_booking") or raw.get("instantBooking")),
    )


def _preview_image(raw: dict[str, Any]) -> str:
    """Основное фото 1С — ссылка на внешний хостинг, отдаём как есть."""

    for key in PREVIEW_KEYS:
        value = raw.get(key)
        if isinstance(value, str) and value.strip():
            return value.strip()

    return ""


def bookings_from_onec(raw: Any) -> list[Booking]:
    """1С отдаёт список занятых интервалов; формат полей пока не зафиксирован,
    поэтому время и статус читаются терпимо, лишнее отбрасывается."""

    if not isinstance(raw, list):
        return []

    bookings: list[Booking] = []
    for item in raw:
        if not isinstance(item, dict):
            continue
        booking = _booking_from_onec(item)
        if booking is not None:
            bookings.append(booking)

    return sorted(bookings, key=lambda booking: booking.start)


def _features(
    equipment: Any,
    capacity: int | None,
    area: float | None,
) -> list[ResourceFeature]:
    features: list[ResourceFeature] = []
    icons: set[str] = set()

    for item in equipment or []:
        label = str(item).strip()
        if not label:
            continue
        icon = _icon_for(label)
        features.append(ResourceFeature(icon=icon, label=label))
        if icon:
            icons.add(icon)


    header: list[ResourceFeature] = []
    if capacity is not None and not CAPACITY_LIKE_ICONS & icons:
        header.append(ResourceFeature(icon="capacity", label=f"{_numeral(capacity)} чел."))
    if area is not None and "area" not in icons:
        header.append(ResourceFeature(icon="area", label=f"{_numeral(area)} м²"))

    return header + features


def _booking_from_onec(raw: dict[str, Any]) -> Booking | None:
    start = _extract_time(raw, START_KEYS)
    end = _extract_time(raw, END_KEYS)
    if not start or not end or start >= end:
        return None

    status = str(raw.get("status") or "busy").strip().lower()
    if status not in VALID_STATUSES:
        status = "busy"

    return Booking(
        start=start,
        end=end,
        status=status,
        title=str(raw.get("title") or raw.get("name") or raw.get("comment") or ""),
    )


def _extract_time(raw: dict[str, Any], keys: tuple[str, ...]) -> str:
    for key in keys:
        value = raw.get(key)
        if isinstance(value, str) and value.strip():
            return _to_hhmm(value)
    return ""


def _to_hhmm(value: str) -> str:
    text = value.strip()
    if "T" in text:
        text = text.split("T", 1)[1]
    elif " " in text:
        text = text.split(" ", 1)[1]

    parts = text.split(":")
    if len(parts) >= 2 and parts[0].strip().isdigit() and parts[1].strip().isdigit():
        return f"{int(parts[0]):02d}:{int(parts[1]):02d}"

    return text


def _icon_for(label: str) -> str:
    lowered = label.lower()
    for icon, needles in ICON_RULES:
        if any(needle in lowered for needle in needles):
            return icon
    return ""


def _as_int(value: Any) -> int | None:
    try:
        return int(float(value))
    except (TypeError, ValueError):
        return None


def _as_float(value: Any) -> float | None:
    try:
        return float(value)
    except (TypeError, ValueError):
        return None


def _numeral(value: float) -> str:
    return str(int(value)) if float(value).is_integer() else f"{value:g}"
