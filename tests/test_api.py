"""Tests for the HA-free transport in api.py.

No `hass` fixture here: the module takes a session and a User-Agent and must
work without Home Assistant. The first test keeps it that way.
"""

from __future__ import annotations

import ast
from pathlib import Path
from typing import Any
from unittest.mock import AsyncMock, MagicMock

import aiohttp
import pytest

from custom_components.wiener_linien_austria import api
from custom_components.wiener_linien_austria.api import (
    ApiConnectionError,
    ApiHttpError,
    ApiPayloadError,
    ApiResponseShapeError,
    ApiTimeoutError,
    WienerLinienApiError,
    fetch_monitor,
    fetch_routing,
    fetch_traffic_info,
    get_json,
    get_text,
)
from custom_components.wiener_linien_austria.batch import _transport_failure

from .conftest import make_response_cm

UA = "test-agent/1.0"


def test_api_module_imports_nothing_from_home_assistant() -> None:
    """api.py may import only the standard library and aiohttp.

    A relative import counts as a violation too: const.py imports Home
    Assistant for its User-Agent, so `from .const import …` would pull HA
    back in through the side door.
    """
    tree = ast.parse(Path(api.__file__).read_text(encoding="utf-8"))
    offenders: list[str] = []
    for node in ast.walk(tree):
        if isinstance(node, ast.ImportFrom):
            if node.level > 0 or (node.module or "").startswith("homeassistant"):
                offenders.append(f"from {'.' * node.level}{node.module or ''}")
        elif isinstance(node, ast.Import):
            offenders += [
                a.name for a in node.names if a.name.startswith("homeassistant")
            ]
    assert offenders == []


def _session(resp: Any) -> MagicMock:
    session = MagicMock(spec=aiohttp.ClientSession)
    session.get = MagicMock(return_value=make_response_cm(resp))
    return session


def _raising_session(err: BaseException) -> MagicMock:
    session = MagicMock(spec=aiohttp.ClientSession)
    session.get = MagicMock(side_effect=err)
    return session


def _json_resp(payload: Any, status: int = 200) -> MagicMock:
    resp = MagicMock()
    resp.status = status
    resp.raise_for_status = MagicMock()
    resp.json = AsyncMock(return_value=payload)
    resp.text = AsyncMock(return_value="a;b\n1;2\n")
    return resp


async def _get(session: MagicMock, **kwargs: Any) -> dict[str, Any]:
    return await get_json(
        session,
        "https://example.invalid/x",
        params=[("a", "1")],
        user_agent=UA,
        timeout_seconds=12,
        **kwargs,
    )


async def test_get_json_sends_identity_headers_and_timeout() -> None:
    session = _session(_json_resp({"ok": True}))
    assert await _get(session) == {"ok": True}
    kwargs = session.get.call_args.kwargs
    assert kwargs["params"] == [("a", "1")]
    assert kwargs["headers"] == {"User-Agent": UA}
    assert kwargs["timeout"].total == 12


async def test_get_json_any_content_type_skips_the_json_check() -> None:
    resp = _json_resp({"ok": True})
    await _get(_session(resp), any_content_type=True)
    resp.json.assert_awaited_once_with(content_type=None)


@pytest.mark.parametrize(
    ("json_error", "message"),
    [
        (
            aiohttp.ContentTypeError(MagicMock(), (), status=200, message="text/plain"),
            "text/plain",
        ),
        (ValueError("Expecting value"), "Expecting value"),
    ],
)
async def test_get_json_undecodable_body_is_a_payload_error(
    json_error: Exception, message: str
) -> None:
    resp = _json_resp(None)
    resp.json = AsyncMock(side_effect=json_error)
    with pytest.raises(ApiPayloadError) as exc:
        await _get(_session(resp))
    assert exc.value.status == 200
    assert message in exc.value.error
    assert not isinstance(exc.value, ApiResponseShapeError)


async def test_get_json_non_object_is_a_shape_error() -> None:
    with pytest.raises(ApiResponseShapeError) as exc:
        await _get(_session(_json_resp([1, 2])))
    assert (exc.value.status, exc.value.got) == (200, "list")
    assert str(exc.value) == "expected an object, got list"


async def test_get_json_http_error_keeps_status_and_reason() -> None:
    resp = _json_resp(None)
    resp.raise_for_status = MagicMock(
        side_effect=aiohttp.ClientResponseError(
            MagicMock(), (), status=503, message=None
        )
    )
    with pytest.raises(ApiHttpError) as exc:
        await _get(_session(resp))
    assert (exc.value.status, exc.value.reason) == (503, "")


@pytest.mark.parametrize("call", ["json", "text"])
@pytest.mark.parametrize(
    ("raised", "expected"),
    [
        (TimeoutError(), ApiTimeoutError),
        (
            aiohttp.ClientResponseError(MagicMock(), (), status=429, message="Slow"),
            ApiHttpError,
        ),
        (aiohttp.ClientConnectionError("refused"), ApiConnectionError),
    ],
)
async def test_transport_errors_map_to_api_errors(
    call: str, raised: BaseException, expected: type[Exception]
) -> None:
    session = _raising_session(raised)
    with pytest.raises(expected) as exc:
        if call == "json":
            await _get(session)
        else:
            await get_text(
                session,
                "https://example.invalid/f.csv",
                user_agent=UA,
                timeout_seconds=30,
            )
    assert exc.value.__cause__ is raised
    assert isinstance(exc.value, WienerLinienApiError)


async def test_timeout_and_connection_errors_carry_their_details() -> None:
    with pytest.raises(ApiTimeoutError) as timeout:
        await _get(_raising_session(TimeoutError()))
    assert timeout.value.seconds == 12

    with pytest.raises(ApiConnectionError) as conn:
        await _get(_raising_session(aiohttp.ClientConnectionError("refused")))
    assert (conn.value.error_type, conn.value.error) == (
        "ClientConnectionError",
        "refused",
    )


async def test_get_text_returns_the_body() -> None:
    session = _session(_json_resp(None))
    body = await get_text(
        session, api.STATIC_FILES["linien"], user_agent=UA, timeout_seconds=30
    )
    assert body == "a;b\n1;2\n"
    assert session.get.call_args.kwargs["headers"] == {"User-Agent": UA}


async def test_endpoint_helpers_build_the_documented_requests() -> None:
    session = _session(_json_resp({}))

    await fetch_monitor(session, [1471, 4206], user_agent=UA, timeout_seconds=5)
    args, kwargs = session.get.call_args
    assert args == (f"{api.API_BASE_URL}{api.MONITOR_ENDPOINT}",)
    assert kwargs["params"] == [("stopId", "1471"), ("stopId", "4206")]

    await fetch_traffic_info(
        session, ["stoerunglang", "aufzugsinfo"], user_agent=UA, timeout_seconds=5
    )
    args, kwargs = session.get.call_args
    assert args == (f"{api.API_BASE_URL}{api.TRAFFIC_INFO_ENDPOINT}",)
    assert kwargs["params"] == [("name", "stoerunglang"), ("name", "aufzugsinfo")]

    resp = _json_resp({})
    session = _session(resp)
    await fetch_routing(
        session,
        api.ROUTING_DEPARTURE_ENDPOINT,
        [("outputFormat", "JSON")],
        user_agent=UA,
        timeout_seconds=5,
    )
    args, kwargs = session.get.call_args
    assert args == (f"{api.ROUTING_BASE_URL}{api.ROUTING_DEPARTURE_ENDPOINT}",)
    assert kwargs["params"] == [("outputFormat", "JSON")]
    # The routing server labels its JSON text/html.
    resp.json.assert_awaited_once_with(content_type=None)


@pytest.mark.parametrize(
    ("err", "key", "placeholders"),
    [
        (ApiTimeoutError(30), "api_timeout", {"seconds": "30"}),
        (
            ApiHttpError(503, "Service Unavailable"),
            "api_http_error",
            {"status": "503", "reason": "Service Unavailable"},
        ),
        (
            ApiResponseShapeError(200, "list"),
            "api_invalid_response",
            {"status": "200", "error": "expected object, got list"},
        ),
        (
            ApiPayloadError(200, "Expecting value"),
            "api_invalid_response",
            {"status": "200", "error": "Expecting value"},
        ),
        (
            ApiConnectionError(aiohttp.ClientConnectionError("refused")),
            "api_connection_error",
            {"error_type": "ClientConnectionError", "error": "refused"},
        ),
        (
            WienerLinienApiError("unforeseen"),
            "api_invalid_response",
            {"status": "0", "error": "WienerLinienApiError: unforeseen"},
        ),
    ],
)
def test_batch_keeps_its_translation_contract(
    err: WienerLinienApiError, key: str, placeholders: dict[str, str]
) -> None:
    """Keys and placeholders are what strings.json and outage.classify read.

    They are the ones the batch group raised before the request moved here,
    so the wording of each key's message stays as it was.
    """
    failed = _transport_failure(err)
    assert failed.translation_key == key
    assert failed.translation_placeholders == placeholders
