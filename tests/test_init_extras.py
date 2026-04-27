"""Coverage for the corners of __init__.py the lifecycle test doesn't reach.

The main lifecycle test (`test_init.py`) covers entry setup/unload and the
reference-counted teardown. This file fills in:

- Both WebSocket `card_version` handlers
- Card JS file-not-found path
- Lovelace resource upsert (storage mode, with/without existing item)
- The HOMEASSISTANT_STARTED-deferred frontend registration
- async_migrate_entry placeholder
- async_unload_entry's "platform unload failed" early return
"""
from __future__ import annotations

from pathlib import Path
from types import SimpleNamespace
from typing import Any
from unittest.mock import AsyncMock, MagicMock, patch

import pytest
from homeassistant.core import CoreState, HomeAssistant

from custom_components.wiener_linien_austria import (
    _async_register_one_card,
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
# _async_register_one_card — file missing / lovelace branches
# ---------------------------------------------------------------------------


async def test_register_one_card_file_missing_warns_and_returns(
    hass: HomeAssistant, caplog: pytest.LogCaptureFixture
) -> None:
    """Non-existent filename → log a warning, do nothing else."""
    fake_http = SimpleNamespace(async_register_static_paths=AsyncMock())
    object.__setattr__(hass, "http", fake_http)

    caplog.clear()
    await _async_register_one_card(
        hass, "/x/y.js", "9.9", "definitely-not-a-real-file.js"
    )
    fake_http.async_register_static_paths.assert_not_awaited()
    assert any("Card JS not found" in r.message for r in caplog.records)


def _ensure_card_file_exists() -> str:
    """Pick a card filename that actually ships in www/."""
    www_dir = (
        Path(__file__).resolve().parent.parent
        / "custom_components"
        / "wiener_linien_austria"
        / "www"
    )
    candidates = list(www_dir.glob("*.js"))
    if not candidates:
        pytest.skip("no built card JS to register against")
    return candidates[0].name


def _make_lovelace(
    *,
    mode: str = "storage",
    items: list[dict[str, Any]] | None = None,
) -> SimpleNamespace:
    resources = SimpleNamespace(
        async_load=AsyncMock(),
        async_items=MagicMock(return_value=items or []),
        async_create_item=AsyncMock(),
        async_update_item=AsyncMock(),
        async_delete_item=AsyncMock(),
    )
    return SimpleNamespace(mode=mode, resources=resources)


async def test_register_one_card_no_lovelace_returns(
    hass: HomeAssistant,
) -> None:
    """Lovelace not in hass.data → static path registered, resource skipped."""
    fname = _ensure_card_file_exists()
    fake_http = SimpleNamespace(async_register_static_paths=AsyncMock())
    object.__setattr__(hass, "http", fake_http)
    hass.data.pop("lovelace", None)

    await _async_register_one_card(hass, "/wla/test.js", "1.0", fname)
    fake_http.async_register_static_paths.assert_awaited_once()


async def test_register_one_card_yaml_mode_skips_resource(
    hass: HomeAssistant,
) -> None:
    """YAML mode owns its resources via files; we must not touch them."""
    fname = _ensure_card_file_exists()
    lovelace = _make_lovelace(mode="yaml")
    hass.data["lovelace"] = lovelace
    object.__setattr__(
        hass, "http", SimpleNamespace(async_register_static_paths=AsyncMock())
    )
    await _async_register_one_card(hass, "/wla/test.js", "1.0", fname)
    lovelace.resources.async_load.assert_not_awaited()
    lovelace.resources.async_create_item.assert_not_awaited()


async def test_register_one_card_no_resources_attr(
    hass: HomeAssistant,
) -> None:
    """Lovelace without `.resources` (older HA shapes) → graceful skip."""
    fname = _ensure_card_file_exists()
    hass.data["lovelace"] = SimpleNamespace(mode="storage")  # no .resources
    object.__setattr__(
        hass, "http", SimpleNamespace(async_register_static_paths=AsyncMock())
    )
    await _async_register_one_card(hass, "/wla/test.js", "1.0", fname)
    # Nothing to assert except that it didn't raise — the function returns.


async def test_register_one_card_creates_when_no_existing(
    hass: HomeAssistant,
) -> None:
    """Storage mode, no existing resource → create with versioned URL."""
    fname = _ensure_card_file_exists()
    lovelace = _make_lovelace(items=[])
    hass.data["lovelace"] = lovelace
    object.__setattr__(
        hass, "http", SimpleNamespace(async_register_static_paths=AsyncMock())
    )

    await _async_register_one_card(hass, "/wla/test.js", "9.9", fname)
    lovelace.resources.async_create_item.assert_awaited_once()
    payload = lovelace.resources.async_create_item.call_args.args[0]
    assert payload["res_type"] == "module"
    assert payload["url"] == "/wla/test.js?v=9.9"


async def test_register_one_card_updates_when_version_stale(
    hass: HomeAssistant,
) -> None:
    """Existing resource with older version → update_item with new URL."""
    fname = _ensure_card_file_exists()
    lovelace = _make_lovelace(
        items=[{"id": "r-1", "url": "/wla/test.js?v=0.0.1"}]
    )
    hass.data["lovelace"] = lovelace
    object.__setattr__(
        hass, "http", SimpleNamespace(async_register_static_paths=AsyncMock())
    )

    await _async_register_one_card(hass, "/wla/test.js", "9.9", fname)
    lovelace.resources.async_update_item.assert_awaited_once()
    item_id, payload = lovelace.resources.async_update_item.call_args.args
    assert item_id == "r-1"
    assert payload["url"] == "/wla/test.js?v=9.9"
    lovelace.resources.async_create_item.assert_not_awaited()


async def test_register_one_card_noop_when_version_matches(
    hass: HomeAssistant,
) -> None:
    """Existing resource at current version → no create, no update."""
    fname = _ensure_card_file_exists()
    lovelace = _make_lovelace(
        items=[{"id": "r-1", "url": "/wla/test.js?v=9.9"}]
    )
    hass.data["lovelace"] = lovelace
    object.__setattr__(
        hass, "http", SimpleNamespace(async_register_static_paths=AsyncMock())
    )

    await _async_register_one_card(hass, "/wla/test.js", "9.9", fname)
    lovelace.resources.async_create_item.assert_not_awaited()
    lovelace.resources.async_update_item.assert_not_awaited()


async def test_register_one_card_update_falls_back_to_delete_create(
    hass: HomeAssistant,
) -> None:
    """If async_update_item raises, fall back to delete+recreate."""
    fname = _ensure_card_file_exists()
    lovelace = _make_lovelace(
        items=[{"id": "r-1", "url": "/wla/test.js?v=0.0.1"}]
    )
    lovelace.resources.async_update_item = AsyncMock(side_effect=RuntimeError("x"))
    hass.data["lovelace"] = lovelace
    object.__setattr__(
        hass, "http", SimpleNamespace(async_register_static_paths=AsyncMock())
    )

    await _async_register_one_card(hass, "/wla/test.js", "9.9", fname)
    lovelace.resources.async_delete_item.assert_awaited_once_with("r-1")
    lovelace.resources.async_create_item.assert_awaited_once()


async def test_register_one_card_outer_exception_is_logged_not_raised(
    hass: HomeAssistant, caplog: pytest.LogCaptureFixture
) -> None:
    """Any unexpected error inside the resource block must be swallowed."""
    fname = _ensure_card_file_exists()
    # Make the lovelace lookup itself blow up inside the try.
    bad_data = MagicMock()
    bad_data.get.side_effect = RuntimeError("unexpected")
    hass.data = bad_data  # type: ignore[assignment]
    object.__setattr__(
        hass, "http", SimpleNamespace(async_register_static_paths=AsyncMock())
    )

    caplog.clear()
    await _async_register_one_card(hass, "/wla/test.js", "9.9", fname)
    assert any(
        "Could not register Lovelace resource" in r.message for r in caplog.records
    )


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
        "custom_components.wiener_linien_austria._async_register_cards",
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
