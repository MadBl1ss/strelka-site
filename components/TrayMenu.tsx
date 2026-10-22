"use client";

import { useId, useState } from "react";
import { Shield } from "./Shield";

type Item =
  | { kind: "sep" }
  | {
      kind: "item";
      id: string;
      label: string;
      check?: boolean;
      sub?: boolean;
      admin?: boolean;
      muted?: boolean;
    };

// Пункты и их порядок как в tray/main.go.
const ITEMS: Item[] = [
  { kind: "item", id: "status", label: "Подключено — auto → Германия — 48 мс", muted: true },
  { kind: "item", id: "status", label: "1.2 ГБ вниз / 84 МБ вверх", muted: true },
  { kind: "item", id: "status", label: "312 соединений, 47 через VPN", muted: true },
  { kind: "item", id: "status", label: "работает 03:12:45", muted: true },
  { kind: "sep" },
  { kind: "item", id: "server", label: "Сервер", sub: true },
  { kind: "item", id: "mode", label: "Через VPN только программы и сайты из списка", check: true },
  { kind: "item", id: "mode", label: "Через VPN весь трафик", check: false },
  { kind: "item", id: "test", label: "Тест серверов (пинг и скорость)" },
  { kind: "item", id: "update", label: "Обновить подписку" },
  { kind: "sep" },
  { kind: "item", id: "rules", label: "Правила маршрутизации…" },
  { kind: "item", id: "panel", label: "Открыть веб-панель" },
  { kind: "item", id: "log", label: "Показать лог" },
  { kind: "sep" },
  { kind: "item", id: "restart", label: "Перезапустить VPN", admin: true },
  { kind: "item", id: "stop", label: "Остановить VPN", admin: true },
  { kind: "sep" },
  { kind: "item", id: "vpnauto", label: "Включать VPN при входе в Windows", check: true, admin: true },
  { kind: "item", id: "iconauto", label: "Показывать иконку при входе в Windows", check: true },
  { kind: "sep" },
  { kind: "item", id: "quit", label: "Закрыть иконку (VPN останется работать)" },
];

const ABOUT: Record<string, { title: string; text: string }> = {
  status: {
    title: "Состояние",
    text: "Первые четыре строки не нажимаются, это сводка: через какой сервер ты сейчас подключён и с каким пингом, сколько скачано, сколько соединений открыто и сколько из них идёт через VPN, сколько времени VPN работает.",
  },
  server: {
    title: "Сервер",
    text: "Все серверы из подписки. auto сам держит самый быстрый и переключается, если тот упал. Страну можно выбрать вручную, например если в Discord не работают звонки или нужен конкретный регион.",
  },
  mode: {
    title: "Режимы",
    text: "Только список или весь трафик. Переключаются мгновенно, без прав администратора, и запоминаются после перезагрузки. Работают только при включённом VPN.",
  },
  test: {
    title: "Тест серверов",
    text: "Меряет пинг и скорость каждого сервера и в конце предлагает переключиться на лучший. На время теста VPN выключается. Когда тест закончится, нажми «Запустить VPN».",
  },
  update: {
    title: "Обновить подписку",
    text: "Заново скачивает список серверов по ссылке из subscription.txt. Это происходит и само при каждом запуске VPN. Нажимай, если провайдер добавил серверы или ты поменял ссылку.",
  },
  rules: {
    title: "Правила маршрутизации",
    text: "Страница в браузере со списками «через VPN» и «напрямую». На ней можно добавить программу или сайт, перенести их из одного списка в другой и посмотреть, что соединяется прямо сейчас. Изменения работают сразу.",
  },
  panel: {
    title: "Веб-панель",
    text: "Панель MetaCubeXD: графики скорости, все соединения, логи, выбор сервера. Пароль программа уже скопировала в буфер, вставь его в поле Secret сочетанием Ctrl+V.",
  },
  log: {
    title: "Показать лог",
    text: "Открывает журнал работы. Если серверы не загрузились или VPN не стартует, причина почти всегда написана там.",
  },
  restart: {
    title: "Перезапустить VPN",
    text: "Полностью перезапускает sing-box и xray. Это первое, что стоит нажать, если щит красный. Windows спросит права администратора.",
  },
  stop: {
    title: "Остановить VPN",
    text: "Выключает VPN, интернет работает как без него. Пункт меняется на «Запустить VPN». Тоже попросит права администратора.",
  },
  vpnauto: {
    title: "VPN при входе в Windows",
    text: "Задача в планировщике Windows, которая поднимает VPN при входе без окна с правами. Включена по умолчанию.",
  },
  iconauto: {
    title: "Иконка при входе в Windows",
    text: "Показывать щит в трее после входа. Если галку снять, VPN всё равно будет работать, просто его состояние не будет видно.",
  },
  quit: {
    title: "Закрыть иконку",
    text: "Убирает щит из трея, а VPN продолжает работать в фоне. Чтобы вернуть иконку, снова запусти sing-box-tray.exe.",
  },
};

// Сине-жёлтый щит UAC, которым Windows помечает действия с правами администратора.
function UacMark() {
  const clip = useId();
  return (
    <svg className="menu-uac" viewBox="0 0 16 16" width="14" height="14" aria-hidden="true">
      <clipPath id={clip}>
        <path d="M8 1 14 3.2V8c0 3.3-2.6 6-6 7-3.4-1-6-3.7-6-7V3.2Z" />
      </clipPath>
      <g clipPath={`url(#${clip})`}>
        <rect width="8" height="8" fill="#2f6fd6" />
        <rect x="8" width="8" height="8" fill="#f4c20d" />
        <rect y="8" width="8" height="8" fill="#f4c20d" />
        <rect x="8" y="8" width="8" height="8" fill="#2f6fd6" />
      </g>
    </svg>
  );
}

export function TrayMenu() {
  const [active, setActive] = useState("server");
  const about = ABOUT[active];

  return (
    <div className="tray">
      <div className="tray-stage">
        <div className="menu" aria-label="Меню щита">
          {ITEMS.map((it, i) =>
            it.kind === "sep" ? (
              <hr key={i} className="menu-sep" />
            ) : (
              <button
                key={i}
                type="button"
                className={`menu-item${it.muted ? " is-muted" : ""}`}
                aria-pressed={active === it.id}
                aria-controls="tray-about"
                onMouseEnter={() => setActive(it.id)}
                onFocus={() => setActive(it.id)}
                onClick={() => setActive(it.id)}
              >
                <span className="menu-check" aria-hidden="true">
                  {it.check ? "✓" : ""}
                </span>
                <span className="menu-label">{it.label}</span>
                {it.sub && (
                  <span className="menu-sub" aria-hidden="true">
                    ›
                  </span>
                )}
                {it.admin && (
                  <>
                    <UacMark />
                    <span className="sr-only">, нужны права администратора</span>
                  </>
                )}
              </button>
            ),
          )}
        </div>
        <div className="taskbar" aria-hidden="true">
          <span className="taskbar-chevron">^</span>
          <Shield state="ok" size={18} />
          <span className="taskbar-clock">
            <span>23:41</span>
            <span>22.10.2026</span>
          </span>
        </div>
      </div>

      <div className="tray-about" id="tray-about" aria-live="polite">
        <h3>{about.title}</h3>
        <p>{about.text}</p>
      </div>
    </div>
  );
}
