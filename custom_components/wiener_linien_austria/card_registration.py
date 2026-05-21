"""Lovelace JS module registration for Wiener Linien Austria.

Canonical pattern from the HA developer community guide:
https://community.home-assistant.io/t/developer-guide-embedded-lovelace-card-in-a-home-assistant-integration/974909

This integration ships TWO bundled cards (modern + retro). The
``JSMODULES`` list below registers both via a single
``JSModuleRegistration`` instance — adding a third card is just an
append to the list.

Storage-vs-yaml detection — the LovelaceData field name varies across
HA versions:

  * HA ≤ 2026.1: ``LovelaceData.mode: str``
  * HA ≥ 2026.2: ``LovelaceData.resource_mode: str``

``_is_storage_mode`` reads whichever attribute is present, preferring
``resource_mode``. Duck-typed by design so we don't have to track every
micro-rename across HA versions. ``resources`` itself is a
``ResourceYAMLCollection | ResourceStorageCollection`` union; the
type-only import + ``cast`` below narrow it for storage-only mutation
calls without a runtime dependency on the typed class existing on
every HA version.
"""
from __future__ import annotations

import logging
from pathlib import Path
from typing import TYPE_CHECKING, Any, cast

from homeassistant.components.http import StaticPathConfig
from homeassistant.core import HomeAssistant
from homeassistant.helpers.event import async_call_later

from .const import (
    CARD_FILENAME,
    CARD_URL,
    CARD_VERSION,
    FONTS_DIRNAME,
    FONTS_URL,
    RETRO_CARD_FILENAME,
    RETRO_CARD_URL,
    RETRO_CARD_VERSION,
)

# Older HA installs lacked LOVELACE_DATA — fall back to the bare-string
# lookup. Compound ignore covers `attr-defined` (older HA) and
# `unused-ignore` (newer HA where the symbol IS exported).
try:
    from homeassistant.components.lovelace.const import (  # type: ignore[attr-defined,unused-ignore]
        LOVELACE_DATA,
    )
except ImportError:  # pragma: no cover — fallback for HA before LOVELACE_DATA shipped
    LOVELACE_DATA = None  # type: ignore[assignment,unused-ignore]

# Type-only import — `ResourceStorageCollection` is referenced in the
# `cast()` string literal, never at runtime, so older HA installs
# without this submodule layout still load this file.
if TYPE_CHECKING:
    from homeassistant.components.lovelace.resources import (
        ResourceStorageCollection,
    )

_LOGGER = logging.getLogger(__name__)

# Cap on _async_wait_for_lovelace_resources retry ticks. Each tick is 5s,
# so 60 ticks = 5 min. Reaching the cap means Lovelace's resource loader
# never flipped `loaded` — broken storage, YAML-mode race during reload,
# or future Lovelace internals change. Cheaper to surface the bad state
# with one warning than poll forever.
_LOVELACE_LOAD_RETRY_MAX = 60
_LOVELACE_LOAD_RETRY_INTERVAL_S = 5

# All cards registered by this integration. Each tuple is
# (lovelace-served URL, version string, on-disk filename in www/).
# Adding a third card = append a tuple.
JSMODULES: tuple[tuple[str, str, str], ...] = (
    (CARD_URL, CARD_VERSION, CARD_FILENAME),
    (RETRO_CARD_URL, RETRO_CARD_VERSION, RETRO_CARD_FILENAME),
)


class JSModuleRegistration:
    """Register the Wiener Linien Austria card JS modules for Lovelace.

    Storage mode: resources are created/updated via the Lovelace resources API.
    YAML mode: users must add the resource manually — registration is skipped.
    """

    def __init__(self, hass: HomeAssistant) -> None:
        """Initialize the registrar."""
        self.hass = hass
        # Prefer the typed HassKey — the bare string lookup is what HA
        # core can rename without notice.
        if LOVELACE_DATA is not None:
            self.lovelace = self.hass.data.get(LOVELACE_DATA)
        else:
            self.lovelace = self.hass.data.get("lovelace")

    async def async_register(self) -> None:
        """Register frontend resources."""
        # `http` is a soft dependency via manifest `after_dependencies`, so
        # it may not be loaded in the pytest env (pytest-homeassistant-custom-
        # component does not bootstrap `http` automatically). Skip instead of
        # crashing when absent — production installs always have it loaded.
        if getattr(self.hass, "http", None) is None:
            _LOGGER.debug(
                "http component not available; skipping card registration"
            )
            return
        await self._async_register_paths()
        if self.lovelace is not None and self._is_storage_mode():
            await self._async_wait_for_lovelace_resources()

    def _is_storage_mode(self) -> bool:
        """Read the LovelaceData storage-vs-yaml field.

        The field was renamed across HA versions:
          - HA ≤ 2026.1: ``mode``
          - HA ≥ 2026.2: ``resource_mode``
        Whichever is present, we read it; the other won't exist on
        that HA version. See the module docstring for source links.
        Returns False if neither attribute is set (fail closed).
        """
        assert self.lovelace is not None
        for attr in ("resource_mode", "mode"):
            value = getattr(self.lovelace, attr, None)
            if value is not None:
                return bool(value == "storage")
        return False

    async def _async_register_paths(self) -> None:
        """Register the static HTTP paths that serve every card JS file."""
        configs: list[StaticPathConfig] = []
        for url, _version, filename in JSMODULES:
            card_path = Path(__file__).parent / "www" / filename
            if not card_path.is_file():
                _LOGGER.warning("Card JS not found at %s", card_path)
                continue
            configs.append(StaticPathConfig(url, str(card_path), False))
        # Webfonts — directory-level static path so the cards' @font-face
        # URLs under /wiener-linien-austria/fonts/ all resolve. Optional:
        # missing dir just skips the registration (cards fall back to the
        # system font stack). cache_headers=False matches the cards' own
        # cache behaviour — a font-subset refresh on the next release
        # reaches users without a manual cache wipe.
        fonts_dir = Path(__file__).parent / "www" / FONTS_DIRNAME
        if fonts_dir.is_dir():
            configs.append(StaticPathConfig(FONTS_URL, str(fonts_dir), False))
        if not configs:
            # No card JS at all on disk — the integration's user-visible
            # surface (both modern and retro Lovelace cards) is broken.
            # Promote from the per-file warning to a single error so the
            # condition is loud in the integration log instead of silent.
            if JSMODULES:
                _LOGGER.error(
                    "No Lovelace card bundles found in www/ — expected: %s. "
                    "The integration will load but cards won't render. "
                    "Reinstall via HACS or rebuild from source.",
                    [filename for _, _, filename in JSMODULES],
                )
            return
        try:
            await self.hass.http.async_register_static_paths(configs)
            _LOGGER.debug(
                "Static paths registered: %s",
                [c.url_path for c in configs],
            )
        except RuntimeError:
            _LOGGER.debug(
                "Static path already registered for one of: %s",
                [c.url_path for c in configs],
            )

    async def _async_wait_for_lovelace_resources(self) -> None:
        """Wait for Lovelace resources to load, then register every module."""
        # Guarded by async_register(); narrow the Optional for mypy --strict.
        assert self.lovelace is not None
        attempts = 0

        async def _check_loaded(_now: Any) -> None:
            nonlocal attempts
            assert self.lovelace is not None
            if self.lovelace.resources.loaded:
                await self._async_register_modules()
                return
            attempts += 1
            if attempts >= _LOVELACE_LOAD_RETRY_MAX:
                _LOGGER.warning(
                    "Lovelace resources never reported `loaded` after %d × %ds "
                    "(broken storage, YAML-mode race, or Lovelace internals "
                    "change?). Giving up — users on storage mode will need to "
                    "reload the integration once Lovelace is back online.",
                    _LOVELACE_LOAD_RETRY_MAX,
                    _LOVELACE_LOAD_RETRY_INTERVAL_S,
                )
                return
            _LOGGER.debug(
                "Lovelace resources not loaded, retrying in %ds (%d/%d)",
                _LOVELACE_LOAD_RETRY_INTERVAL_S,
                attempts,
                _LOVELACE_LOAD_RETRY_MAX,
            )
            async_call_later(
                self.hass, _LOVELACE_LOAD_RETRY_INTERVAL_S, _check_loaded
            )

        await _check_loaded(0)

    async def _async_register_modules(self) -> None:
        """Register or update every JS module resource."""
        assert self.lovelace is not None
        # async_register() gates this method behind _is_storage_mode(),
        # so the resources collection is always the StorageCollection
        # variant. cast() tells mypy to treat the union as the narrow
        # type; runtime safety is the caller's _is_storage_mode() check.
        resources = cast("ResourceStorageCollection", self.lovelace.resources)
        for url, version, _filename in JSMODULES:
            await self._async_upsert_resource(resources, url, version)

    async def _async_upsert_resource(
        self,
        resources: "ResourceStorageCollection",
        url: str,
        version: str,
    ) -> None:
        """Upsert one resource: update on URL match, else create."""
        versioned_url = f"{url}?v={version}"
        for item in resources.async_items():
            existing_base = str(item.get("url") or "").split("?")[0]
            if existing_base != url:
                continue
            if item.get("url") == versioned_url:
                return  # already up to date
            try:
                await resources.async_update_item(
                    item["id"],
                    {"res_type": "module", "url": versioned_url},
                )
            except Exception as update_err:  # noqa: BLE001
                # Broad except: HA core has shifted the concrete
                # exception class for this failure across versions
                # (HomeAssistantError, KeyError on a mid-flight evict,
                # other). Recovery — drop and recreate — produces the
                # same observable dashboard state regardless of cause.
                _LOGGER.debug(
                    "async_update_item failed for %s (%s), trying delete+recreate",
                    url,
                    update_err,
                )
                await resources.async_delete_item(item["id"])
                await resources.async_create_item(
                    {"res_type": "module", "url": versioned_url}
                )
            _LOGGER.info("Updated Lovelace resource to %s", versioned_url)
            return

        await resources.async_create_item(
            {"res_type": "module", "url": versioned_url}
        )
        _LOGGER.info("Registered Lovelace resource %s", versioned_url)

    async def async_unregister(self) -> None:
        """Remove every Lovelace resource owned by this integration."""
        if self.lovelace is None or not self._is_storage_mode():
            return
        resources = cast("ResourceStorageCollection", self.lovelace.resources)
        urls = {url for url, _v, _f in JSMODULES}
        for item in list(resources.async_items()):
            base = str(item.get("url") or "").split("?")[0]
            if base in urls:
                await resources.async_delete_item(item["id"])
                _LOGGER.info("Removed Lovelace resource %s", item.get("url"))
