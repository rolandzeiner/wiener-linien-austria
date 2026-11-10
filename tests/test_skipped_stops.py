"""Stations a trail passes without calling, and the notice saying until when."""

from __future__ import annotations

import asyncio
from collections.abc import Generator
from datetime import datetime, timedelta
from typing import Any
from unittest.mock import AsyncMock, patch
from zoneinfo import ZoneInfo

import pytest
from freezegun.api import FrozenDateTimeFactory
from homeassistant.core import HomeAssistant

from custom_components.wiener_linien_austria.api import (
    ROUTING_DEPARTURE_ENDPOINT,
    ApiTimeoutError,
)
from custom_components.wiener_linien_austria.const import (
    STOP_CALLS_DEPARTURES_REQUESTED,
    STOP_CALLS_RETRY_AFTER,
    STOP_NOTICES_MAX_AGE,
    STOP_NOTICES_RETRY_AFTER,
    USER_AGENT,
)
from custom_components.wiener_linien_austria.routing import RoutingError
from custom_components.wiener_linien_austria.run_times import RUN_TIME_EXCLUDED_MOTS
from custom_components.wiener_linien_austria.skipped_stops import (
    NewsShapeError,
    SkippedStation,
    StopNotice,
    async_get_stop_calls,
    async_get_stop_notices,
    closed_until,
    noticed_stations,
    parse_news,
    skipped_stations,
    stand_ins,
)
from custom_components.wiener_linien_austria.static import (
    StaticCatalogue,
    Station,
    TripPattern,
    TripPatternIndex,
)
from custom_components.wiener_linien_austria.timetable import (
    LineCalls,
    build_departure_params,
    parse_line_calls,
)

VIENNA = ZoneInfo("Europe/Vienna")
NOW = datetime(2026, 11, 9, 14, 12, tzinfo=VIENNA)

# U6 from Westbahnhof towards Floridsdorf, with the real RBLs either side of
# Neue Donau. 4647 is the Siebenhirten-bound platform there, where the
# trains still call.
WESTBAHNHOF, HANDELSKAI, NEUE_DONAU, FLORIDSDORF = 1468, 1705, 1668, 334
STATIONS = {
    WESTBAHNHOF: ("Westbahnhof", [4600, 4690]),
    HANDELSKAI: ("Handelskai", [4643, 4648]),
    NEUE_DONAU: ("Neue Donau", [4644, 4647]),
    FLORIDSDORF: ("Floridsdorf", [4645, 4646]),
    # 13A: the variant over Volkstheater its buses no longer take.
    2: ("Siebensterngasse", [3528]),
    3: ("Volkstheater", [1401]),
    4: ("Kellermanngasse", [705]),
}
U6, BUS = 6, 13


def _catalogue() -> StaticCatalogue:
    stations = {
        diva: Station(
            diva=diva,
            name=name,
            municipality="Wien",
            longitude=16.39,
            latitude=48.22,
            rbls=rbls,
        )
        for diva, (name, rbls) in STATIONS.items()
    }
    patterns = TripPatternIndex(
        patterns_by_line={
            U6: [
                TripPattern(U6, 1, 1, (4600, 4643, 4644, 4645)),
                TripPattern(U6, 2, 2, (4646, 4647, 4648, 4690)),
            ],
            BUS: [
                TripPattern(BUS, 2, 2, (4600, 3528, 705)),
                TripPattern(BUS, 22, 2, (4600, 1401, 705)),
            ],
        },
        lines_by_label={"U6": U6, "13A": BUS},
    )
    return StaticCatalogue(
        stations_by_diva=stations, last_fetched=NOW.isoformat(), trip_patterns=patterns
    )


# ---------------------------------------------------------------------------
# Which stations are skipped
# ---------------------------------------------------------------------------


def test_a_station_between_two_calls_in_a_row_is_skipped() -> None:
    sample = {HANDELSKAI: 10.0, FLORIDSDORF: 13.0}

    found = skipped_stations(_catalogue(), WESTBAHNHOF, "U6", "H", sample)

    assert found == {
        "Neue Donau": SkippedStation(
            diva=NEUE_DONAU,
            rbls=frozenset({4644}),
            neighbour_rbls=frozenset({4643, 4645}),
            between=(10.0, 13.0),
        )
    }


def test_the_board_counts_as_the_call_before() -> None:
    found = skipped_stations(_catalogue(), HANDELSKAI, "U6", "H", {FLORIDSDORF: 3.0})

    assert list(found) == ["Neue Donau"]


def test_the_other_direction_is_read_from_its_own_route() -> None:
    # The Siebenhirten-bound trains call at Neue Donau: nothing is skipped,
    # and the H route's gap can't leak into R.
    sample = {NEUE_DONAU: 2.0, HANDELSKAI: 3.0, WESTBAHNHOF: 15.0}

    assert skipped_stations(_catalogue(), FLORIDSDORF, "U6", "R", sample) == {}


def test_a_route_the_sample_did_not_take_reads_as_no_skip() -> None:
    # 13A runs Siebensterngasse, Kellermanngasse; the old variant over
    # Volkstheater has both its neighbours called too, but with
    # Siebensterngasse in between they aren't two calls in a row.
    sample = {2: 1.0, 4: 3.0}

    assert skipped_stations(_catalogue(), WESTBAHNHOF, "13A", "R", sample) == {}


def test_neighbours_called_the_wrong_way_round_read_as_no_skip() -> None:
    # A route driven the other way round, as tram 1 on the Ring in works.
    sample = {HANDELSKAI: 13.0, FLORIDSDORF: 10.0}

    assert skipped_stations(_catalogue(), WESTBAHNHOF, "U6", "H", sample) == {}


def test_the_end_of_a_short_run_reads_as_no_skip() -> None:
    assert (
        skipped_stations(_catalogue(), WESTBAHNHOF, "U6", "H", {HANDELSKAI: 10.0}) == {}
    )


@pytest.mark.parametrize(
    ("board", "line", "direction"),
    [
        (99, "U6", "H"),  # a board no route passes
        (WESTBAHNHOF, "U9", "H"),  # a line the catalogue doesn't know
        (WESTBAHNHOF, "U6", "X"),  # not a /monitor direction
    ],
)
def test_nothing_to_compare_reads_as_no_skip(
    board: int, line: str, direction: str
) -> None:
    sample = {HANDELSKAI: 10.0, FLORIDSDORF: 13.0}

    assert skipped_stations(_catalogue(), board, line, direction, sample) == {}


def test_a_catalogue_without_routes_reads_as_no_skip() -> None:
    catalogue = _catalogue()
    catalogue.trip_patterns = None

    assert skipped_stations(catalogue, WESTBAHNHOF, "U6", "H", {HANDELSKAI: 1.0}) == {}


# ---------------------------------------------------------------------------
# A stop the timetable knows by another id
# ---------------------------------------------------------------------------

UNKNOWN, OTHER_UNKNOWN = 60201987, 60201988


def test_a_route_end_the_timetable_calls_by_another_id_takes_its_time() -> None:
    # N6: the route ends at Enkplatz, the timetable at Enkplatz/Grillgasse.
    sample = {HANDELSKAI: 10.0, NEUE_DONAU: 12.0, UNKNOWN: 13.0}

    found = stand_ins(_catalogue(), WESTBAHNHOF, "U6", "H", sample)

    assert found == {"Floridsdorf": 13.0}


def test_a_station_between_two_calls_takes_the_unknown_call_between() -> None:
    sample = {HANDELSKAI: 10.0, UNKNOWN: 11.5, FLORIDSDORF: 13.0}

    assert stand_ins(_catalogue(), WESTBAHNHOF, "U6", "H", sample) == {
        "Neue Donau": 11.5
    }
    # The same station is no skip: the unknown call sits between.
    assert skipped_stations(_catalogue(), WESTBAHNHOF, "U6", "H", sample) == {}


@pytest.mark.parametrize(
    "sample",
    [
        # Every call known: nothing stands in.
        {HANDELSKAI: 10.0, FLORIDSDORF: 13.0},
        # Two unknown calls in the same minute: which one is it?
        {HANDELSKAI: 10.0, UNKNOWN: 11.5, OTHER_UNKNOWN: 11.5, FLORIDSDORF: 13.0},
        # The next call after Handelskai is a known one.
        {HANDELSKAI: 10.0, FLORIDSDORF: 13.0, UNKNOWN: 14.0},
        # The station after isn't the call right after the unknown one.
        {HANDELSKAI: 10.0, UNKNOWN: 11.0, OTHER_UNKNOWN: 12.0, FLORIDSDORF: 13.0},
    ],
)
def test_no_clear_unknown_call_stands_in(sample: dict[int, float]) -> None:
    assert stand_ins(_catalogue(), WESTBAHNHOF, "U6", "H", sample) == {}


# ---------------------------------------------------------------------------
# /newsList
# ---------------------------------------------------------------------------


def _poi(
    lines: Any = ("U6",),
    stops: Any = (4644,),
    start: str | None = "2026-08-13T12:00:00.000+0200",
    end: str | None = "2026-12-31T23:59:00.000+0100",
) -> dict[str, Any]:
    return {
        "title": "U6: Neue Donau, kein Halt Richtung Floridsdorf ab 14.09.2026",
        "relatedLines": list(lines) if lines is not None else None,
        "relatedStops": list(stops) if stops is not None else None,
        "time": {"start": start, "end": end},
    }


def _news(*pois: dict[str, Any]) -> dict[str, Any]:
    return {
        "data": {"pois": list(pois), "poiCategories": []},
        "message": {"value": "OK", "messageCode": 1},
    }


def _notice(
    lines: frozenset[str] = frozenset({"U6"}),
    rbls: frozenset[int] = frozenset({4644}),
    start: datetime | None = datetime(2026, 8, 13, 12, 0, tzinfo=VIENNA),
    end: datetime | None = datetime(2026, 12, 31, 23, 59, tzinfo=VIENNA),
) -> StopNotice:
    return StopNotice(lines=lines, rbls=rbls, start=start, end=end)


def test_news_answer_parses_to_notices_naming_platforms() -> None:
    notices = parse_news(
        _news(
            _poi(),
            _poi(stops=None),  # a whole-line notice: no platform to match
            _poi(lines=[""]),  # N67's notice names a blank line
            _poi(stops=["4700", "x", True]),
            "not a poi",  # type: ignore[arg-type]
        )
    )

    assert notices == [
        _notice(),
        _notice(rbls=frozenset({4700})),
    ]


def test_unreadable_times_parse_as_unknown() -> None:
    (notice,) = parse_news(_news(_poi(start="soon", end="2026-12-31T23:59")))

    assert notice.start is None
    assert notice.end is None


def test_an_empty_category_is_an_answer() -> None:
    assert parse_news(_news()) == []


@pytest.mark.parametrize(
    "body",
    [
        {},
        {"data": {"pois": []}},
        {"data": {"pois": []}, "message": {"messageCode": 316}},
        {"data": {}, "message": {"messageCode": 1}},
        {"data": [], "message": {"messageCode": 1}},
    ],
)
def test_a_body_without_the_envelope_is_no_answer(body: dict[str, Any]) -> None:
    with pytest.raises(NewsShapeError):
        parse_news(body)


# ---------------------------------------------------------------------------
# A notice contradicting the sample
# ---------------------------------------------------------------------------

# Meidling's U6 sample from 4 November: the trains still called at Neue
# Donau when it was taken.
CALLING = {HANDELSKAI: 10.0, NEUE_DONAU: 11.5, FLORIDSDORF: 13.0}


def test_a_notice_shutting_a_called_station_marks_it() -> None:
    found = noticed_stations(
        _catalogue(), WESTBAHNHOF, "U6", "H", CALLING, [_notice()], NOW
    )

    assert found == {"Neue Donau": NEUE_DONAU_SKIP}


@pytest.mark.parametrize(
    ("sample", "notices"),
    [
        (CALLING, []),
        (CALLING, [_notice(lines=frozenset({"N6"}))]),
        (CALLING, [_notice(rbls=frozenset({4647}))]),
        (CALLING, [_notice(rbls=frozenset({4643, 4644, 4645}))]),
        (CALLING, [_notice(start=NOW + timedelta(days=1))]),
        (CALLING, [_notice(end=NOW - timedelta(minutes=1))]),
        # No call there: `skipped_stations` has it.
        ({HANDELSKAI: 10.0, FLORIDSDORF: 13.0}, [_notice()]),
        # A call out of order on the route.
        ({HANDELSKAI: 10.0, NEUE_DONAU: 14.0, FLORIDSDORF: 13.0}, [_notice()]),
    ],
)
def test_no_contradicting_notice_marks_nothing(
    sample: dict[int, float], notices: list[StopNotice]
) -> None:
    assert (
        noticed_stations(_catalogue(), WESTBAHNHOF, "U6", "H", sample, notices, NOW)
        == {}
    )


# ---------------------------------------------------------------------------
# Until when
# ---------------------------------------------------------------------------

NEUE_DONAU_SKIP = SkippedStation(
    diva=NEUE_DONAU,
    rbls=frozenset({4644}),
    neighbour_rbls=frozenset({4643, 4645}),
    between=(10.0, 13.0),
)


def test_the_notice_for_the_platform_gives_the_date() -> None:
    assert closed_until([_notice()], "U6", NEUE_DONAU_SKIP, NOW) == datetime(
        2026, 12, 31, 23, 59, tzinfo=VIENNA
    )


def test_two_notices_agreeing_on_the_date_give_it() -> None:
    notices = [_notice(), _notice(lines=frozenset({"U6", "N6"}))]

    assert closed_until(notices, "U6", NEUE_DONAU_SKIP, NOW) is not None


@pytest.mark.parametrize(
    "notices",
    [
        # About another line at the same platform.
        [_notice(lines=frozenset({"N6"}))],
        # About the other platform, where the trains still call.
        [_notice(rbls=frozenset({4647}))],
        # About a stretch or the whole line: it names the neighbours too.
        [_notice(rbls=frozenset({4643, 4644, 4645}))],
        # Not running yet, or over.
        [_notice(start=NOW + timedelta(days=1))],
        [_notice(end=NOW - timedelta(minutes=1))],
        # No end, or the open one.
        [_notice(end=None)],
        [_notice(end=datetime(2031, 12, 7, 11, 11, tzinfo=VIENNA))],
        # Two notices, two dates: which one holds?
        [_notice(), _notice(end=datetime(2027, 3, 1, 4, 0, tzinfo=VIENNA))],
        [],
    ],
)
def test_no_clear_notice_gives_no_date(notices: list[StopNotice]) -> None:
    assert closed_until(notices, "U6", NEUE_DONAU_SKIP, NOW) is None


def test_a_notice_without_a_start_counts_from_now() -> None:
    assert closed_until([_notice(start=None)], "U6", NEUE_DONAU_SKIP, NOW) is not None


# ---------------------------------------------------------------------------
# Fetching on demand
# ---------------------------------------------------------------------------

_FETCH = "custom_components.wiener_linien_austria.skipped_stops.fetch_news"


@pytest.fixture
def news_fetch() -> Generator[AsyncMock]:
    with patch(_FETCH, new_callable=AsyncMock, return_value=_news(_poi())) as mock:
        yield mock


async def test_notices_are_fetched_once_and_held(
    hass: HomeAssistant, freezer: FrozenDateTimeFactory, news_fetch: AsyncMock
) -> None:
    freezer.move_to(NOW)
    cache = async_get_stop_notices(hass)

    assert await cache.async_get() == [_notice()]
    freezer.tick(STOP_NOTICES_MAX_AGE - timedelta(seconds=1))
    assert await cache.async_get() == [_notice()]
    assert news_fetch.await_count == 1
    assert news_fetch.await_args.kwargs["user_agent"] == USER_AGENT

    freezer.tick(timedelta(seconds=1))
    await cache.async_get()
    assert news_fetch.await_count == 2
    assert async_get_stop_notices(hass) is cache


async def test_a_failed_fetch_keeps_what_was_held_and_waits(
    hass: HomeAssistant, freezer: FrozenDateTimeFactory, news_fetch: AsyncMock
) -> None:
    freezer.move_to(NOW)
    cache = async_get_stop_notices(hass)
    await cache.async_get()

    freezer.tick(STOP_NOTICES_MAX_AGE)
    news_fetch.side_effect = ApiTimeoutError(10)
    assert await cache.async_get() == [_notice()]
    assert news_fetch.await_count == 2

    # No new attempt before the retry time, then one.
    freezer.tick(STOP_NOTICES_RETRY_AFTER - timedelta(seconds=1))
    await cache.async_get()
    assert news_fetch.await_count == 2
    freezer.tick(timedelta(seconds=1))
    news_fetch.side_effect = None
    news_fetch.return_value = {"error": "maintenance"}
    assert await cache.async_get() == [_notice()]
    assert news_fetch.await_count == 3


async def test_a_first_fetch_failing_gives_nothing(
    hass: HomeAssistant, freezer: FrozenDateTimeFactory, news_fetch: AsyncMock
) -> None:
    freezer.move_to(NOW)
    news_fetch.side_effect = ApiTimeoutError(10)

    assert await async_get_stop_notices(hass).async_get() is None


async def test_callers_asking_at_once_share_one_request(
    hass: HomeAssistant, freezer: FrozenDateTimeFactory, news_fetch: AsyncMock
) -> None:
    freezer.move_to(NOW)
    release = asyncio.Event()

    async def slow(*_args: Any, **_kwargs: Any) -> dict[str, Any]:
        await release.wait()
        return _news(_poi())

    news_fetch.side_effect = slow
    cache = async_get_stop_notices(hass)
    first = hass.async_create_task(cache.async_get())
    second = hass.async_create_task(cache.async_get())
    await asyncio.sleep(0)

    # One caller going away doesn't cancel the request the other waits on.
    first.cancel()
    release.set()

    assert await second == [_notice()]
    assert news_fetch.await_count == 1


# ---------------------------------------------------------------------------
# Which runs call at a skipped station after all
# ---------------------------------------------------------------------------


def _departure(
    clock: str, line: str | None = "U6", direction: str | None = "H"
) -> dict[str, Any]:
    hour, minute = clock.split(":")
    return {
        "dateTime": {
            "year": "2026",
            "month": "11",
            "day": "10",
            "hour": hour,
            "minute": minute,
        },
        "servingLine": {"number": line, "liErgRiProj": {"direction": direction}},
    }


def _at(clock: str) -> datetime:
    hour, minute = clock.split(":")
    return datetime(2026, 11, 10, int(hour), int(minute), tzinfo=VIENNA)


# Neue Donau on a Tuesday evening: the Siebenhirten-bound trains all along,
# the Floridsdorf-bound ones from 22:02, while the line runs single-track.
NEUE_DONAU_EVENING = {
    "departureList": [
        _departure("21:58", direction="R"),
        _departure("22:09"),
        _departure("22:02"),
        _departure("22:05", direction="R"),
        _departure("22:07", line="BB"),
        _departure("22:10", line=None),
        {"dateTime": {"hour": "x"}, "servingLine": {"number": "U6"}},
        "not a row",
    ]
}


def test_a_stations_departures_parse_per_line_and_direction() -> None:
    calls = parse_line_calls(NEUE_DONAU_EVENING, VIENNA)

    assert calls == LineCalls(
        calls={
            ("U6", "H"): (_at("22:02"), _at("22:09")),
            ("U6", "R"): (_at("21:58"), _at("22:05")),
            ("WLB", "H"): (_at("22:07"),),
        },
        # A row without a line still says the answer reaches 22:10.
        first=_at("21:58"),
        last=_at("22:10"),
    )


def test_a_single_departure_arrives_unwrapped() -> None:
    calls = parse_line_calls(
        {"departureList": {"departure": _departure("22:02")}}, VIENNA
    )

    assert calls is not None
    assert calls.calls == {("U6", "H"): (_at("22:02"),)}


@pytest.mark.parametrize(
    "body",
    [{}, {"departureList": None}, {"departureList": []}, {"departureList": ["x"]}],
)
def test_an_answer_without_departures_says_nothing(body: dict[str, Any]) -> None:
    assert parse_line_calls(body, VIENNA) is None


_TRIP_FETCH = (
    "custom_components.wiener_linien_austria.skipped_stops.async_fetch_trip_body"
)
EVENING = datetime(2026, 11, 10, 20, 0, tzinfo=VIENNA)


@pytest.fixture
def calls_fetch() -> Generator[AsyncMock]:
    with patch(
        _TRIP_FETCH, new_callable=AsyncMock, return_value=NEUE_DONAU_EVENING
    ) as mock:
        yield mock


async def test_a_stations_departures_are_fetched_once_and_held(
    hass: HomeAssistant, freezer: FrozenDateTimeFactory, calls_fetch: AsyncMock
) -> None:
    freezer.move_to(EVENING)
    cache = async_get_stop_calls(hass)

    held = await cache.async_get(NEUE_DONAU)

    assert held is not None
    assert held.line_calls.calls[("U6", "H")] == (_at("22:02"), _at("22:09"))
    # The run times' modes, no stop sequences: the rows only need a time.
    assert calls_fetch.await_args.args[1] == build_departure_params(
        NEUE_DONAU,
        STOP_CALLS_DEPARTURES_REQUESTED,
        excluded_mots=RUN_TIME_EXCLUDED_MOTS,
    )
    assert calls_fetch.await_args.args[2] == USER_AGENT
    assert calls_fetch.await_args.kwargs["endpoint"] == ROUTING_DEPARTURE_ENDPOINT

    # Reaching only to 22:10, it is asked again once less than 90 minutes
    # of it are left, at 20:40.
    freezer.tick(timedelta(minutes=39))
    await cache.async_get(NEUE_DONAU)
    assert calls_fetch.await_count == 1
    freezer.tick(timedelta(minutes=1))
    await cache.async_get(NEUE_DONAU)
    assert calls_fetch.await_count == 2
    # Another station is a request of its own.
    await cache.async_get(HANDELSKAI)
    assert calls_fetch.await_count == 3
    assert async_get_stop_calls(hass) is cache


@pytest.mark.parametrize(
    ("last", "expires"),
    [
        # Reaching to 07:52 the next morning: six hours at most.
        (datetime(2026, 11, 11, 7, 52, tzinfo=VIENNA), timedelta(hours=6)),
        # To 23:00: once fewer than 90 minutes are left.
        (datetime(2026, 11, 10, 23, 0, tzinfo=VIENNA), timedelta(minutes=90)),
        # To 21:00: half an hour at least.
        (datetime(2026, 11, 10, 21, 0, tzinfo=VIENNA), timedelta(minutes=30)),
    ],
)
async def test_departures_are_held_by_how_far_they_reach(
    hass: HomeAssistant,
    freezer: FrozenDateTimeFactory,
    calls_fetch: AsyncMock,
    last: datetime,
    expires: timedelta,
) -> None:
    freezer.move_to(EVENING)
    calls_fetch.return_value = {
        "departureList": [
            _departure("20:03"),
            _departure(f"{last.hour}:{last.minute:02d}")
            | {
                "dateTime": {
                    "year": str(last.year),
                    "month": str(last.month),
                    "day": str(last.day),
                    "hour": str(last.hour),
                    "minute": str(last.minute),
                }
            },
        ]
    }

    held = await async_get_stop_calls(hass).async_get(NEUE_DONAU)

    assert held is not None
    assert held.expires_at == EVENING + expires


@pytest.mark.parametrize(
    "failure",
    [
        RoutingError("api_timeout", {"seconds": "20"}),
        {"departureList": []},
    ],
)
async def test_failed_departures_keep_what_was_held_and_wait(
    hass: HomeAssistant,
    freezer: FrozenDateTimeFactory,
    calls_fetch: AsyncMock,
    failure: Any,
) -> None:
    freezer.move_to(EVENING)
    cache = async_get_stop_calls(hass)
    first = await cache.async_get(NEUE_DONAU)

    freezer.tick(timedelta(minutes=40))
    if isinstance(failure, Exception):
        calls_fetch.side_effect = failure
    else:
        calls_fetch.return_value = failure
    # Past its time, but still what there is: it reaches hours ahead.
    assert await cache.async_get(NEUE_DONAU) is first
    assert calls_fetch.await_count == 2

    freezer.tick(STOP_CALLS_RETRY_AFTER - timedelta(seconds=1))
    await cache.async_get(NEUE_DONAU)
    assert calls_fetch.await_count == 2
    freezer.tick(timedelta(seconds=1))
    await cache.async_get(NEUE_DONAU)
    assert calls_fetch.await_count == 3


async def test_a_first_fetch_failing_gives_no_departures(
    hass: HomeAssistant, freezer: FrozenDateTimeFactory, calls_fetch: AsyncMock
) -> None:
    freezer.move_to(EVENING)
    calls_fetch.side_effect = RoutingError("api_timeout", {"seconds": "20"})

    assert await async_get_stop_calls(hass).async_get(NEUE_DONAU) is None


async def test_callers_asking_for_a_station_at_once_share_one_request(
    hass: HomeAssistant, freezer: FrozenDateTimeFactory, calls_fetch: AsyncMock
) -> None:
    freezer.move_to(EVENING)
    release = asyncio.Event()

    async def slow(*_args: Any, **_kwargs: Any) -> dict[str, Any]:
        await release.wait()
        return NEUE_DONAU_EVENING

    calls_fetch.side_effect = slow
    cache = async_get_stop_calls(hass)
    first = hass.async_create_task(cache.async_get(NEUE_DONAU))
    second = hass.async_create_task(cache.async_get(NEUE_DONAU))
    await asyncio.sleep(0)

    first.cancel()
    release.set()

    assert await second is not None
    assert calls_fetch.await_count == 1
