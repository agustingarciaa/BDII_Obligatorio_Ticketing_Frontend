import type { ReactNode } from "react";

type Props<T> = {
  title: string;
  data: T[];
  loading: boolean;
  error: string | null;
  renderRow: (item: T, index: number) => ReactNode;
};

export default function StatBlock<T>({
  title,
  data,
  loading,
  error,
  renderRow,
}: Props<T>) {
  return (
    <div className="flex min-h-64 flex-col gap-4 rounded-2xl border border-white/10 bg-night-soft p-6 shadow-lg">
      <h3 className="text-base font-bold uppercase tracking-wide text-gold">
        {title}
      </h3>

      {loading && (
        <p className="text-xs text-white/50">Cargando…</p>
      )}

      {error && (
        <p className="text-xs text-red-400">{error}</p>
      )}

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
