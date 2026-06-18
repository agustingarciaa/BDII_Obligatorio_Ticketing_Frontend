import DashboardHero from "@/components/DashboardHero";
import NavbarGeneral from "@/components/navbars/NavbarGeneral";

export default function Home() {
  return (
    <div className="wc-hero ">
      <NavbarGeneral />
      <DashboardHero />
    </div>
  );
}
