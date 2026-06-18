import CupBadge from '@/components/CupBadge';

export default function DashboardHero() {
  return (
    <div className="relative flex flex-1 items-center justify-center overflow-hidden px-4 py-12">
      <div
        className="pointer-events-none absolute inset-x-0 bottom-0 h-[72%] bg-cover bg-bottom bg-no-repeat opacity-55"
        style={{ backgroundImage: "url(/stadium.svg)" }}
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-0 bg-cover bg-center bg-no-repeat opacity-35"
        style={{ backgroundImage: "url(/stadium.jpg)" }}
        aria-hidden
      />

      <div className="relative z-10 flex w-full max-w-md flex-col items-center gap-6">
        <CupBadge />

        <header className="flex flex-col items-center gap-3 text-center">
          <h1 className="text-4xl font-black tracking-tight text-white drop-shadow">
            MUNDIAL <span className="text-gold">2026</span>
          </h1>
          <div className="flex items-center gap-2 text-2xl" aria-hidden>
            <span title="Estados Unidos">🇺🇸</span>
            <span title="Canadá">🇨🇦</span>
            <span title="México">🇲🇽</span>
          </div>
        </header>
      </div>
    </div>
  );
}
