import DashboardHero from "@/components/DashboardHero";
import LiquidGlassNavbar from "@/components/navbars/NavbarGeneral";

export default function Home() {
  return (
    <div className="wc-hero flex flex-1">
      <LiquidGlassNavbar />
      <DashboardHero />

      <div></div>
    </div>
  );
}
