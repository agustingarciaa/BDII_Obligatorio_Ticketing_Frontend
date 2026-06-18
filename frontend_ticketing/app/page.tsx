import DashboardHero from "@/components/DashboardHero";
import LoginModal from "@/components/modals/loginModal";

export default function Home() {
  return (
    <div className="wc-hero ">
      <DashboardHero />
      <div className="relative z-10 flex w-full justify-center px-4 pb-12">
        <div className="w-full max-w-md">
          <LoginModal />
        </div>
      </div>
    </div>
  );
}
