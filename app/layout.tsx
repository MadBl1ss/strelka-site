import type { Metadata, Viewport } from "next";
import { JetBrains_Mono, Onest, Unbounded } from "next/font/google";
import "./globals.css";

const display = Unbounded({
  variable: "--font-display",
  subsets: ["latin", "cyrillic"],
});

const text = Onest({
  variable: "--font-text",
  subsets: ["latin", "cyrillic"],
});

const mono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin", "cyrillic"],
});

export const metadata: Metadata = {
  title: "Стрелка: VPN для Windows на sing-box",
  description:
    "VPN для Windows на sing-box, через который идут только нужные программы и заблокированные сайты. Установка за три шага, режимы, правила, решение проблем.",
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#eef2f7" },
    { media: "(prefers-color-scheme: dark)", color: "#0c1424" },
  ],
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="ru"
      className={`${display.variable} ${text.variable} ${mono.variable}`}
    >
      <body>{children}</body>
    </html>
  );
}
