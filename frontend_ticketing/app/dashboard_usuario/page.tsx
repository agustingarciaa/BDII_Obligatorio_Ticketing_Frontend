"use client";

import RequireRole from "@/components/RequireRole";
import NavbarGeneral from "@/components/navbars/NavbarGeneral";
import MainBackground from "@/components/DashboardHero";
import Carrusel from "@/components/Carrusel";
import { USUARIO_NAV_LINKS } from "@/lib/nav-links";

export default function DashboardUsuario() {
  return (
    <RequireRole role="CLIENTE">
      <div className="wc-hero ">
        <NavbarGeneral links={USUARIO_NAV_LINKS} />
        <MainBackground />
        <Carrusel />
      </div>
    </RequireRole>
  );
}
