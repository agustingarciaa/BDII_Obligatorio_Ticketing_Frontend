"use client";

import RequireRole from "@/components/RequireRole";
import NavbarGeneral from "@/components/navbars/NavbarGeneral";
import MainBackground from "@/components/MainBackground";
import Carrusel from "@/components/Carrusel";
import MisEntradasCarrusel from "@/components/MisEntradasCarrusel";
import { USUARIO_NAV_LINKS } from "@/lib/nav-links";

export default function DashboardUsuario() {
  return (
    <RequireRole role="CLIENTE">
      <div className="wc-hero flex flex-col gap-10 p-10">
        <NavbarGeneral links={USUARIO_NAV_LINKS} />
        <MainBackground />
        <Carrusel />
        <MisEntradasCarrusel />
      </div>
    </RequireRole>
  );
}
