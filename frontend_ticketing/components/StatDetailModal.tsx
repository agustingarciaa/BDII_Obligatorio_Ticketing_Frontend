import type { ReactNode } from "react";

type StatTotal = {
  label: string;
  value: string;
};

type Props<T> = {
  title: string;
  data: T[];
  totals: StatTotal[];
  renderRow: (item: T, index: number) => ReactNode;
  onClose: () => void;
};

export default function StatDetailModal<T>({
  title,
  data,
  totals,
  renderRow,
  onClose,
}: Props<T>) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
      onClick={onClose}
    >
      <div
        className="flex max-h-[85vh] w-full max-w-2xl flex-col gap-6 rounded-2xl border border-white/10 bg-night-soft p-8 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-white">{title}</h2>
          <button
            onClick={onClose}
            className="rounded-lg border border-white/10 px-3 py-1 text-sm text-white/50 transition-colors hover:border-white/30 hover:text-white"
          >
            Cerrar
          </button>
        </div>

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
          {totals.map((t, i) => (
            <div
              key={i}
              className="overflow-hidden rounded-xl border border-white/5 bg-white/5 px-4 py-3"
            >
              <p className="truncate text-[11px] uppercase tracking-wide text-white/40">
                {t.label}
              </p>
              <p className="mt-1 truncate text-lg font-bold text-gold">
                {t.value}
              </p>
            </div>
          ))}
        </div>

        <div className="flex flex-col gap-2 overflow-y-auto">
          {data.length === 0 && (
            <p className="text-sm text-white/50">Sin datos.</p>
          )}
          {data.map((item, i) => (
            <div
              key={i}
              className="rounded-lg border border-white/5 bg-white/5 px-4 py-3"
            >
              {renderRow(item, i)}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
