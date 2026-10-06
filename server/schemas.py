from pydantic import BaseModel, ConfigDict, Field
from pydantic.alias_generators import to_camel


class ResourceFeature(BaseModel):
    """Чип на карточке ресурса (icon подбирается из текста подписи)."""

    model_config = ConfigDict(alias_generator=to_camel, populate_by_name=True)

    icon: str = ""
    label: str


class Booking(BaseModel):
    """Занятый интервал для мини-таймлайна карточки."""

    model_config = ConfigDict(alias_generator=to_camel, populate_by_name=True)

    start: str = ""
    end: str = ""
    status: str = "busy"
    title: str = ""


class Resource(BaseModel):
    """Контракт ресурса для фронта (структура 1:1 с ResourceCard)."""

    model_config = ConfigDict(alias_generator=to_camel, populate_by_name=True)

    id: str
    title: str = ""
    code: str = ""
    category: str = ""
    location: str = ""
    capacity: int | None = None
    area: float | None = None
    image_url: str = ""
    description: str = ""
    features: list[ResourceFeature] = Field(default_factory=list)
    timeline_start: str = ""
    timeline_end: str = ""
    bookings: list[Booking] = Field(default_factory=list)
    instant_booking: bool = False
