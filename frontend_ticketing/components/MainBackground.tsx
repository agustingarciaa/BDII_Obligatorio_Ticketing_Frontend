import CupBadge from "./CupBadge";
export default function MainBackground() {
  return (
    <div className="flex  items-center justify-center min-h-[calc(100vh-64px)] bg-[radial-gradient(circle,_var(--tw-gradient-stops))] from-gray-800 via-black to-black">
      <div className="flex items-center gap-8 z-10">
        <CupBadge size={180} />
        <h1 className="text-5xl md:text-7xl font-black tracking-tighter text-white drop-shadow-2xl">
          COPA DEL MUNDO <br />
          <span className="text-gold">FIFA 2026</span>
        </h1>
      </div>
    </div>
  );
}
