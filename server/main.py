import logging
from collections.abc import AsyncIterator
from contextlib import asynccontextmanager
from logging import getLogger
from typing import Annotated, Any

from fastapi import Depends, FastAPI, Query, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from config import get_settings
from mappers import bookings_from_onec, resource_from_onec
from onec import OneCClient, OneCError, OneCHttpError, OneCUnavailable
from schemas import Booking, Resource

logger = getLogger("spacehub.gateway")
settings = get_settings()


@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncIterator[None]:
    app.state.onec = OneCClient(settings.onec_base_url, settings.onec_timeout)
    try:
        yield
    finally:
        await app.state.onec.close()


app = FastAPI(title="SpaceHub API Gateway", version="1.0.0", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=list(settings.cors_origins),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


def get_onec(request: Request) -> OneCClient:
    return request.app.state.onec


OneCDep = Annotated[OneCClient, Depends(get_onec)]


@app.exception_handler(OneCUnavailable)
async def handle_onec_unavailable(request: Request, exc: OneCUnavailable) -> JSONResponse:
    # Трассировку в терминал отдаём только на DEBUG-уровне, иначе каждый
    # недоступный запрос засыпает лог на 40 строк.
    logger.warning(
        "1С недоступна на %s: %s",
        request.url.path,
        exc,
        exc_info=logger.isEnabledFor(logging.DEBUG),
    )
    return JSONResponse(status_code=503, content={"detail": str(exc)})


@app.exception_handler(OneCHttpError)
async def handle_onec_http_error(request: Request, exc: OneCHttpError) -> JSONResponse:
    logger.warning("1С ответила ошибкой %s на %s: %s", exc.status_code, request.url.path, exc.detail)
    return JSONResponse(status_code=exc.status_code, content={"detail": exc.detail})


@app.get("/health")
async def health(onec: OneCDep) -> dict[str, str]:
    try:
        await onec.get_json("/resources")
    except OneCError:
        return {"status": "degraded", "onec": "unavailable"}
    return {"status": "ok", "onec": "available"}


@app.get("/api/resources", response_model=list[Resource])
async def get_resources(onec: OneCDep) -> list[Resource]:
    return [resource_from_onec(item) for item in _as_items(await onec.get_json("/resources"))]


@app.get("/api/slots", response_model=list[Booking])
async def get_slots(
    onec: OneCDep,
    resource_id: str,
    date: str | None = Query(default=None),
) -> list[Booking]:
    params: dict[str, Any] = {"resource_id": resource_id}
    if date:
        params["date"] = date

    return bookings_from_onec(await onec.get_json("/slots", params=params))


@app.post("/api/bookings")
async def create_booking(payload: dict[str, Any], onec: OneCDep) -> Any:
    """Контракт POST /bookings 1С пока не описан — тело проксируется как есть."""
    return await onec.post_json("/bookings", payload)


def _as_items(payload: Any) -> list[dict[str, Any]]:
    if isinstance(payload, list):
        return [item for item in payload if isinstance(item, dict)]
    if isinstance(payload, dict):
        for key in ("items", "resources", "data", "value"):
            value = payload.get(key)
            if isinstance(value, list):
                return [item for item in value if isinstance(item, dict)]
    return []
