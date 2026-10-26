"""Маппинг ответов 1С в контракт фронта.

1С отдаёт: id, name, category, capacity, step_minutes, description, location, area,
preview_image, equipment[], specifications[]. Галерея 1С не используется, код, этаж-списком
и занятость не отдаёт — для них подставляются пустые значения, а карточка рисует заглушки.
"""

from typing import Any

from config import get_settings
from schemas import Booking, GalleryImage, Resource, ResourceFeature

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

VALID_STATUSES = frozenset({"busy", "pending", "service", "free", "selected"})

SERVICE_KEYWORDS = (
    "уборк",
    "техобслуж",
    "техническое обслуж",
    "обслуживан",
    "ремонт",
    "клининг",
    "cleaning",
    "maintenance",
    "сервис",
)

STATUS_ALIASES = {
    "свободно": "free",
    "free": "free",
    "выбрано": "selected",
    "selected": "selected",
    "в обработке": "pending",
    "pending": "pending",
    "занято": "busy",
    "busy": "busy",
    "сервис": "service",
    "service": "service",
    "maintenance": "service",
    "техническое обслуживание": "service",
    "техобслуживание": "service",
}

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
    slot_duration_minutes = _as_int(raw.get("step_minutes") or raw.get("stepMinutes")) or 60
    if slot_duration_minutes <= 0:
        slot_duration_minutes = 60

    return Resource(
        id=str(raw.get("id") or ""),
        title=str(raw.get("name") or raw.get("title") or ""),
        code=str(raw.get("code") or ""),
        category=str(raw.get("category") or ""),
        location=str(raw.get("location") or ""),
        capacity=capacity,
        area=area,
        image_url=_preview_image(raw),
        gallery=_gallery(raw.get("gallery")),
        description=str(raw.get("description") or ""),
        features=_features(raw.get("equipment"), capacity, area),
        timeline_start=(
            str(raw.get("work_day_start") or raw.get("workDayStart") or "").strip()
            or settings.work_day_start
        ),
        timeline_end=(
            str(raw.get("work_day_end") or raw.get("workDayEnd") or "").strip()
            or settings.work_day_end
        ),
        slot_duration_minutes=slot_duration_minutes,
        bookings=[],
        instant_booking=bool(raw.get("instant_booking") or raw.get("instantBooking")),
        rules=_as_strings(raw.get("rules")),
        telemetry=str(raw.get("telemetry") or ""),
        tour_url=str(raw.get("tour_url") or raw.get("tourUrl") or ""),
        usage_percent=_as_int(raw.get("usage_percent") or raw.get("usagePercent")),
        peak_hour=str(raw.get("peak_hour") or raw.get("peakHour") or ""),
    )


def _preview_image(raw: dict[str, Any]) -> str:
    """Основное фото 1С — ссылка на внешний хостинг, отдаём как есть."""

    for key in PREVIEW_KEYS:
        value = raw.get(key)
        if isinstance(value, str) and value.strip():
            return value.strip()

    return ""


def _gallery(value: Any) -> list[GalleryImage]:
    if not isinstance(value, list):
        return []
    gallery: list[GalleryImage] = []
    for item in value:
        if isinstance(item, str) and item.strip():
            gallery.append(GalleryImage(url=item.strip()))
        elif isinstance(item, dict) and str(item.get("url") or "").strip():
            gallery.append(GalleryImage(url=str(item["url"]).strip(), caption=str(item.get("caption") or "")))
    return gallery


def _as_strings(value: Any) -> list[str]:
    if not isinstance(value, list):
        return []
    return [str(item).strip() for item in value if str(item).strip()]


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

    status_value = str(raw.get("status") or "busy").strip().lower()
    status = STATUS_ALIASES.get(status_value, status_value)
    if status not in VALID_STATUSES and any(
        keyword in status_value for keyword in SERVICE_KEYWORDS
    ):
        status = "service"
    if status not in VALID_STATUSES:
        status = "busy"

    title = str(raw.get("title") or raw.get("name") or "").strip()
    description = str(raw.get("description") or raw.get("details") or "").strip()
    if status == "busy" and any(
        keyword in f"{title} {description}".lower() for keyword in SERVICE_KEYWORDS
    ):
        status = "service"

    return Booking(
        start=start,
        end=end,
        status=status,
        title=title or str(raw.get("comment") or "").strip(),
        description=description,
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
