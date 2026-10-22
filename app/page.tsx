import { NotepadMock, PropertiesMock, RulesPageMock, TooltipMock, TrayStepMock } from "@/components/Mocks";
import { RouteMap } from "@/components/RouteMap";
import { RulesExplorer } from "@/components/RulesExplorer";
import { Shield, type ShieldState } from "@/components/Shield";
import { TrayMenu } from "@/components/TrayMenu";
import { loadRules } from "@/lib/rules";
import { site } from "@/site.config";

const rules = loadRules();

const NAV = [
  { href: "#install", label: "Установка" },
  { href: "#how", label: "Как работает" },
  { href: "#rules", label: "Правила" },
  { href: "#menu", label: "Меню" },
  { href: "#subscription", label: "Подписка" },
  { href: "#help", label: "Проблемы" },
];

const SHIELDS: { state: ShieldState; name: string; text: string }[] = [
  { state: "ok", name: "Зелёный", text: "Подключено, сервер отвечает. Ничего делать не нужно." },
  { state: "warn", name: "Жёлтый", text: "Сервер не отвечает. Выбери другой в меню «Сервер»." },
  { state: "error", name: "Красный", text: "VPN запущен, но не отвечает. Нажми «Перезапустить VPN»." },
  { state: "off", name: "Серый", text: "VPN выключен. Нажми «Запустить VPN» в меню." },
];

const UNDER_THE_HOOD = [
  {
    title: "Виртуальная сетевая карта",
    text: "sing-box создаёт в Windows отдельный сетевой адаптер, и весь трафик компьютера проходит через него. Для этого и нужны права администратора. По этой же причине два VPN одновременно не уживаются.",
  },
  {
    title: "Решение по программе и по сайту",
    text: "Для каждого соединения видно, какая программа его открыла и куда. Сначала проверяется список «напрямую», он сильнее. Потом список «через VPN», потом автосписок заблокированного. Всё, что не попало никуда, идёт напрямую, а в режиме «весь трафик» через VPN.",
  },
  {
    title: "DNS тоже раздельный",
    text: "Адреса сайтов из списков узнаются через зашифрованный DNS 1.1.1.1 внутри VPN. Провайдер не видит, что ты открываешь, и не может подсунуть заглушку вместо заблокированного сайта. Остальные сайты резолвятся обычным DNS Windows.",
  },
  {
    title: "Автовыбор сервера",
    text: "Группа auto регулярно пингует все серверы из подписки и держит самый быстрый. Российские серверы в auto не попадают: с блокировками они не помогут.",
  },
  {
    title: "xray.exe в помощниках",
    text: "Часть серверов (VLESS REALITY у некоторых провайдеров и все XHTTP) sing-box не умеет. Их обслуживает xray.exe на локальных портах, а sing-box просто передаёт ему трафик. Со стороны это незаметно.",
  },
  {
    title: "Списки обновляются сами",
    text: "Автосписок заблокированного sing-box скачивает с GitHub раз в сутки. В папке rules лежит его стартовая копия, так что VPN запустится, даже если GitHub недоступен. Свои правки в rules подхватываются на лету. Открытые соединения остаются там, где были, поэтому после правки перезапусти программу или обнови вкладку.",
  },
];

const RULE_TIPS = [
  {
    title: "Программа добавляется по имени exe",
    text: "Имя видно в диспетчере задач на вкладке «Подробности». Проще открыть вкладку «Сейчас активно» на странице правил: там видно, какая программа куда соединяется, и её можно отправить в VPN одной кнопкой.",
  },
  {
    title: "Сайт добавляется вместе с поддоменами",
    text: "Достаточно написать youtube.com, и www.youtube.com, m.youtube.com и все остальные поддомены пойдут так же.",
  },
  {
    title: "«Напрямую» сильнее «через VPN»",
    text: "Если программа или сайт попали в оба списка, соединение пойдёт напрямую. Перенести запись из одного списка в другой можно кнопкой ⇄.",
  },
  {
    title: "У некоторых программ есть помощники",
    text: "Магазин Steam работает через steamwebhelper.exe, а WhatsApp из Microsoft Store через msedgewebview2.exe. Если программа в списке, но не работает, посмотри «Сейчас активно» или добавь её сайты.",
  },
  {
    title: "Chrome и Edge целиком, остальные браузеры по списку",
    text: "Chrome и Edge идут через VPN со всеми сайтами. В Brave, Firefox и других браузерах через VPN идут только сайты из списков, остальное напрямую. Если сайт не открывается в Brave, открой его в Chrome или добавь домен в «Через VPN».",
  },
  {
    title: "Убрать сайт из автосписка",
    text: "Автосписка нет на странице правил, но «Напрямую» сильнее и его. Добавь сайт в «Напрямую», и он пойдёт мимо VPN.",
  },
];

const HELP = [
  {
    q: "В autostart.log написано «Серверы не получены»",
    a: "Ссылка неправильная или подписка закончилась. Проверь ссылку в subscription.txt и сохрани файл, программа попробует снова сама.",
  },
  {
    q: "«Лимит устройств исчерпан»",
    a: "У провайдера ограничено число устройств. Удали старое устройство в его боте или личном кабинете, потом нажми «Обновить подписку».",
  },
  {
    q: "«Windows защитила ваш компьютер»",
    a: "Это SmartScreen: у программы нет платной подписи. Нажми «Подробнее», потом «Выполнить в любом случае». Чтобы такое окно не появлялось на каждом файле, разблокируй архив до распаковки (шаг 1 установки).",
  },
  {
    q: "Антивирус удалил sing-box-tray.exe или xray.exe",
    a: "Это ложное срабатывание на новые программы без подписи. Добавь папку в исключения антивируса и распакуй архив заново.",
  },
  {
    q: "Щит зелёный, но ничего не открывается",
    a: "Проверь, включён ли другой VPN: два сразу не уживаются, второй надо выключить. Ещё проверь часы Windows. Если время сбито, например из-за второй операционной системы на компьютере, защищённые подключения не устанавливаются. Открой «Параметры», раздел «Время и язык», и нажми «Синхронизировать».",
  },
  {
    q: "Сайт или программа из списка всё равно не работает",
    a: "Перезапусти программу или обнови вкладку: открытые до изменения соединения остаются на старом маршруте. Если не помогло, посмотри на странице правил вкладку «Сейчас активно». Возможно, программа ходит в сеть через помощника с другим именем.",
  },
  {
    q: "Discord или WhatsApp: сообщения идут, а звонки нет",
    a: "Выбери в меню «Сервер» другую страну. Звонки идут по UDP, и не каждый сервер его хорошо пропускает.",
  },
  {
    q: "После теста серверов пропал VPN",
    a: "Так и задумано: на время теста VPN выключается. Нажми «Запустить VPN» в меню щита.",
  },
  {
    q: "Сайт из автосписка должен идти напрямую",
    a: "Например, сайт работает и без VPN, а через сервер тормозит. Добавь его на странице правил в «Напрямую»: этот список сильнее автосписка.",
  },
  {
    q: "Госуслуги или банк не пускают",
    a: "Скорее всего, включён режим «весь трафик» и сайт видит зарубежный IP. Добавь сайт в «напрямую» на странице правил или вернись в режим «только список».",
  },
];

const FILES = [
  { name: "sing-box-tray.exe", text: "иконка и управление, запускать его" },
  { name: "sing-box.exe", text: "ядро VPN" },
  { name: "xray.exe", text: "помощник для серверов, которые sing-box не умеет" },
  { name: "subscription.txt", text: "твоя ссылка на подписку" },
  { name: "config.json", text: "настройки, серверы дописываются сами" },
  { name: "rules\\", text: "списки «через VPN» и «напрямую», стартовая копия автосписка" },
  { name: "ui\\", text: "веб-панель" },
  { name: "test-servers.bat", text: "тест серверов, то же, что пункт меню" },
];

const UNINSTALL = [
  "В меню щита сними галки «Включать VPN при входе в Windows» и «Показывать иконку при входе в Windows».",
  "Нажми «Остановить VPN».",
  "Нажми «Закрыть иконку».",
  "Удали папку.",
];

function DownloadButton({ className = "" }: { className?: string }) {
  return (
    <a className={`download ${className}`} href={site.downloadUrl} download>
      <svg viewBox="0 0 20 20" width="20" height="20" aria-hidden="true">
        <path
          d="M10 3v10m0 0-4-4m4 4 4-4M4 16h12"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      Скачать для Windows
    </a>
  );
}

export default function Home() {
  return (
    <>
      <a className="skip" href="#install">
        К установке
      </a>

      <header className="top">
        <div className="wrap top-inner">
          <a className="brand" href="#">
            <Shield state="ok" size={22} />
            Стрелка
          </a>
          <nav className="top-nav" aria-label="Разделы">
            {NAV.map((n) => (
              <a key={n.href} href={n.href}>
                {n.label}
              </a>
            ))}
          </nav>
          <a className="top-github" href={site.repoUrl}>
            GitHub
          </a>
          <a className="top-download" href={site.downloadUrl} download>
            Скачать
          </a>
        </div>
      </header>

      <main>
        <section className="hero">
          <div className="wrap">
            <h1 className="hero-title">
              <span className="track track-vpn">
                <span className="track-word">Заблокированное</span>
                <span className="track-rail" aria-hidden="true" />
                <span className="track-stop">через VPN</span>
              </span>
              <span className="track track-direct">
                <span className="track-word">Всё остальное</span>
                <span className="track-rail" aria-hidden="true" />
                <span className="track-stop">напрямую</span>
              </span>
            </h1>

            <div className="hero-body">
              <div>
                <p className="lead">
                  Стрелка — VPN для Windows на sing-box, который работает только
                  там, где без него никак. Discord, Telegram, Instagram и
                  ChatGPT идут через сервер, а игры, торренты и обычные сайты
                  напрямую, без потери скорости и пинга.
                </p>
                <div className="hero-actions">
                  <DownloadButton />
                  <a className="ghost-link" href="#install">
                    Как установить
                  </a>
                </div>
                <ul className="hero-facts">
                  <li>Windows 10 и 11, 64 бита</li>
                  <li>
                    Архив {site.archiveSize}, установка не нужна
                  </li>
                  <li>Нужна своя подписка у VPN-провайдера</li>
                </ul>
              </div>
              <TooltipMock />
            </div>
          </div>
        </section>

        <section id="install" className="section">
          <div className="wrap">
            <header className="section-head">
              <h2>Установка в три шага</h2>
              <p>
                Права администратора понадобятся один раз: чтобы создать
                виртуальную сетевую карту и задачу автозапуска. Дальше VPN
                поднимается сам при входе в Windows.
              </p>
            </header>

            <ol className="steps">
              <li className="step">
                <div className="step-text">
                  <span className="step-num" aria-hidden="true">1</span>
                  <h3>Разблокируй и распакуй архив</h3>
                  <p>
                    До распаковки нажми по архиву правой кнопкой, открой
                    «Свойства», поставь внизу галку «Разблокировать» и нажми ОК.
                    Иначе Windows запомнит, что файлы скачаны из интернета, и
                    SmartScreen будет останавливать каждый запуск.
                  </p>
                  <p>
                    Распакуй куда угодно, кроме Program Files, например в{" "}
                    <code>C:\VPN\</code>. Программа пишет настройки и логи в свою
                    папку, а в Program Files это запрещено. После установки
                    папку не переноси: автозапуск привязан к её пути.
                  </p>
                </div>
                <PropertiesMock />
              </li>

              <li className="step">
                <div className="step-text">
                  <span className="step-num" aria-hidden="true">2</span>
                  <h3>Вставь ссылку на подписку</h3>
                  <p>
                    Открой <code>subscription.txt</code> Блокнотом, вставь ссылку
                    под строками с решёткой и сохрани сочетанием Ctrl+S.
                  </p>
                  <p>
                    Ссылку даёт VPN-провайдер в приложении или телеграм-боте.
                    Обычно пункт называется «Подписка» или «Скопировать ссылку»,
                    а сама ссылка начинается с <code>https://</code>.
                  </p>
                </div>
                <NotepadMock />
              </li>

              <li className="step">
                <div className="step-text">
                  <span className="step-num" aria-hidden="true">3</span>
                  <h3>Запусти sing-box-tray.exe</h3>
                  <p>
                    Согласись на права администратора. Примерно через полминуты
                    щит у часов станет зелёным, и всё готово.
                  </p>
                  <p>
                    Если запустить программу без ссылки, она сама откроет{" "}
                    <code>subscription.txt</code>. Вставь ссылку, сохрани файл,
                    и VPN включится сам.
                  </p>
                </div>
                <TrayStepMock />
              </li>
            </ol>
          </div>
        </section>

        <section id="how" className="section section-map">
          <div className="wrap">
            <header className="section-head">
              <h2>Как это работает</h2>
              <p>
                Каждое соединение проходит через развилку. sing-box смотрит,
                какая программа его открыла и на какой сайт, и отправляет его
                либо через VPN-сервер, либо напрямую. Переключи режим, чтобы
                увидеть разницу.
              </p>
            </header>

            <RouteMap />

            <h3 className="subhead">Что происходит внутри</h3>
            <dl className="facts">
              {UNDER_THE_HOOD.map((f) => (
                <div key={f.title}>
                  <dt>{f.title}</dt>
                  <dd>{f.text}</dd>
                </div>
              ))}
            </dl>
          </div>
        </section>

        <section id="shield" className="section">
          <div className="wrap">
            <header className="section-head">
              <h2>Щит у часов</h2>
              <p>
                Иконка прячется за стрелочкой ^ рядом с часами. Перетащи её на
                панель задач, чтобы она всегда была на виду. Если навести на неё
                курсор, видно сервер, пинг и сколько скачано через VPN.
              </p>
            </header>
            <ul className="shields">
              {SHIELDS.map((s) => (
                <li key={s.state} className={`shield-card shield-${s.state}`}>
                  <Shield state={s.state} size={56} />
                  <h3>{s.name}</h3>
                  <p>{s.text}</p>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section id="rules" className="section">
          <div className="wrap">
            <header className="section-head">
              <h2>Что идёт через VPN</h2>
              <p>
                Это настоящие списки из архива, а не пересказ. Проверь любую
                программу или сайт. Добавить своё можно в любой момент без прав
                администратора.
              </p>
            </header>

            <RulesExplorer rules={rules} />

            <div className="add">
              <div className="add-text">
                <h3 className="subhead">Добавить свою программу или сайт</h3>
                <p>
                  Нажми правой кнопкой по щиту и выбери «Правила
                  маршрутизации…». В браузере откроется страница. Впиши в поле
                  программу, сайт или IP-адрес и нажми «Через VPN» или
                  «Напрямую». Изменения работают сразу.
                </p>
              </div>
              <RulesPageMock />
            </div>

            <dl className="facts">
              {RULE_TIPS.map((f) => (
                <div key={f.title}>
                  <dt>{f.title}</dt>
                  <dd>{f.text}</dd>
                </div>
              ))}
            </dl>
          </div>
        </section>

        <section id="menu" className="section">
          <div className="wrap">
            <header className="section-head">
              <h2>Меню щита</h2>
              <p>
                Открывается правой кнопкой по щиту. Наведи на пункт или нажми
                на него, чтобы узнать, что он делает. Пункты со значком щита
                Windows спросят права администратора.
              </p>
            </header>
            <TrayMenu />
          </div>
        </section>

        <section id="subscription" className="section">
          <div className="wrap">
            <header className="section-head">
              <h2>Подписка и серверы</h2>
              <p>
                Программа берёт серверы из подписки VPN-провайдера и сама
                собирает из них настройки. Руками в config.json лезть не нужно.
              </p>
            </header>

            <div className="sub-grid">
              <div className="sub-block">
                <h3>Какие подписки подходят</h3>
                <p>
                  Почти всё, что сейчас продают: VLESS, в том числе REALITY и
                  XHTTP, Trojan, Shadowsocks и Hysteria2. VMess не
                  поддерживается.
                </p>
              </div>

              <div className="sub-block">
                <h3>Несколько подписок сразу</h3>
                <p>
                  Каждую ссылку пиши на своей строке. Перед ссылкой можно
                  поставить короткое имя латиницей, оно станет приставкой у
                  серверов. auto выбирает лучший сервер из всех подписок.
                </p>
                <pre className="code" aria-label="Пример subscription.txt">
                  <span>klex  https://sub.klex.example/AbC123</span>
                  {"\n"}
                  <span>lider https://lider.example/sub/XyZ789</span>
                </pre>
                <p className="small">
                  Серверы будут называться klex-DE, lider-NL и так далее.
                </p>
              </div>

              <div className="sub-block">
                <h3>Лимит устройств</h3>
                <p>
                  Некоторые провайдеры считают устройства. При первом запуске
                  программа создаёт файл <code>hwid.txt</code>, и провайдер
                  видит его как одно устройство. Не удаляй этот файл, иначе
                  провайдер посчитает компьютер новым устройством.
                </p>
              </div>

              <div className="sub-block">
                <h3>Обновление списка</h3>
                <p>
                  Серверы скачиваются заново при каждом запуске VPN и по пункту
                  «Обновить подписку». Если поменял ссылку, сохрани
                  subscription.txt и нажми «Обновить подписку».
                </p>
              </div>
            </div>
          </div>
        </section>

        <section id="help" className="section">
          <div className="wrap">
            <header className="section-head">
              <h2>Если не работает</h2>
              <p>
                Почти всегда причина написана в логе: «Показать лог» в меню или
                файл <code>autostart.log</code> в папке программы.
              </p>
            </header>
            <div className="faq">
              {HELP.map((h) => (
                <details key={h.q}>
                  <summary>{h.q}</summary>
                  <p>{h.a}</p>
                </details>
              ))}
            </div>
          </div>
        </section>

        <section id="files" className="section">
          <div className="wrap files-grid">
            <div>
              <h2>Что лежит в папке</h2>
              <table className="files">
                <tbody>
                  {FILES.map((f) => (
                    <tr key={f.name}>
                      <th scope="row">
                        <code>{f.name}</code>
                      </th>
                      <td>{f.text}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <p className="small">
                Во время работы появятся логи, <code>cache.db</code>,{" "}
                <code>xray.json</code> и <code>hwid.txt</code>. Удалять их не
                нужно.
              </p>
            </div>

            <div className="aside-stack">
              <aside className="warning">
                <h3>Не отправляй свою папку другим</h3>
                <p>
                  После настройки в ней лежат ключи от твоей подписки:{" "}
                  <code>subscription.txt</code>, <code>config.json</code>,{" "}
                  <code>xray.json</code> и <code>hwid.txt</code>. Отдать папку
                  значит отдать свой аккаунт. Другу лучше скинуть ссылку на эту
                  страницу: он скачает чистый архив и вставит свою ссылку.
                </p>
              </aside>

              <div className="uninstall">
                <h3>Как удалить</h3>
                <ol>
                  {UNINSTALL.map((s) => (
                    <li key={s}>{s}</li>
                  ))}
                </ol>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="foot">
        <div className="wrap foot-inner">
          <div className="foot-cta">
            <p className="foot-title">
              Чистый архив без чужих ключей. Скачай и вставь свою ссылку.
            </p>
            <DownloadButton />
          </div>
          <p className="foot-credits">
            Стрелка с открытым кодом: <a href={site.repoUrl}>{site.repoName} на GitHub</a>.
            Внутри открытые проекты:{" "}
            <a href="https://github.com/SagerNet/sing-box">sing-box {site.singBoxVersion}</a>,{" "}
            <a href="https://github.com/XTLS/Xray-core">Xray {site.xrayVersion}</a>, веб-панель{" "}
            <a href="https://github.com/MetaCubeX/metacubexd">MetaCubeXD</a> и списки{" "}
            <a href="https://github.com/itdoginfo/allow-domains">itdoginfo/allow-domains</a>.
          </p>
        </div>
      </footer>
    </>
  );
}
