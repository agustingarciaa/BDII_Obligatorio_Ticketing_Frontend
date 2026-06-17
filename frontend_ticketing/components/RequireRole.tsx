'use client';

import { useEffect, useSyncExternalStore } from 'react';
import { useRouter } from 'next/navigation';
import { getRole, type Role } from '@/lib/auth';

// Suscripción al storage para reaccionar a login/logout en otra pestaña.
function subscribe(callback: () => void) {
  window.addEventListener('storage', callback);
  return () => window.removeEventListener('storage', callback);
}

export default function RequireRole({
  role,
  children,
}: {
  role: Role;
  children: React.ReactNode;
}) {
  const router = useRouter();

  const current = useSyncExternalStore(
    subscribe,
    () => getRole(),
    () => null,
  );

  useEffect(() => {
    if (current !== role) {
      router.replace('/');
    }
  }, [current, role, router]);

  if (current !== role) return null;
  return <>{children}</>;
}
