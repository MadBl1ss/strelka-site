import { readFileSync } from "node:fs";
import { join } from "node:path";

// Читает копии правил из data/ во время сборки сайта. Копии берутся из
// package/rules репозитория strelka-sing-box командой npm run sync, поэтому
// списки на странице совпадают с тем, что лежит в архиве.

const dataDir = join(process.cwd(), "data");
const rulesDir = join(dataDir, "rules");

type Headless = {
  process_name?: string[];
  domain_suffix?: string[];
  domain_keyword?: string[];
  ip_cidr?: string[];
};

function readSet(name: string) {
  const json = JSON.parse(readFileSync(join(rulesDir, name), "utf8")) as {
    rules: Headless[];
  };
  const pick = (k: keyof Headless) => json.rules.flatMap((r) => r[k] ?? []);
  return {
    apps: pick("process_name"),
    domains: pick("domain_suffix"),
    keywords: pick("domain_keyword"),
    ips: pick("ip_cidr"),
  };
}

function readList(name: string) {
  return readFileSync(join(dataDir, name), "utf8")
    .split("\n")
    .map((s) => s.trim())
    .filter(Boolean);
}

// Названия, по которым человек узнает программу. Ключ — имя exe в нижнем регистре.
const APP_NAMES: Record<string, string> = {
  "discord.exe": "Discord",
  "discordptb.exe": "Discord",
  "discordcanary.exe": "Discord",
  "discorddevelopment.exe": "Discord",
  "telegram.exe": "Telegram",
  "ayugram.exe": "AyuGram",
  "64gram.exe": "64Gram",
  "unigram.exe": "Unigram",
  "whatsapp.exe": "WhatsApp",
  "whatsapp.root.exe": "WhatsApp",
  "signal.exe": "Signal",
  "viber.exe": "Viber",
  "chatgpt.exe": "ChatGPT",
  "claude.exe": "Claude",
  "code.exe": "VS Code",
  "code - insiders.exe": "VS Code",
  "cursor.exe": "Cursor",
  "spotify.exe": "Spotify",
  "notion.exe": "Notion",
  "robloxplayerbeta.exe": "Roblox",
  "robloxstudiobeta.exe": "Roblox",
  "chrome.exe": "Google Chrome",
  "msedge.exe": "Microsoft Edge",
  "steamwebhelper.exe": "Магазин Steam",
  "youtubedownloader.exe": "YouTube Downloader",
  "steam.exe": "Steam",
  "steamservice.exe": "Steam",
  "dota2.exe": "Dota 2",
  "cs2.exe": "CS2",
};

export type AppGroup = { name: string; exes: string[] };

// sing-box сравнивает process_name с учётом регистра, поэтому в списках оба
// варианта. Человеку показываем одно имя на exe.
function groupApps(apps: string[]): AppGroup[] {
  const byExe = new Map<string, string>();
  for (const a of apps) {
    const key = a.toLowerCase();
    const prev = byExe.get(key);
    if (!prev || (a !== key && prev === key)) byExe.set(key, a);
  }
  const groups = new Map<string, string[]>();
  for (const [key, shown] of byExe) {
    const name = APP_NAMES[key] ?? shown;
    groups.set(name, [...(groups.get(name) ?? []), shown]);
  }
  // Порядок как в APP_NAMES: сначала то, ради чего ставят VPN.
  const order = [...new Set(Object.values(APP_NAMES))];
  const rank = (name: string) => (order.includes(name) ? order.indexOf(name) : order.length);
  return [...groups]
    .map(([name, exes]) => ({ name, exes }))
    .sort((a, b) => rank(a.name) - rank(b.name));
}

const TELEGRAM_IPS = new Set(["91.108.0.0/16", "149.154.160.0/20"]);
const ROBLOX_IPS = new Set(["128.116.0.0/17", "209.206.40.0/21"]);

function labelIPs(ips: string[]) {
  const tg = ips.filter((ip) => TELEGRAM_IPS.has(ip)).length;
  const rb = ips.filter((ip) => ROBLOX_IPS.has(ip)).length;
  const meta = ips.length - tg - rb;
  return [
    { name: "Telegram", count: tg },
    { name: "Meta, для звонков WhatsApp", count: meta },
    { name: "Roblox", count: rb },
  ].filter((x) => x.count > 0);
}

export function loadRules() {
  const vpn = readSet("vpn.json");
  const direct = readSet("direct.json");
  return {
    vpn: {
      apps: groupApps(vpn.apps),
      exes: vpn.apps,
      domains: vpn.domains,
      keywords: vpn.keywords,
      ips: labelIPs(vpn.ips),
      cidrs: vpn.ips,
    },
    direct: {
      apps: groupApps(direct.apps),
      exes: direct.apps,
      domains: direct.domains,
    },
    auto: {
      inside: readList("itdog-inside.txt"),
      googleAi: readList("itdog-google-ai.txt"),
    },
  };
}

export type Rules = ReturnType<typeof loadRules>;
