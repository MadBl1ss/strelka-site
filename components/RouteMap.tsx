"use client";

import { useCallback, useEffect, useRef, useState } from "react";

type Route = "vpn" | "direct" | "switch";
type Mode = "rule" | "global";
type Point = { x: number; y: number };

// Порядок сверху вниз подобран так, чтобы линии почти не пересекались.
const APPS: { name: string; note?: string; route: Route }[] = [
  { name: "Discord", note: "и PTB, Canary", route: "vpn" },
  { name: "Telegram", note: "AyuGram, 64Gram, Unigram", route: "vpn" },
  { name: "WhatsApp", note: "со звонками", route: "vpn" },
  { name: "ChatGPT и Claude", note: "приложения и сайты", route: "vpn" },
  { name: "Chrome и Edge", note: "весь браузер", route: "vpn" },
  { name: "Instagram, X, YouTube", note: "в любом браузере", route: "vpn" },
  { name: "Магазин Steam", note: "и сообщество", route: "vpn" },
  { name: "Brave, Firefox, другие сайты", route: "switch" },
  { name: "Торренты и остальное", route: "switch" },
  { name: "Steam, Dota 2, CS2", note: "игры и загрузки", route: "direct" },
  { name: "Роутер, принтер", note: "локальная сеть", route: "direct" },
];

const MODES: Record<Mode, { label: string; text: string }> = {
  rule: {
    label: "Только список",
    text: "Через VPN идут только программы из списка и заблокированные сайты. Всё остальное, включая обычные сайты в Brave и Firefox и торренты, работает напрямую на полной скорости. Этот режим включён по умолчанию.",
  },
  global: {
    label: "Весь трафик",
    text: "Как обычный VPN: через сервер идёт всё, DNS тоже. Напрямую остаются только список «напрямую» (Steam, Dota 2, CS2) и локальная сеть. Госуслуги и банки могут не пускать с зарубежного IP. Тогда добавь их в «напрямую» или вернись в первый режим.",
  },
};

// Линии входят в станцию пучком, как пути на схеме метро.
const BUNDLE_GAP = 5;

function resolve(route: Route, mode: Mode): "vpn" | "direct" {
  if (route === "switch") return mode === "global" ? "vpn" : "direct";
  return route;
}

function curve(a: Point, b: Point) {
  const mid = a.x + (b.x - a.x) * 0.55;
  return `M ${a.x} ${a.y} C ${mid} ${a.y}, ${mid} ${b.y}, ${b.x} ${b.y}`;
}

type Geometry = {
  starts: Point[];
  vpn: Point[];
  direct: Point[];
};

export function RouteMap() {
  const [mode, setMode] = useState<Mode>("rule");
  const [geo, setGeo] = useState<Geometry | null>(null);
  const wrap = useRef<HTMLDivElement>(null);
  const dots = useRef<(HTMLSpanElement | null)[]>([]);
  const vpnEnd = useRef<HTMLDivElement>(null);
  const dirEnd = useRef<HTMLDivElement>(null);

  const measure = useCallback(() => {
    const box = wrap.current?.getBoundingClientRect();
    const v = vpnEnd.current?.getBoundingClientRect();
    const d = dirEnd.current?.getBoundingClientRect();
    if (!box || !v || !d) return;

    const starts = dots.current.map((el) => {
      const r = el?.getBoundingClientRect();
      return r
        ? { x: r.left + r.width / 2 - box.left, y: r.top + r.height / 2 - box.top }
        : { x: 0, y: 0 };
    });

    // У каждой строки свой слот в пучке, одинаковый в обоих режимах,
    // поэтому при переключении линии не перескакивают.
    const slots = (target: "vpn" | "direct", end: DOMRect) => {
      const members = APPS.map((a, i) => (a.route === target || a.route === "switch" ? i : -1)).filter(
        (i) => i >= 0,
      );
      const cy = end.top + end.height / 2 - box.top;
      const x = end.left - box.left;
      return APPS.map((_, i) => {
        const k = members.indexOf(i);
        return { x, y: cy + (k - (members.length - 1) / 2) * BUNDLE_GAP };
      });
    };

    setGeo({ starts, vpn: slots("vpn", v), direct: slots("direct", d) });
  }, []);

  useEffect(() => {
    measure();
    const ro = new ResizeObserver(measure);
    if (wrap.current) ro.observe(wrap.current);
    document.fonts?.ready.then(measure);
    return () => ro.disconnect();
  }, [measure]);

  return (
    <div className="routes">
      <div className="routes-bar">
        <div className="segmented" role="group" aria-label="Режим">
          {(Object.keys(MODES) as Mode[]).map((m) => (
            <button
              key={m}
              type="button"
              aria-pressed={mode === m}
              onClick={() => setMode(m)}
            >
              {MODES[m].label}
            </button>
          ))}
        </div>
        <div className="routes-mode" aria-live="polite">
          {(Object.keys(MODES) as Mode[]).map((m) => (
            <p key={m} hidden={mode !== m}>
              {MODES[m].text}
            </p>
          ))}
        </div>
      </div>

      <div className="routes-map" ref={wrap} data-mode={mode}>
        <svg className="routes-lines" aria-hidden="true">
          {geo &&
            APPS.map((app, i) => {
              const s = geo.starts[i];
              if (app.route === "switch") {
                const on = resolve(app.route, mode);
                return (
                  <g key={app.name}>
                    <path className="ghost" d={curve(s, geo.vpn[i])} />
                    <path className="ghost" d={curve(s, geo.direct[i])} />
                    <path
                      className={`rail rail-vpn${on === "vpn" ? " on" : ""}`}
                      pathLength={1}
                      d={curve(s, geo.vpn[i])}
                    />
                    <path
                      className={`rail rail-direct${on === "direct" ? " on" : ""}`}
                      pathLength={1}
                      d={curve(s, geo.direct[i])}
                    />
                  </g>
                );
              }
              const end = app.route === "vpn" ? geo.vpn[i] : geo.direct[i];
              return (
                <path
                  key={app.name}
                  className={`rail rail-${app.route} on`}
                  pathLength={1}
                  d={curve(s, end)}
                />
              );
            })}
        </svg>

        <ul className="routes-apps">
          {APPS.map((app, i) => {
            const to = resolve(app.route, mode);
            return (
              <li key={app.name} className={`app app-${to}`}>
                <span className="app-name">{app.name}</span>
                {app.note && <span className="app-note">{app.note}</span>}
                <span className="sr-only">
                  {to === "vpn" ? ", через VPN" : ", напрямую"}
                </span>
                <span
                  className="app-dot"
                  ref={(el) => {
                    dots.current[i] = el;
                  }}
                />
              </li>
            );
          })}
        </ul>

        <div className="routes-ends">
          <div className="station station-vpn" ref={vpnEnd}>
            <strong>VPN-сервер</strong>
            <span>самый быстрый выбирает auto</span>
          </div>
          <div className="station station-direct" ref={dirEnd}>
            <strong>Напрямую</strong>
            <span>твой обычный интернет</span>
          </div>
        </div>
      </div>
    </div>
  );
}
