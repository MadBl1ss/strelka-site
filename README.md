# Сайт Стрелки

Страница с инструкцией для [Стрелки](https://github.com/MadBl1ss/strelka-sing-box),
VPN для Windows на sing-box. На ней установка, как работает раздельная
маршрутизация, режимы, настоящие списки с проверкой «пойдёт ли это через VPN»,
меню щита, подписки и решение проблем. Сделана на Next.js 16.

## Запуск

```bash
npm install
npm run dev      # http://localhost:3000, правки видны сразу
npm run build    # проверка и сборка
```

## Деплой

Сайт живёт на GitHub Pages: https://madbl1ss.github.io/strelka-site/. Адреса
`github.io` в России открываются без VPN, а `*.vercel.app` у многих провайдеров
заблокированы.

Каждый пуш в `main` собирает статический экспорт (`out/`) и выкладывает его
workflow `.github/workflows/pages.yml`. Подпапку `/strelka-site` workflow
передаёт через `PAGES_BASE_PATH`. Локально переменная не нужна, и сайт работает
от корня. Чтобы собрать так же, как на Pages:

```bash
PAGES_BASE_PATH=/strelka-site npm run build
```

## Откуда данные

- `data/rules/vpn.json` и `data/rules/direct.json` — копии списков из архива
  (`package/rules` в strelka-sing-box).
- `data/itdog-*.txt` — автосписки заблокированного из
  [itdoginfo/allow-domains](https://github.com/itdoginfo/allow-domains), по ним
  работает проверка.

Когда списки в strelka-sing-box поменяются, выполни `npm run sync`, закоммить
изменения в `data/` и запушь. Сборка сама в сеть не ходит, поэтому деплой не
зависит от доступности GitHub.

Ссылка на скачивание, имя и размер архива заданы в `site.config.ts`. Ссылка
ведёт на последний релиз, так что при новой версии её менять не нужно, разве что
размер.

## Где что

- `app/page.tsx` — тексты разделов (вопросы, файлы, подсказки в начале файла)
- `app/globals.css` — цвета светлой и тёмной темы в `:root`, вся вёрстка
- `lib/rules.ts` — чтение списков и названия программ по именам exe
- `components/RulesExplorer.tsx` — проверка и визуальные списки
- `components/RouteMap.tsx` — схема «через VPN / напрямую» с переключателем режима
- `components/TrayMenu.tsx` — макет меню щита с пояснениями
- `components/Mocks.tsx` — окна Windows: «Свойства», Блокнот, уведомление, страница правил
