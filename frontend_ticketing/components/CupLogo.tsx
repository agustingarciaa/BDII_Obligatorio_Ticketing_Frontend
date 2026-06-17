// Logo del Mundial 2026: insignia con trofeo y el año, en SVG inline.
export default function CupLogo({ size = 112 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 140 140"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="Copa Mundial 2026"
    >
      <defs>
        <linearGradient id="goldGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#ffe28a" />
          <stop offset="100%" stopColor="#e0a915" />
        </linearGradient>
      </defs>

      {/* insignia */}
      <circle cx="70" cy="70" r="66" fill="#0b1830" stroke="url(#goldGrad)" strokeWidth="3" />
      <circle cx="70" cy="70" r="60" fill="none" stroke="#ffcc29" strokeOpacity="0.25" strokeWidth="1" />

      {/* trofeo */}
      <g fill="url(#goldGrad)">
        <path d="M46 38 H94 V46 C94 64 83 77 70 77 C57 77 46 64 46 46 Z" />
        <rect x="66" y="77" width="8" height="12" />
        <rect x="55" y="89" width="30" height="6" rx="1" />
        <rect x="49" y="95" width="42" height="6" rx="1" />
      </g>
      {/* asas */}
      <g fill="none" stroke="url(#goldGrad)" strokeWidth="4" strokeLinecap="round">
        <path d="M46 43 C33 43 33 61 49 63" />
        <path d="M94 43 C107 43 107 61 91 63" />
      </g>

      {/* año */}
      <text
        x="70"
        y="124"
        textAnchor="middle"
        fontSize="20"
        fontWeight="800"
        fill="#ffcc29"
        fontFamily="system-ui, sans-serif"
      >
        2026
      </text>
    </svg>
  );
}
