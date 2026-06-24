import type { ReactNode } from "react";

type Props<T> = {
  title: string;
  data: T[];
  loading: boolean;
  error: string | null;
  renderRow: (item: T, index: number) => ReactNode;
  onViewAll?: () => void;
};

export default function StatBlock<T>({
  title,
  data,
  loading,
  error,
  renderRow,
  onViewAll,
}: Props<T>) {
  const clickable = onViewAll && !loading && !error && data.length > 0;

  return (
    <div
      onClick={clickable ? onViewAll : undefined}
      onKeyDown={
        clickable
          ? (e) => { if (e.key === "Enter" || e.key === " ") onViewAll(); }
          : undefined
      }
      tabIndex={clickable ? 0 : undefined}
      role={clickable ? "button" : undefined}
      className={`flex min-h-64 flex-col gap-4 rounded-2xl border p-6 shadow-lg transition-all ${
        clickable
          ? "cursor-pointer border-white/10 bg-night-soft hover:border-gold/40 hover:bg-night-soft/80"
          : "border-white/10 bg-night-soft"
      }`}
    >
      <div className="flex items-center justify-between">
        <h3 className="text-base font-bold uppercase tracking-wide text-gold">
          {title}
        </h3>
        {clickable && (
          <span className="shrink-0 rounded-md border border-gold/30 bg-gold/10 px-2.5 py-0.5 text-[11px] font-semibold text-gold">
            Ver totales &rarr;
          </span>
        )}
      </div>

      {loading && <p className="text-xs text-white/50">Cargando…</p>}

      {error && <p className="text-xs text-red-400">{error}</p>}

      {!loading && !error && data.length === 0 && (
        <p className="text-xs text-white/50">Sin datos.</p>
      )}

      {!loading && !error && data.length > 0 && (
        <div className="flex flex-1 flex-col gap-1.5 overflow-y-auto">
          {data.slice(0, 8).map((item, i) => (
            <div
              key={i}
              className="rounded-lg border border-white/5 bg-white/5 px-3 py-2"
            >
              {renderRow(item, i)}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
