"""Tests for the JSModuleRegistration helper.

Mirrors the linz/nextbike test_card_registration.py shape, adapted for the
three-card setup (modern + retro + flap). Covers:
- storage-vs-yaml duck-typing across `mode` (HA ≤ 2026.1) and `resource_mode`
  (HA ≥ 2026.2)
- all cards are upserted in one async_register() pass
- async_unregister removes all
- the http-unavailable short-circuit (pytest env without `http` component)
"""

from __future__ import annotations

import logging
from datetime import timedelta
from typing import Any
from unittest.mock import AsyncMock, MagicMock, patch

import pytest
from freezegun.api import FrozenDateTimeFactory
from homeassistant.core import HomeAssistant
from homeassistant.exceptions import HomeAssistantError
from pytest_homeassistant_custom_component.common import async_fire_time_changed

from custom_components.wiener_linien_austria.card_registration import (
    _LOVELACE_LOAD_RETRY_INTERVAL_S,
    _LOVELACE_LOAD_RETRY_MAX,
    JSMODULES,
    JSModuleRegistration,
)
from custom_components.wiener_linien_austria.const import (
    CARD_URL,
    CARD_VERSION,
    FLAP_CARD_URL,
    FLAP_CARD_VERSION,
    FONTS_URL,
    RETRO_CARD_URL,
    RETRO_CARD_VERSION,
)


def _stub_static(hass: HomeAssistant) -> AsyncMock:
    """Replace ``hass.http.async_register_static_paths`` with an AsyncMock."""
    static = AsyncMock()
    hass.http = MagicMock(spec_set=("async_register_static_paths",))
    hass.http.async_register_static_paths = static
    return static


def _build_lovelace(
    items: list[dict[str, Any]],
    *,
    mode: str | None = "storage",
    resource_mode: str | None = None,
    loaded: bool = True,
) -> MagicMock:
    """Build a fake LovelaceData object with the surface the helper reads."""
    resources = MagicMock()
    resources.loaded = loaded
    resources.async_items = MagicMock(return_value=list(items))
    resources.async_create_item = AsyncMock()
    resources.async_update_item = AsyncMock()
    resources.async_delete_item = AsyncMock()
    lovelace = MagicMock()
    if mode is not None:
        lovelace.mode = mode
    else:
        del lovelace.mode
    if resource_mode is not None:
        lovelace.resource_mode = resource_mode
    else:
        del lovelace.resource_mode
    lovelace.resources = resources
    return lovelace


async def test_jsmodules_lists_all_cards() -> None:
    """JSMODULES carries modern, retro, and flap tuples."""
    urls = {url for url, _v, _f in JSMODULES}
    assert CARD_URL in urls
    assert RETRO_CARD_URL in urls
    assert FLAP_CARD_URL in urls
    assert len(JSMODULES) == 3


async def test_register_creates_all_resources_when_absent(
    hass: HomeAssistant,
) -> None:
    """Storage-mode + no existing resources → all cards created."""
    static = _stub_static(hass)
    lovelace = _build_lovelace([])
    hass.data["lovelace"] = lovelace

    reg = JSModuleRegistration(hass)
    await reg.async_register()

    static.assert_awaited_once()
    # Static-paths call carries every URL in one batch: the three card
    # JS files plus the fonts directory (registered conditionally via
    # `fonts_dir.is_dir()`; the committed `www/fonts/` makes that
    # branch fire in CI and in any working tree that hasn't deleted
    # the bundled WL webfonts).
    static_args = static.await_args.args[0]
    static_urls = {cfg.url_path for cfg in static_args}
    assert static_urls == {CARD_URL, RETRO_CARD_URL, FLAP_CARD_URL, FONTS_URL}

    # Cache headers are split by whether the URL carries a version.
    # The three card bundles are served under `?v={version}`, so a 31-day
    # `Cache-Control` is invalidated by the next release; the fonts
    # directory has no buster, so a long max-age there would pin a stale
    # subset for a month. Getting this backwards is silent in both
    # directions — a stale font, or 443 KB re-fetched every dashboard boot.
    cache_by_url = {cfg.url_path: cfg.cache_headers for cfg in static_args}
    assert cache_by_url == {
        CARD_URL: True,
        RETRO_CARD_URL: True,
        FLAP_CARD_URL: True,
        FONTS_URL: False,
    }

    # Three create_item calls — one per card.
    assert lovelace.resources.async_create_item.await_count == 3
    created_urls = {
        call.args[0]["url"]
        for call in lovelace.resources.async_create_item.await_args_list
    }
    assert created_urls == {
        f"{CARD_URL}?v={CARD_VERSION}",
        f"{RETRO_CARD_URL}?v={RETRO_CARD_VERSION}",
        f"{FLAP_CARD_URL}?v={FLAP_CARD_VERSION}",
    }


async def test_register_updates_outdated_modern_resource(hass: HomeAssistant) -> None:
    """An existing modern resource with a stale ?v=… is upserted; retro + flap are created."""
    _stub_static(hass)
    stale = {"id": "abc", "url": f"{CARD_URL}?v=0.0.0", "res_type": "module"}
    lovelace = _build_lovelace([stale])
    hass.data["lovelace"] = lovelace

    reg = JSModuleRegistration(hass)
    await reg.async_register()

    lovelace.resources.async_update_item.assert_awaited_once_with(
        "abc",
        {"res_type": "module", "url": f"{CARD_URL}?v={CARD_VERSION}"},
    )
    # Retro + flap had no rows → both created.
    assert lovelace.resources.async_create_item.await_count == 2
    created_urls = {
        call.args[0]["url"]
        for call in lovelace.resources.async_create_item.await_args_list
    }
    assert created_urls == {
        f"{RETRO_CARD_URL}?v={RETRO_CARD_VERSION}",
        f"{FLAP_CARD_URL}?v={FLAP_CARD_VERSION}",
    }


async def test_register_skips_when_all_already_current(hass: HomeAssistant) -> None:
    """All resources at current version → no writes."""
    _stub_static(hass)
    items = [
        {"id": "a", "url": f"{CARD_URL}?v={CARD_VERSION}", "res_type": "module"},
        {
            "id": "b",
            "url": f"{RETRO_CARD_URL}?v={RETRO_CARD_VERSION}",
            "res_type": "module",
        },
        {
            "id": "c",
            "url": f"{FLAP_CARD_URL}?v={FLAP_CARD_VERSION}",
            "res_type": "module",
        },
    ]
    lovelace = _build_lovelace(items)
    hass.data["lovelace"] = lovelace

    reg = JSModuleRegistration(hass)
    await reg.async_register()

    lovelace.resources.async_update_item.assert_not_awaited()
    lovelace.resources.async_create_item.assert_not_awaited()


async def test_register_noop_in_yaml_mode(hass: HomeAssistant) -> None:
    """YAML-mode Lovelace must not be mutated — user manages the resources."""
    _stub_static(hass)
    lovelace = _build_lovelace([], mode="yaml")
    hass.data["lovelace"] = lovelace

    reg = JSModuleRegistration(hass)
    await reg.async_register()

    lovelace.resources.async_create_item.assert_not_awaited()
    lovelace.resources.async_update_item.assert_not_awaited()


async def test_register_uses_resource_mode_on_new_ha(hass: HomeAssistant) -> None:
    """HA ≥ 2026.2 reads `resource_mode` instead of `mode`."""
    _stub_static(hass)
    lovelace = _build_lovelace([], mode=None, resource_mode="storage")
    hass.data["lovelace"] = lovelace

    reg = JSModuleRegistration(hass)
    await reg.async_register()

    # All cards still get created when `resource_mode="storage"`.
    assert lovelace.resources.async_create_item.await_count == 3


async def test_register_fails_closed_when_neither_mode_field_set(
    hass: HomeAssistant,
) -> None:
    """If neither `mode` nor `resource_mode` exists, treat as non-storage."""
    _stub_static(hass)
    lovelace = _build_lovelace([], mode=None, resource_mode=None)
    hass.data["lovelace"] = lovelace

    reg = JSModuleRegistration(hass)
    await reg.async_register()

    lovelace.resources.async_create_item.assert_not_awaited()


async def test_register_warns_when_card_missing(
    hass: HomeAssistant, tmp_path: Any, caplog: pytest.LogCaptureFixture
) -> None:
    """A missing card JS path logs a warning instead of raising."""
    _stub_static(hass)
    bad_path = tmp_path / "missing.js"

    with patch(
        "custom_components.wiener_linien_austria.card_registration.Path"
    ) as path_cls:
        path_cls.return_value.parent.__truediv__.return_value.__truediv__.return_value = bad_path
        caplog.clear()
        with caplog.at_level("WARNING"):
            reg = JSModuleRegistration(hass)
            await reg.async_register()

    assert any("Card JS not found" in rec.message for rec in caplog.records), (
        "expected warning when card JS file is missing"
    )


async def test_register_skips_when_http_unavailable(hass: HomeAssistant) -> None:
    """Pytest env without `http` component must not crash registration."""
    reg = JSModuleRegistration(hass)
    # Directly calling async_register without a stubbed http should
    # short-circuit before _async_register_paths runs.
    await reg.async_register()  # no exception = pass


async def test_unregister_removes_all_resources(hass: HomeAssistant) -> None:
    """async_unregister deletes every card resource in storage mode."""
    existing = [
        {"id": "abc", "url": f"{CARD_URL}?v={CARD_VERSION}", "res_type": "module"},
        {
            "id": "xyz",
            "url": f"{RETRO_CARD_URL}?v={RETRO_CARD_VERSION}",
            "res_type": "module",
        },
        {
            "id": "flp",
            "url": f"{FLAP_CARD_URL}?v={FLAP_CARD_VERSION}",
            "res_type": "module",
        },
    ]
    lovelace = _build_lovelace(existing)
    hass.data["lovelace"] = lovelace

    reg = JSModuleRegistration(hass)
    await reg.async_unregister()

    assert lovelace.resources.async_delete_item.await_count == 3
    deleted_ids = {
        call.args[0] for call in lovelace.resources.async_delete_item.await_args_list
    }
    assert deleted_ids == {"abc", "xyz", "flp"}


async def test_unregister_noop_in_yaml_mode(hass: HomeAssistant) -> None:
    """YAML mode → unregister must not touch the resource collection."""
    existing = [
        {"id": "abc", "url": f"{CARD_URL}?v={CARD_VERSION}"},
        {"id": "xyz", "url": f"{RETRO_CARD_URL}?v={RETRO_CARD_VERSION}"},
        {"id": "flp", "url": f"{FLAP_CARD_URL}?v={FLAP_CARD_VERSION}"},
    ]
    lovelace = _build_lovelace(existing, mode="yaml")
    hass.data["lovelace"] = lovelace

    reg = JSModuleRegistration(hass)
    await reg.async_unregister()

    lovelace.resources.async_delete_item.assert_not_awaited()


async def test_register_waits_for_lovelace_then_registers(
    hass: HomeAssistant, freezer: FrozenDateTimeFactory
) -> None:
    """Resources not loaded yet → retry on the timer, then register.

    Lovelace's resource collection loads lazily, and `after_dependencies`
    is soft ordering, so arriving before it is loaded is the normal case
    on a cold boot rather than an edge case.
    """
    _stub_static(hass)
    lovelace = _build_lovelace([], loaded=False)
    hass.data["lovelace"] = lovelace

    reg = JSModuleRegistration(hass)
    await reg.async_register()

    # First pass found `loaded` False and scheduled a retry.
    assert lovelace.resources.async_create_item.await_count == 0

    lovelace.resources.loaded = True
    freezer.tick(timedelta(seconds=6))
    async_fire_time_changed(hass)
    await hass.async_block_till_done()

    assert lovelace.resources.async_create_item.await_count == 3


async def test_register_gives_up_after_the_retry_cap(
    hass: HomeAssistant,
    freezer: FrozenDateTimeFactory,
    caplog: pytest.LogCaptureFixture,
) -> None:
    """Lovelace never loads → one warning, then stop polling forever.

    The cap exists because a broken storage collection would otherwise
    leave a 5-second timer running for the life of the HA process, and
    the failure would be entirely silent.
    """
    caplog.set_level(logging.WARNING)
    _stub_static(hass)
    lovelace = _build_lovelace([], loaded=False)
    hass.data["lovelace"] = lovelace

    reg = JSModuleRegistration(hass)
    await reg.async_register()

    for _ in range(_LOVELACE_LOAD_RETRY_MAX + 1):
        freezer.tick(timedelta(seconds=_LOVELACE_LOAD_RETRY_INTERVAL_S + 1))
        async_fire_time_changed(hass)
        await hass.async_block_till_done()

    assert "never reported `loaded`" in caplog.text
    assert lovelace.resources.async_create_item.await_count == 0


async def test_upsert_falls_back_to_delete_and_recreate(
    hass: HomeAssistant,
) -> None:
    """`async_update_item` raising must not lose the resource.

    HA core has moved the concrete exception class for this failure
    across versions, which is why the handler catches broadly. What
    matters is that the observable dashboard state is the same either
    way: one resource, at the current version.
    """
    _stub_static(hass)
    lovelace = _build_lovelace(
        [{"id": "res-1", "url": f"{CARD_URL}?v=0.0.1", "res_type": "module"}]
    )
    lovelace.resources.async_update_item.side_effect = HomeAssistantError("nope")
    hass.data["lovelace"] = lovelace

    reg = JSModuleRegistration(hass)
    await reg.async_register()

    lovelace.resources.async_delete_item.assert_awaited_with("res-1")
    recreated = [
        call.args[0]["url"]
        for call in lovelace.resources.async_create_item.await_args_list
    ]
    assert f"{CARD_URL}?v={CARD_VERSION}" in recreated


async def test_lovelace_read_falls_back_to_the_string_key(
    hass: HomeAssistant,
) -> None:
    """The `LOVELACE_DATA` HassKey is absent on older HA; the shim covers it.

    `homeassistant.components.lovelace.const.LOVELACE_DATA` does not exist
    at the `hacs.json` floor, so the constructor probes the typed key and
    falls back to the bare `"lovelace"` string. This test pins the
    fallback leg — the one an install on the floor actually takes.
    """
    lovelace = _build_lovelace([])
    hass.data["lovelace"] = lovelace

    with patch(
        "custom_components.wiener_linien_austria.card_registration.LOVELACE_DATA",
        None,
    ):
        reg = JSModuleRegistration(hass)

    assert reg.lovelace is lovelace
