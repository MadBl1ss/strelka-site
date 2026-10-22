import { site } from "@/site.config";
import { Shield } from "./Shield";

// Упрощённые окна Windows для иллюстраций. Тексты взяты из самой программы
// и из Windows, чтобы человек узнал то, что увидит у себя.

function Window({
  title,
  children,
  className = "",
}: {
  title: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`win ${className}`} aria-hidden="true">
      <div className="win-title">
        <span>{title}</span>
        <span className="win-controls">
          <i>–</i>
          <i>□</i>
          <i>✕</i>
        </span>
      </div>
      <div className="win-body">{children}</div>
    </div>
  );
}

export function PropertiesMock() {
  return (
    <Window title={`Свойства: ${site.archiveName}`} className="win-props">
      <div className="props-tabs">
        <span className="on">Общие</span>
        <span>Безопасность</span>
        <span>Подробно</span>
      </div>
      <dl className="props-rows">
        <dt>Тип файла:</dt>
        <dd>Сжатая ZIP-папка</dd>
        <dt>Размер:</dt>
        <dd>{site.archiveSize}</dd>
      </dl>
      <div className="props-warn">
        <span>Осторожно:</span>
        <p>
          Этот файл получен с другого компьютера и, возможно, был заблокирован
          с целью защиты компьютера.
        </p>
        <label className="props-check">
          <span className="box">✓</span>
          Разблокировать
        </label>
      </div>
      <div className="props-buttons">
        <span className="btn-win primary">ОК</span>
        <span className="btn-win">Отмена</span>
      </div>
    </Window>
  );
}

export function NotepadMock() {
  return (
    <Window title="subscription.txt — Блокнот" className="win-notepad">
      <div className="notepad-menu">
        <span>Файл</span>
        <span>Правка</span>
        <span>Просмотр</span>
      </div>
      <pre className="notepad-text">
        <span className="c"># Вставь ссылку на свою VPN-подписку ПОД этими</span>
        {"\n"}
        <span className="c"># строками и сохрани (Ctrl+S).</span>
        {"\n"}
        <span className="c"># Строки с # в начале — пояснения.</span>
        {"\n\n"}
        <span className="link">https://sub.provider.com/AbCdEf123</span>
        <span className="caret" />
      </pre>
    </Window>
  );
}

export function TrayStepMock() {
  return (
    <div className="traystep" aria-hidden="true">
      <div className="traystep-row">
        <span className="traystep-chip">
          <Shield state="off" size={20} />
          запуск
        </span>
        <span className="traystep-wait">около 30 секунд</span>
        <span className="traystep-chip">
          <Shield state="ok" size={20} />
          подключено
        </span>
      </div>
      <div className="toast">
        <Shield state="ok" size={28} />
        <div>
          <strong>VPN подключен</strong>
          <span>Сервер auto → Германия, пинг 48 мс</span>
        </div>
      </div>
    </div>
  );
}

export function TooltipMock() {
  return (
    <div className="hero-tray" aria-hidden="true">
      <div className="hero-tip">
        sing-box — Подключено — auto → Германия — 48 мс
        <br />
        1.2 ГБ вниз, 47 через VPN
      </div>
      <div className="taskbar">
        <span className="taskbar-chevron">^</span>
        <Shield state="ok" size={18} />
        <span className="taskbar-clock">
          <span>23:41</span>
          <span>22.10.2026</span>
        </span>
      </div>
    </div>
  );
}

export function RulesPageMock() {
  return (
    <Window title="Правила маршрутизации" className="win-rules">
      <div className="rules-add">
        <span className="rules-input">steam.exe, youtube.com, 1.2.3.0/24 …</span>
        <span className="rules-btn vpn">Через VPN</span>
        <span className="rules-btn dir">Напрямую</span>
      </div>
      <div className="rules-tabs">
        <span className="on">Правила</span>
        <span>Сейчас активно</span>
      </div>
      <div className="rules-live">
        <div>
          <span className="mono">Discord.exe</span>
          <span>gateway.discord.gg</span>
          <span className="tag vpn">VPN</span>
        </div>
        <div>
          <span className="mono">chrome.exe</span>
          <span>www.youtube.com</span>
          <span className="tag dir">напрямую</span>
        </div>
        <div>
          <span className="mono">steamwebhelper.exe</span>
          <span>store.steampowered.com</span>
          <span className="tag vpn">VPN</span>
        </div>
        <div>
          <span className="mono">cs2.exe</span>
          <span>162.254.197.36</span>
          <span className="tag dir">напрямую</span>
        </div>
      </div>
    </Window>
  );
}
