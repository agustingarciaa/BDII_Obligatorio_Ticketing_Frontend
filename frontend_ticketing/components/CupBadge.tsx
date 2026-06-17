'use client';

import { useState } from 'react';
import CupLogo from '@/components/CupLogo';

export default function CupBadge({ size = 116 }: { size?: number }) {
  const [failed, setFailed] = useState(false);

  if (failed) return <CupLogo size={size} />;

  return (
    <div className="rounded-2xl bg-white p-3 shadow-lg ring-2 ring-gold/40">
      {/* eslint-disable-next-line @next/next/no-img-element -- fallback por onError no soportado por next/image */}
      <img
        src="/cup-2026.png"
        alt="Copa Mundial FIFA 2026"
        width={size}
        height={size}
        style={{ display: 'block', objectFit: 'contain' }}
        onError={() => setFailed(true)}
      />
    </div>
  );
}
