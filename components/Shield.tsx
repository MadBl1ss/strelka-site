// Тот же щит, что рисует трей (tray/icon.go), с теми же цветами.
const COLORS = {
  ok: ["#2ecc71", "#187842"],
  warn: ["#f1c40f", "#8c6e0a"],
  error: ["#e74c3c", "#82281f"],
  off: ["#828c96", "#464e56"],
} as const;

export type ShieldState = keyof typeof COLORS;

export function Shield({
  state,
  size = 24,
  className,
}: {
  state: ShieldState;
  size?: number;
  className?: string;
}) {
  const [fill, edge] = COLORS[state];
  return (
    <svg
      viewBox="0 0 32 32"
      width={size}
      height={size}
      className={className}
      aria-hidden="true"
    >
      <polygon
        points="16,1 30,8 30,17 16,31 2,17 2,8"
        fill={fill}
        stroke={edge}
        strokeWidth="2"
        strokeLinejoin="round"
      />
    </svg>
  );
}
