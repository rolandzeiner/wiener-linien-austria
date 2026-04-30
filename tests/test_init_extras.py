"""Coverage for the corners of __init__.py the lifecycle test doesn't reach.

The main lifecycle test (`test_init.py`) covers entry setup/unload and the
reference-counted teardown. The card-registration internals moved to
`tests/test_card_registration.py` after the JSModuleRegistration extraction.
This file fills in:

- Both WebSocket `card_version` handlers
- The HOMEASSISTANT_STARTED-deferred frontend registration
- async_migrate_entry placeholder
- async_unload_entry's "platform unload failed" early return
"""
from __future__ import annotations

from types import SimpleNamespace
from unittest.mock import AsyncMock, MagicMock, patch

from homeassistant.core import CoreState, HomeAssistant

from custom_components.wiener_linien_austria import (
    _websocket_card_version,
    _websocket_retro_card_version,
    async_migrate_entry,
    async_setup,
    async_unload_entry,
)
from custom_components.wiener_linien_austria.const import (
    CARD_VERSION,
    DOMAIN,
    RETRO_CARD_VERSION,
)

from .conftest import make_entry as _make_entry


# ---------------------------------------------------------------------------
# WebSocket card-version handlers
# ---------------------------------------------------------------------------


def _make_connection() -> SimpleNamespace:
    return SimpleNamespace(send_result=MagicMock())


async def test_websocket_modern_card_version(hass: HomeAssistant) -> None:
    """The undecorated handler returns the modern card version."""
    conn = _make_connection()
    # The @async_response decorator turns the public function into a sync
    # scheduler; the actual coroutine is preserved on `__wrapped__`.
    await _websocket_card_version.__wrapped__(hass, conn, {"id": 17, "type": "x"})
    conn.send_result.assert_called_once_with(17, {"version": CARD_VERSION})


async def test_websocket_retro_card_version(hass: HomeAssistant) -> None:
    """The undecorated handler returns the retro card version."""
    conn = _make_connection()
    await _websocket_retro_card_version.__wrapped__(
        hass, conn, {"id": 18, "type": "x"}
    )
    conn.send_result.assert_called_once_with(18, {"version": RETRO_CARD_VERSION})


# ---------------------------------------------------------------------------
# Card registration internals: see tests/test_card_registration.py — the
# logic moved out of __init__.py into a dedicated JSModuleRegistration
# module after the v1.4.0 platinum-baseline pass.
# ---------------------------------------------------------------------------


# ---------------------------------------------------------------------------
# async_setup — HOMEASSISTANT_STARTED listener path
# ---------------------------------------------------------------------------


async def test_setup_defers_frontend_until_started_event(
    hass: HomeAssistant,
) -> None:
    """When HA isn't running yet, registration is deferred to the start event."""
    hass.set_state(CoreState.starting)
    hass.data.pop(DOMAIN, None)

    with patch(
        "custom_components.wiener_linien_austria.JSModuleRegistration.async_register",
        new_callable=AsyncMock,
    ) as register:
        assert await async_setup(hass, {})
        # Not called immediately because HA isn't running.
        register.assert_not_awaited()


# ---------------------------------------------------------------------------
# async_unload_entry — platform-unload-failed early return
# ---------------------------------------------------------------------------


async def test_unload_entry_returns_false_when_platforms_fail(
    hass: HomeAssistant, mock_fetch: AsyncMock
) -> None:
    """If async_unload_platforms returns False, unload short-circuits to False."""
    entry = _make_entry()
    entry.add_to_hass(hass)
    await hass.config_entries.async_setup(entry.entry_id)
    await hass.async_block_till_done()

    with patch.object(
        hass.config_entries,
        "async_unload_platforms",
        new=AsyncMock(return_value=False),
    ):
        assert await async_unload_entry(hass, entry) is False


# ---------------------------------------------------------------------------
# async_migrate_entry — v1 → v2 collapses CONF_LINES triples to pairs
# ---------------------------------------------------------------------------


async def test_migrate_entry_v2_is_noop(hass: HomeAssistant) -> None:
    """An already-current entry passes through unchanged."""
    entry = _make_entry()  # version=2 by default in conftest
    assert await async_migrate_entry(hass, entry) is True


async def test_migrate_entry_collapses_v1_triples_to_pairs(
    hass: HomeAssistant,
) -> None:
    """v1 triples ("U1|R|Oberlaa") are rewritten to pairs ("U1|R")."""
    from pytest_homeassistant_custom_component.common import MockConfigEntry

    from homeassistant.const import CONF_SCAN_INTERVAL

    from custom_components.wiener_linien_austria.const import (
        CONF_DIVA,
        CONF_LINES,
        CONF_RBLS,
        CONF_STOP_NAME,
    )

    entry = MockConfigEntry(
        domain=DOMAIN,
        version=1,
        data={
            CONF_DIVA: 60201012,
            CONF_STOP_NAME: "Stephansplatz",
            CONF_RBLS: [4111, 4118],
            # Two triples for the same (line, direction) — must dedupe to one.
            CONF_LINES: ["U1|R|Oberlaa", "U1|R|Alaudagasse", "U1|H|Leopoldau"],
            CONF_SCAN_INTERVAL: 60,
        },
        title="Stephansplatz",
    )
    entry.add_to_hass(hass)

    assert await async_migrate_entry(hass, entry) is True
    assert entry.version == 2
    # Order preserved (first-seen), duplicates collapsed.
    assert entry.data[CONF_LINES] == ["U1|R", "U1|H"]


async def test_migrate_entry_handles_options_bucket(hass: HomeAssistant) -> None:
    """CONF_LINES living in entry.options (reconfigure path) is migrated too."""
    from pytest_homeassistant_custom_component.common import MockConfigEntry

    from homeassistant.const import CONF_SCAN_INTERVAL

    from custom_components.wiener_linien_austria.const import (
        CONF_DIVA,
        CONF_LINES,
        CONF_RBLS,
        CONF_STOP_NAME,
    )

    entry = MockConfigEntry(
        domain=DOMAIN,
        version=1,
        data={
            CONF_DIVA: 60201012,
            CONF_STOP_NAME: "Stephansplatz",
            CONF_RBLS: [4111],
            CONF_SCAN_INTERVAL: 60,
        },
        options={CONF_LINES: ["U1|H|Leopoldau"]},
        title="Stephansplatz",
    )
    entry.add_to_hass(hass)

    assert await async_migrate_entry(hass, entry) is True
    assert entry.version == 2
    assert entry.options[CONF_LINES] == ["U1|H"]


async def test_migrate_entry_v1_without_lines_just_bumps_version(
    hass: HomeAssistant,
) -> None:
    """Old entries without CONF_LINES still get the version bump."""
    from pytest_homeassistant_custom_component.common import MockConfigEntry

    from homeassistant.const import CONF_SCAN_INTERVAL

    from custom_components.wiener_linien_austria.const import (
        CONF_DIVA,
        CONF_RBLS,
        CONF_STOP_NAME,
    )

    entry = MockConfigEntry(
        domain=DOMAIN,
        version=1,
        data={
            CONF_DIVA: 60201012,
            CONF_STOP_NAME: "Stephansplatz",
            CONF_RBLS: [4111],
            CONF_SCAN_INTERVAL: 60,
        },
        title="Stephansplatz",
    )
    entry.add_to_hass(hass)

    assert await async_migrate_entry(hass, entry) is True
    assert entry.version == 2


async def test_migrate_entry_rejects_future_version(hass: HomeAssistant) -> None:
    """An entry created by a future schema cannot be downgraded."""
    from pytest_homeassistant_custom_component.common import MockConfigEntry

    entry = MockConfigEntry(
        domain=DOMAIN,
        version=99,
        data={},
        title="Future",
    )
    entry.add_to_hass(hass)

    assert await async_migrate_entry(hass, entry) is False
