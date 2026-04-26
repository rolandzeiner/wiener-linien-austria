"""Regression test — every outbound request must carry the canonical User-Agent.

A malformed User-Agent is silent failure (the integration still works, only
upstream log parsers break). This test guards three independent call sites
because each one builds its own headers via base_request_headers():

- the coordinator's `/monitor` fetch (per-tick),
- `alerts._fetch_info_list_for_name` (5-min refresh of trafficInfoList),
- `config_flow._probe_monitor_lines` (live probe during entry creation).

Each site is exercised separately so a refactor that drops the header in
one place can't slip past the other two.
"""
from __future__ import annotations

from unittest.mock import AsyncMock, MagicMock, patch

from homeassistant.core import HomeAssistant
from pytest_homeassistant_custom_component.common import MockConfigEntry

from custom_components.wiener_linien_austria.const import (
    CONF_DIVA,
    CONF_LINES,
    CONF_RBLS,
    CONF_STOP_NAME,
    DOMAIN,
    USER_AGENT,
)


def _ok_response(body: object, status: int = 200) -> MagicMock:
    resp = MagicMock()
    resp.status = status
    resp.headers = {}
    resp.raise_for_status = MagicMock()
    resp.json = AsyncMock(return_value=body)
    return resp


def _make_entry() -> MockConfigEntry:
    return MockConfigEntry(
        domain=DOMAIN,
        data={
            CONF_DIVA: 60201012,
            CONF_STOP_NAME: "Stephansplatz",
            CONF_RBLS: [4111],
            CONF_LINES: ["U1|H|Leopoldau"],
        },
        options={},
        title="Stephansplatz",
    )


async def test_coordinator_monitor_fetch_sends_user_agent(
    hass: HomeAssistant,
) -> None:
    """Coordinator's /monitor fetch carries the canonical User-Agent."""
    from custom_components.wiener_linien_austria.coordinator import (
        WienerLinienAustriaCoordinator,
    )

    entry = _make_entry()
    entry.add_to_hass(hass)
    coordinator = WienerLinienAustriaCoordinator(hass, entry)

    mock_get = AsyncMock(
        return_value=_ok_response({"data": {"monitors": []}, "message": {"messageCode": 1}})
    )
    with patch.object(coordinator._session, "get", new=mock_get):
        await coordinator._async_update_data()

    sent = mock_get.call_args.kwargs["headers"]
    assert sent["User-Agent"] == USER_AGENT


async def test_alerts_fetch_sends_user_agent(hass: HomeAssistant) -> None:
    """alerts._fetch_info_list_for_name carries the canonical User-Agent."""
    from custom_components.wiener_linien_austria.alerts import _fetch_info_list

    session = MagicMock()
    session.get = AsyncMock(return_value=_ok_response({"data": {"trafficInfos": []}}))
    with patch(
        "custom_components.wiener_linien_austria.alerts.async_get_clientsession",
        return_value=session,
    ):
        await _fetch_info_list(hass, "stoerunglang")

    sent = session.get.call_args.kwargs["headers"]
    assert sent["User-Agent"] == USER_AGENT


async def test_config_flow_probe_sends_user_agent(hass: HomeAssistant) -> None:
    """config_flow._probe_monitor_lines carries the canonical User-Agent."""
    from custom_components.wiener_linien_austria.config_flow import (
        _probe_monitor_lines,
    )

    session = MagicMock()
    session.get = AsyncMock(
        return_value=_ok_response({"data": {"monitors": []}, "message": {"messageCode": 1}})
    )
    with patch(
        "custom_components.wiener_linien_austria.config_flow.async_get_clientsession",
        return_value=session,
    ):
        await _probe_monitor_lines(hass, [4111])

    sent = session.get.call_args.kwargs["headers"]
    assert sent["User-Agent"] == USER_AGENT
