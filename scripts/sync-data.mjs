// Refreshes data/ from upstream:
//   data/rules/*.json  the lists shipped in the Strelka archive
//   data/*.txt         the itdoginfo auto lists the checker matches against
// Run after the lists change in strelka-sing-box: npm run sync

import { mkdir, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const strelka = "https://raw.githubusercontent.com/MadBl1ss/strelka-sing-box/main/package/rules/";
const itdog = "https://raw.githubusercontent.com/itdoginfo/allow-domains/main/";

async function fetchText(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`${url}: HTTP ${res.status}`);
  return res.text();
}

async function save(rel, text) {
  const path = join(root, "data", rel);
  await mkdir(dirname(path), { recursive: true });
  await writeFile(path, text);
}

for (const name of ["vpn.json", "direct.json"]) {
  const text = await fetchText(strelka + name);
  JSON.parse(text); // refuse to save a broken file
  await save(join("rules", name), text);
  console.log(`rules/${name}: ${text.length} bytes`);
}

for (const [file, src] of [
  ["itdog-inside.txt", "Russia/inside-raw.lst"],
  ["itdog-google-ai.txt", "Services/google_ai.lst"],
]) {
  const domains = (await fetchText(itdog + src))
    .split(/\r?\n/)
    .map((s) => s.trim())
    .filter((s) => s && !s.startsWith("#"));
  await save(file, domains.join("\n") + "\n");
  console.log(`${file}: ${domains.length} domains`);
}
