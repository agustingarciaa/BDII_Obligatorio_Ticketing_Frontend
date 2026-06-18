"use client";

import RequireRole from "@/components/RequireRole";
import NavbarGeneral from "@/components/navbars/NavbarGeneral";
import MainBackground from "@/components/DashboardHero";
import Carrusel from "@/components/Carrusel";

export default function DashboardUsuario() {
  return (
    <RequireRole role="CLIENTE">
      <div className="wc-hero ">
        <NavbarGeneral />
        <MainBackground />
        <Carrusel />
      </div>
    </RequireRole>
  );
}
