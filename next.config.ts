import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Статический сайт для GitHub Pages: next build кладёт его в out/.
  // Cache Components сюда не подходят: их частичный пререндеринг не
  // работает в режиме export, а сайт и так целиком статический.
  output: "export",
  // На Pages сайт живёт в подпапке /strelka-site/. Путь передаёт workflow,
  // а локально и на других хостингах сайт работает от корня.
  basePath: process.env.PAGES_BASE_PATH || undefined,
};

export default nextConfig;
