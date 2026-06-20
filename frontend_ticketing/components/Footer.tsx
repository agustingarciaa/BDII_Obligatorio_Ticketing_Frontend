import CupBadge from "./CupBadge";

export default function Footer() {
  return (
    <footer className="flex items-center justify-center gap-3 bg-black px-6 py-8">
      <CupBadge size={40} />
      <span className="text-lg font-bold tracking-wide text-white">
        Vive el mundial
      </span>
    </footer>
  );
}
