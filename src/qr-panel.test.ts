// @vitest-environment happy-dom

// The modern card's QR panel: the code is tinted with the station accent and
// carries the stop's transport icon on a white plate at its centre. happy-dom
// has no 2D canvas, so qr-creator is replaced by a stub that appends a canvas,
// and that canvas hands out a recording context.

import { afterEach, beforeEach, describe, expect, it, vi } from "vite-plus/test";

const qrRender = vi.hoisted(() =>
  vi.fn((_opts: Record<string, unknown>, host: HTMLElement) => {
    host.appendChild(document.createElement("canvas"));
  }),
);
vi.mock("qr-creator", () => ({ default: { render: qrRender } }));

import "./wiener-linien-austria-card.js";

import type { HomeAssistant } from "./types.js";

interface CardElement extends HTMLElement {
  hass: HomeAssistant | undefined;
  setConfig(config: Record<string, unknown>): void;
  updateComplete: Promise<unknown>;
}

const TAG = "wiener-linien-austria-card";
const ENTITY = "sensor.westbahnhof_abfahrten";

function hass(): HomeAssistant {
  return {
    language: "de",
    themes: { darkMode: false },
    localize: (key: string) => key,
    states: {
      [ENTITY]: {
        entity_id: ENTITY,
        state: "0",
        attributes: {
          stop_name: "Westbahnhof",
          latitude: 48.1966,
          longitude: 16.3378,
          departures: [],
          traffic_info: [],
          elevator_info: [],
        },
      },
    },
  };
}

/** The calls a test cares about, in the order the card made them. */
function recordingContext(withRoundRect: boolean) {
  const calls: string[] = [];
  const ctx: Record<string, unknown> = {
    fillStyle: "",
    beginPath: () => calls.push("beginPath"),
    fill: () => calls.push(`fill ${String(ctx.fillStyle)}`),
    fillRect: () => calls.push(`fillRect ${String(ctx.fillStyle)}`),
    save: () => calls.push("save"),
    restore: () => calls.push("restore"),
    translate: () => undefined,
    scale: () => undefined,
  };
  if (withRoundRect) ctx.roundRect = () => calls.push("roundRect");
  return { ctx, calls };
}

async function openQr(): Promise<CardElement> {
  const el = document.createElement(TAG) as CardElement;
  document.body.appendChild(el);
  el.hass = hass();
  el.setConfig({ type: `custom:${TAG}`, entities: [{ entity: ENTITY }] });
  await el.updateComplete;
  const toggle = el.shadowRoot!.querySelector<HTMLButtonElement>(".qr-toggle");
  if (!toggle) throw new Error("no QR toggle rendered");
  toggle.click();
  await el.updateComplete;
  return el;
}

beforeEach(() => {
  document.body.innerHTML = "";
  qrRender.mockClear();
  vi.stubGlobal(
    "Path2D",
    class {
      constructor(public d: string) {}
    },
  );
});

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

describe("QR panel", () => {
  it("encodes the stop's geo link at the error level that survives the icon", async () => {
    const { ctx } = recordingContext(true);
    vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockReturnValue(
      ctx as unknown as CanvasRenderingContext2D,
    );
    await openQr();
    expect(qrRender).toHaveBeenCalledOnce();
    const [opts] = qrRender.mock.calls[0]!;
    expect(opts.text).toMatch(/^geo:48\.1966,16\.3378\?q=/);
    expect(opts.ecLevel).toBe("H");
    expect(opts.background).toBe("#fff");
  });

  it("draws the icon in the QR's colour on a rounded white plate", async () => {
    const { ctx, calls } = recordingContext(true);
    vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockReturnValue(
      ctx as unknown as CanvasRenderingContext2D,
    );
    await openQr();
    const [opts] = qrRender.mock.calls[0]!;
    expect(calls).toEqual([
      "beginPath",
      "roundRect",
      "fill #fff",
      "save",
      `fill ${String(opts.fill)}`,
      "restore",
    ]);
  });

  it("falls back to a square plate where the canvas has no roundRect", async () => {
    const { ctx, calls } = recordingContext(false);
    vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockReturnValue(
      ctx as unknown as CanvasRenderingContext2D,
    );
    await openQr();
    expect(calls[0]).toBe("fillRect #fff");
  });

  it("logs and leaves the bare code when the canvas has no 2D context", async () => {
    vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockReturnValue(null);
    const error = vi.spyOn(console, "error").mockImplementation(() => undefined);
    const el = await openQr();
    expect(error).toHaveBeenCalledWith("[wiener-linien-austria-card] QR canvas unavailable");
    expect(el.shadowRoot!.querySelectorAll(".qr-canvas canvas")).toHaveLength(1);
  });

  it("keeps one canvas and draws once while the link stays the same", async () => {
    const { ctx } = recordingContext(true);
    vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockReturnValue(
      ctx as unknown as CanvasRenderingContext2D,
    );
    const el = await openQr();
    el.hass = hass();
    await el.updateComplete;
    expect(qrRender).toHaveBeenCalledOnce();
    expect(el.shadowRoot!.querySelectorAll(".qr-canvas canvas")).toHaveLength(1);
  });
});
