import DashboardHero from "@/components/DashboardHero";
import LoginModal from "@/components/modals/loginModal";

export default function Home() {
  return (
    <div className="wc-hero min-h-screen flex items-center">
      <div className="relative z-10 flex h-full w-full  justify-center px-4">
        <div className="w-full max-w-md">
          <LoginModal />
        </div>
      </div>
    </div>
  );
}
