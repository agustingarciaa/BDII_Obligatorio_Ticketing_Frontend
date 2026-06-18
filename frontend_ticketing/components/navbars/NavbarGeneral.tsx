"use client";
import { useState, useRef, useEffect } from "react";
import { navStyles } from "./navbarStyles";

const NAV_LINKS = ["Inicio", "Partidos", "Estadios", "Selecciones"];

export default function LiquidGlassNavbar({ rol }: { rol?: string }) {
  const [active, setActive] = useState<string | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const navRef = useRef<HTMLDivElement | null>(null);
  const buttonRefs = useRef<Record<string, HTMLButtonElement | null>>({});

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 100);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div style={navStyles.wrapper}>
      <nav
        ref={navRef}
        style={{
          ...navStyles.navbar,
          opacity: isVisible ? 1 : 0,
          transform: isVisible ? "translateY(0)" : "translateY(-20px)",
        }}
      >
        <ul style={navStyles.linkList} role="list">
          {NAV_LINKS.map((label) => (
            <li key={label} style={navStyles.linkItem}>
              <button
                ref={(el) => {
                  buttonRefs.current[label] = el;
                }}
                style={navStyles.linkBtn}
                onMouseEnter={() => setActive(label)}
                onMouseLeave={() => setActive(null)}
                onClick={() => setActive(label)}
                aria-current={active === label ? "page" : undefined}
              >
                {label}
              </button>
            </li>
          ))}
        </ul>

        <button
          ref={(el) => {
            buttonRefs.current["user"] = el;
          }}
          style={navStyles.userBtn}
          onMouseEnter={() => setActive("user")}
          onMouseLeave={() => setActive(null)}
          aria-label="Perfil de usuario"
        >
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
          >
            <circle cx="12" cy="8" r="4" fill="#0f0f1a" />
            <path
              d="M4 20c0-4 3.6-7 8-7s8 3 8 7"
              stroke="#0f0f1a"
              strokeWidth="2"
              strokeLinecap="round"
              fill="none"
            />
          </svg>
        </button>
      </nav>
    </div>
  );
}
