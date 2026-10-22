// Всё, что может поменяться без правки вёрстки.
const repo = "MadBl1ss/strelka-sing-box";
const archiveName = "strelka-sing-box-windows-x64.zip";

export const site = {
  repoName: "strelka-sing-box",
  repoUrl: `https://github.com/${repo}`,
  // Всегда последний релиз: ссылку не нужно менять при выпуске новой версии.
  downloadUrl: `https://github.com/${repo}/releases/latest/download/${archiveName}`,
  archiveName,
  archiveSize: "51 МБ",
  singBoxVersion: "1.14",
  xrayVersion: "26.3",
};
