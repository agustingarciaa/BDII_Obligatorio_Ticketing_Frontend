import type { NavLink } from '@/components/navbars/NavbarGeneral';

export const USUARIO_NAV_LINKS: NavLink[] = [
  { label: 'Inicio', href: '/dashboard_usuario' },
  { label: 'Partidos', href: '/dashboard_usuario/partidos' },
  { label: 'Mis entradas', href: '/dashboard_usuario/mis-entradas' },
  { label: 'Mis compras', href: '/dashboard_usuario/mis-compras' },
  { label: 'Transferencias', href: '/dashboard_usuario/mis-transferencias' },
];

export const ADMIN_NAV_LINKS: NavLink[] = [
  { label: 'Partidos', href: '/dashboard_admin/partidos' },
  { label: 'Estadios', href: '/dashboard_admin/estadios' },
  { label: 'Selecciones', href: '/dashboard_admin/selecciones' },
  { label: 'Operaciones', href: '/dashboard_admin/operaciones' },
  { label: 'Dispositivos', href: '/dashboard_admin/dispositivos' },
  { label: 'Asignaciones', href: '/dashboard_admin/asignaciones' },
  { label: 'Estadisticas', href: '/dashboard_admin/estadisticas' },
];
