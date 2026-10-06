import asyncio
from typing import Any

import httpx

# Транзиентные сетевые сбои: закрытое keep-alive соединение, кратковременный
# обрыв, отказ в соединении. Для них достаточно повторить запрос.
RETRY_ATTEMPTS = 3
RETRY_BACKOFF_SECONDS = 0.2


class OneCError(Exception):
    """Базовая ошибка обмена с веб-сервером 1С."""


class OneCUnavailable(OneCError):
    """Веб-сервер 1С не поднят, не отвечает или отдал таймаут."""


class OneCHttpError(OneCError):
    """1С ответила с кодом 4xx/5xx."""

    def __init__(self, status_code: int, detail: str) -> None:
        super().__init__(detail)
        self.status_code = status_code
        self.detail = detail


class OneCClient:
    def __init__(
        self,
        base_url: str,
        timeout: float,
        keepalive_expiry: float = 5.0,
    ) -> None:
        self._base_url = base_url.rstrip("/")
        self._http = httpx.AsyncClient(
            timeout=timeout,
            # 1С во внутренней сети: системный/HTTP_PROXY не должен перехватывать запрос
            trust_env=False,
            limits=httpx.Limits(keepalive_expiry=keepalive_expiry),
        )

    async def close(self) -> None:
        await self._http.aclose()

    async def get_json(
        self,
        path: str,
        params: dict[str, Any] | None = None,
    ) -> Any:
        return await self._request("GET", path, params=params)

    async def post_json(self, path: str, payload: Any) -> Any:
        return await self._request("POST", path, json=payload)

    async def _request(
        self,
        method: str,
        path: str,
        *,
        params: dict[str, Any] | None = None,
        json: Any = None,
    ) -> Any:
        url = f"{self._base_url}/{path.lstrip('/')}"
        failure: httpx.RequestError | None = None

        for attempt in range(1, RETRY_ATTEMPTS + 1):
            try:
                response = await self._http.request(method, url, params=params, json=json)
            except httpx.TimeoutException as exc:
                failure = exc
            except httpx.RequestError as exc:
                failure = exc
            else:
                if response.status_code >= 400:
                    raise OneCHttpError(response.status_code, _extract_detail(response))

                if not response.content:
                    return None

                try:
                    return response.json()
                except ValueError:
                    return None

            if attempt < RETRY_ATTEMPTS:
                await _sleep(RETRY_BACKOFF_SECONDS * attempt)

        raise OneCUnavailable(f"1С недоступна ({url}): {_reason(failure)}") from failure


def _reason(error: httpx.RequestError | None) -> str:
    if error is None:
        return "неизвестная ошибка"

    text = str(error).strip()
    label = type(error).__name__
    return f"{label}: {text}" if text else label


async def _sleep(seconds: float) -> None:
    await asyncio.sleep(seconds)


def _extract_detail(response: httpx.Response) -> str:
    try:
        payload = response.json()
    except ValueError:
        return response.text.strip() or f"HTTP {response.status_code}"

    if isinstance(payload, dict):
        for key in ("detail", "error", "message", "description"):
            detail = payload.get(key)
            if isinstance(detail, str) and detail:
                return detail

    return f"HTTP {response.status_code}: {payload}"
