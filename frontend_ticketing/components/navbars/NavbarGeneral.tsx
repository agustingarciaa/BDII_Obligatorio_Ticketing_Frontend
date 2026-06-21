"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useRef, useEffect, CSSProperties } from "react";

export interface NavLink {
  label: string;
  href: string;
}

const DEFAULT_LINKS: NavLink[] = [
  { label: "Partidos", href: "/dashboard_admin/partidos" },
  { label: "Estadios", href: "/estadios" },
  { label: "Selecciones", href: "/selecciones" },
];

type NavLabel = string | null;

interface GlassStyle {
  width?: number;
  height?: number;
  transform?: string;
  opacity?: number;
}

interface NavbarGeneralProps {
  links?: NavLink[];
  rol?: string;
}

export default function NavbarGeneral({ links = DEFAULT_LINKS }: NavbarGeneralProps) {
  const [active, setActive] = useState<NavLabel>(null);
  const [glassStyle, setGlassStyle] = useState<GlassStyle>({});
  const [isVisible, setIsVisible] = useState(false);
  const router = useRouter();
  const navRef = useRef<HTMLElement>(null);
  const buttonRefs = useRef<
    Record<string, HTMLButtonElement | HTMLDivElement | HTMLAnchorElement | null>
  >({});

  useEffect(() => {
    const t = setTimeout(() => setIsVisible(true), 100);
    return () => clearTimeout(t);
  }, []);

  const handleEnter = (label: NavLabel, el: HTMLElement | null) => {
    if (!navRef.current || !el) return;
    const navRect = navRef.current.getBoundingClientRect();
    const btnRect = el.getBoundingClientRect();
    setGlassStyle({
      width: btnRect.width,
      height: btnRect.height,
      transform: `translate(${btnRect.left - navRect.left}px, ${btnRect.top - navRect.top}px)`,
      opacity: 1,
    });
    setActive(label);
  };

  const handleLeave = () => {
    setActive(null);
    setGlassStyle((prev) => ({ ...prev, opacity: 0 }));
  };

  const blobTransition =
    "width 0.4s cubic-bezier(0.34,1.36,0.64,1), height 0.4s cubic-bezier(0.34,1.36,0.64,1), transform 0.4s cubic-bezier(0.34,1.36,0.64,1), opacity 0.22s ease";

  return (
    <>
      <style>{`
        @keyframes shimmer {
          0%   { transform: translateX(-120%) skewX(-18deg); }
          100% { transform: translateX(280%) skewX(-18deg); }
        }
        @keyframes navIn {
          from { opacity: 0; transform: translateY(-16px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .nav-animate {
          animation: navIn 0.5s cubic-bezier(0.34,1.56,0.64,1) forwards;
        }
        .glass-shimmer {
          animation: shimmer 2.8s ease-in-out infinite 0.2s;
        }
      `}</style>

      {/* Wrapper: centra el nav horizontalmente */}
      <div className="sticky top-0 z-50 w-full flex justify-center px-6 py-4">
        <nav
          ref={navRef}
          onMouseLeave={handleLeave}
          className={`
            relative flex items-center gap-6
            bg-[rgba(10,10,18,0.92)]
            border border-white/[0.08]
            rounded-full px-3.5 py-2.5
            shadow-[0_8px_40px_rgba(0,0,0,0.6),inset_0_1px_0_rgba(255,255,255,0.06)]
            overflow-hidden
            ${isVisible ? "nav-animate" : "opacity-0"}
          `}
        >
          {/* ── Liquid glass blob ── */}
          <div
            aria-hidden="true"
            className="absolute top-0 left-0 rounded-full pointer-events-none z-0 overflow-hidden"
            style={{
              ...(glassStyle as CSSProperties),
              transition: blobTransition,
            }}
          >
            {/* Base translúcida */}
            <div
              className="absolute inset-0 rounded-full"
              style={{
                background:
                  "linear-gradient(160deg, rgba(255,255,255,0.85) 0%, rgba(220,230,255,0.75) 60%, rgba(200,215,255,0.65) 100%)",
                boxShadow:
                  "0 0 0 1px rgba(255,255,255,0.28), 0 4px 20px rgba(255,255,255,0.10)",
              }}
            />
            {/* Brillo superior */}
            <div
              className="absolute rounded-full blur-[1.5px]"
              style={{
                top: "4%",
                left: "6%",
                right: "6%",
                height: "44%",
                background:
                  "linear-gradient(180deg, rgba(255,255,255,0.55) 0%, rgba(255,255,255,0.03) 100%)",
              }}
            />
            {/* Shimmer diagonal */}
            <div
              className="absolute inset-0 rounded-full glass-shimmer"
              style={{
                background:
                  "linear-gradient(110deg, transparent 20%, rgba(255,255,255,0.28) 50%, transparent 80%)",
              }}
            />
            {/* Borde luminoso */}
            <div className="absolute inset-0 rounded-full border border-white/40" />
          </div>

          {/* ── Logo ── */}
          <Link
            href="/"
            ref={(el) => {
              buttonRefs.current["logo"] = el;
            }}
            aria-label="Inicio"
            className="relative z-10 shrink-0 w-[46px] h-[46px] rounded-full bg-white/[0.7] border border-white/[0.14] flex items-center justify-center cursor-pointer overflow-hidden"
          >
            <img
              src="/cup-2026.png"
              alt="Copa Mundial"
              width={46}
              height={46}
              className="object-cover w-full h-full"
            />
          </Link>

          {/* ── Nav links ── */}
          <ul className="flex items-center gap-0.5 list-none mx-2 p-0 flex-1 justify-center">
            {links.map((link) => (
              <li key={link.label}>
                <button
                  ref={(el) => {
                    buttonRefs.current[link.label] = el;
                  }}
                  onMouseEnter={() =>
                    handleEnter(link.label, buttonRefs.current[link.label] as HTMLElement)
                  }
                  onClick={() => {
                    setActive(link.label);
                    router.push(link.href);
                  }}
                  aria-current={active === link.label ? "page" : undefined}
                  className="relative z-10 bg-transparent border-none cursor-pointer px-5 py-3 rounded-full text-[15px] tracking-wide whitespace-nowrap font-sans transition-colors duration-200"
                  style={{
                    color: active === link.label ? "#111" : "rgba(255,255,255,0.78)",
                    fontWeight: active === link.label ? 600 : 400,
                  }}
                >
                  {link.label}
                </button>
              </li>
            ))}
          </ul>

          {/* ── User icon ── */}
          <button
            ref={(el) => {
              buttonRefs.current["user"] = el;
            }}
            onMouseEnter={() =>
              handleEnter("user", buttonRefs.current["user"] as HTMLElement)
            }
            onClick={() => {
              router.push("/dashboard_usuario/perfil");
            }}
            aria-label="Perfil de usuario"
            className={`relative z-10 shrink-0 w-[46px] h-[46px] rounded-full flex items-center justify-center cursor-pointer transition-transform duration-150 ${
              active === "user"
                ? "bg-transparent border-0"
                : "bg-white/10 border border-white/[0.18]"
            }`}
          >
            <svg
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="none"
              aria-hidden="true"
            >
              <circle
                cx="12"
                cy="8"
                r="4"
                fill={active === "user" ? "#111" : "white"}
              />
              <path
                d="M4 20c0-4 3.6-7 8-7s8 3 8 7"
                stroke={active === "user" ? "#111" : "white"}
                strokeWidth="2"
                strokeLinecap="round"
                fill="none"
              />
            </svg>
          </button>
        </nav>
      </div>
    </>
  );
}
