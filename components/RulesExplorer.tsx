"use client";

import { useState } from "react";
import type { Rules } from "@/lib/rules";

type Verdict = { to: "vpn" | "direct"; title: string; why: string };

// Популярное, чего нет в списках: идёт напрямую.
const NOT_LISTED = [
  "Brave",
  "Firefox",
  "Opera",
  "Яндекс Браузер",
  "qBittorrent, uTorrent",
  "Epic Games, Battle.net, EA",
  "Госуслуги и банки",
  "Яндекс, VK, Ozon, Wildberries",
];

const EXAMPLES = ["instagram.com", "brave.exe", "chrome.exe", "gemini.google.com", "ya.ru", "steam.exe"];

function normalize(input: string) {
  let s = input.trim().toLowerCase();
  s = s.replace(/^[a-z]+:\/\//, "").replace(/^\*\./, "");
  if (!s.endsWith(".exe")) s = s.split(/[/?#]/)[0].replace(/:\d+$/, "").replace(/\.$/, "");
  return s;
}

const underSuffix = (host: string, list: string[]) =>
  list.find((d) => host === d || host.endsWith("." + d.replace(/^\./, "")));

function ipToInt(ip: string) {
  const p = ip.split(".").map(Number);
  if (p.length !== 4 || p.some((n) => !Number.isInteger(n) || n < 0 || n > 255)) return null;
  return ((p[0] << 24) | (p[1] << 16) | (p[2] << 8) | p[3]) >>> 0;
}

function inCidr(ip: number, cidr: string) {
  const [base, bits] = cidr.split("/");
  const b = ipToInt(base);
  if (b === null) return false;
  const mask = Number(bits) === 0 ? 0 : (~0 << (32 - Number(bits))) >>> 0;
  return (ip & mask) === (b & mask);
}

const PRIVATE = ["10.0.0.0/8", "172.16.0.0/12", "192.168.0.0/16", "127.0.0.0/8", "169.254.0.0/16"];

// Тот же порядок, что в config.json для режима «только список».
function check(rules: Rules, raw: string): Verdict | null {
  const s = normalize(raw);
  if (!s) return null;

  if (s.endsWith(".exe")) {
    const find = (groups: Rules["vpn"]["apps"]) =>
      groups.find((g) => g.exes.some((e) => e.toLowerCase() === s));
    const dir = find(rules.direct.apps);
    if (dir) return { to: "direct", title: "Напрямую", why: `${dir.name} в списке «напрямую», чтобы не было лагов.` };
    const vpn = find(rules.vpn.apps);
    if (vpn) {
      const whole = s === "chrome.exe" || s === "msedge.exe";
      return {
        to: "vpn",
        title: "Через VPN",
        why: whole
          ? `${vpn.name} идёт через VPN целиком, со всеми сайтами.`
          : `${vpn.name} в списке «через VPN».`,
      };
    }
    return {
      to: "direct",
      title: "Напрямую",
      why: "Этой программы нет в списках. Заблокированные сайты из автосписка она всё равно откроет через VPN.",
    };
  }

  const ip = ipToInt(s);
  if (ip !== null) {
    if (PRIVATE.some((c) => inCidr(ip, c))) return { to: "direct", title: "Напрямую", why: "Это адрес локальной сети." };
    const hit = rules.vpn.cidrs.find((c) => inCidr(ip, c));
    if (hit) return { to: "vpn", title: "Через VPN", why: `Адрес входит в диапазон ${hit} из списка «через VPN».` };
    return { to: "direct", title: "Напрямую", why: "Этого адреса нет в списках." };
  }

  const dirHit = underSuffix(s, rules.direct.domains);
  if (dirHit) return { to: "direct", title: "Напрямую", why: `${dirHit} в списке «напрямую».` };
  const vpnHit = underSuffix(s, rules.vpn.domains);
  if (vpnHit) return { to: "vpn", title: "Через VPN", why: `${vpnHit} в списке «через VPN».` };
  const kw = rules.vpn.keywords.find((k) => s.includes(k));
  if (kw) return { to: "vpn", title: "Через VPN", why: `В адресе есть «${kw}», а такие сайты идут через VPN.` };
  const autoHit = underSuffix(s, rules.auto.inside);
  if (autoHit)
    return { to: "vpn", title: "Через VPN", why: `${autoHit} в автосписке заблокированных сайтов. Работает в любом браузере.` };
  const aiHit = underSuffix(s, rules.auto.googleAi);
  if (aiHit) return { to: "vpn", title: "Через VPN", why: `${aiHit} в списке ИИ от Google. Работает в любом браузере.` };
  return {
    to: "direct",
    title: "Напрямую",
    why: "Этого сайта нет в списках. Через VPN он пойдёт только в Chrome и Edge или в режиме «весь трафик».",
  };
}

export function RulesExplorer({ rules }: { rules: Rules }) {
  const [query, setQuery] = useState("");
  const verdict = check(rules, query);
  // Пара доменов есть в обоих списках.
  const autoAll = [...new Set([...rules.auto.inside, ...rules.auto.googleAi])];
  const autoTotal = autoAll.length;

  return (
    <div className="explorer">
      <div className="checker">
        <label htmlFor="checker-input">Проверь программу или сайт</label>
        <input
          id="checker-input"
          type="text"
          inputMode="url"
          autoComplete="off"
          spellCheck={false}
          placeholder="instagram.com или brave.exe"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <div className="checker-examples">
          {EXAMPLES.map((ex) => (
            <button key={ex} type="button" onClick={() => setQuery(ex)}>
              {ex}
            </button>
          ))}
        </div>
        <div className={`verdict${verdict ? ` verdict-${verdict.to}` : ""}`} aria-live="polite">
          {verdict ? (
            <>
              <strong>{verdict.title}</strong>
              <span>{verdict.why}</span>
            </>
          ) : (
            <span>
              Впиши адрес сайта или имя exe. Проверка идёт по тем же спискам, что лежат в архиве.
            </span>
          )}
        </div>
      </div>

      <div className="lists">
        <section className="list list-vpn" aria-labelledby="list-vpn-apps">
          <h3 id="list-vpn-apps">Программы через VPN</h3>
          <p className="list-note list-lead">Со всем, что они открывают.</p>
          <ul className="stations">
            {rules.vpn.apps.map((g) => (
              <li key={g.name}>
                <span className="station-name">{g.name}</span>
                <span className="station-exe">{g.exes.join(", ")}</span>
              </li>
            ))}
          </ul>
        </section>

        <section className="list list-vpn" aria-labelledby="list-vpn-sites">
          <h3 id="list-vpn-sites">Сайты через VPN</h3>
          <p className="list-note list-lead">В любой программе и любом браузере.</p>
          <ul className="chips">
            {rules.vpn.domains.map((d) => (
              <li key={d}>{d}</li>
            ))}
          </ul>
          <p className="list-note">
            И всё, где в адресе есть {rules.vpn.keywords.map((k) => `«${k}»`).join(", ")}.
          </p>

          <h4>IP-адреса для звонков и игр</h4>
          <ul className="ip-list">
            {rules.vpn.ips.map((x) => (
              <li key={x.name}>
                {x.name}: {x.count}
              </li>
            ))}
          </ul>

          <div className="auto">
            <h4>Автосписок заблокированного</h4>
            <p>
              Ещё {autoTotal.toLocaleString("ru-RU")} сайтов из{" "}
              <a href="https://github.com/itdoginfo/allow-domains">itdoginfo/allow-domains</a>:
              Instagram, X, YouTube, LinkedIn, Spotify, Notion, торрент-трекеры, новости, а также
              Gemini и другие ИИ от Google. Это те же списки, что ставят на роутеры. sing-box сам
              обновляет их раз в сутки.
            </p>
            <details>
              <summary>Показать все {autoTotal.toLocaleString("ru-RU")}</summary>
              <ul className="auto-all">
                {autoAll.map((d) => (
                  <li key={d}>{d}</li>
                ))}
              </ul>
            </details>
          </div>
        </section>

        <section className="list list-direct list-wide" aria-labelledby="list-direct">
          <h3 id="list-direct">Напрямую</h3>
          <div className="list-cols">
            <div>
              <h4>Всегда, даже в режиме «весь трафик»</h4>
              <ul className="stations">
                {rules.direct.apps.map((g) => (
                  <li key={g.name}>
                    <span className="station-name">{g.name}</span>
                    <span className="station-exe">{g.exes.join(", ")}</span>
                  </li>
                ))}
                <li>
                  <span className="station-name">Загрузки игр Steam</span>
                  <span className="station-exe">{rules.direct.domains.join(", ")}</span>
                </li>
                <li>
                  <span className="station-name">Локальная сеть</span>
                  <span className="station-exe">роутер, принтер, компьютеры дома</span>
                </li>
              </ul>
            </div>
            <div>
              <h4>Всё, чего нет в списках</h4>
              <ul className="chips chips-plain">
                {NOT_LISTED.map((x) => (
                  <li key={x}>{x}</li>
                ))}
              </ul>
              <p className="list-note">
                Они идут напрямую на полной скорости. Заблокированные сайты из автосписка всё равно
                откроются в них через VPN. В режиме «весь трафик» через VPN идёт и это.
              </p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
