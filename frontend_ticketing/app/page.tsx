import DashboardHero from "@/components/DashboardHero";
import LoginModal from "@/components/modals/loginModal";
import NavbarGeneral from "@/components/navbars/NavbarGeneral";

export default function Home() {
  return (
    <div className="wc-hero ">
      <NavbarGeneral />
      <DashboardHero />
      <LoginModal />
    </div>
  );
}
