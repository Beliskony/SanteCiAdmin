// src/components/layout/Header.tsx
import { useLocation } from 'react-router-dom';
import { ThemeToggle } from '../components/ThemeToggle';

const PAGE_TITLES: Record<string, string> = {
  '/dashboard': "Vue d'ensemble",
  '/dashboard/doctors': 'Médecins',
  '/dashboard/hospitals': 'Établissements',
  '/dashboard/patients': 'Patients',
  '/dashboard/reviews': 'Avis',
  '/dashboard/payments': 'Paiements',
  '/dashboard/subscriptions': 'Abonnements',
  '/dashboard/admins': 'Administrateurs',
  '/dashboard/settings': 'Réglages',
  '/dashboard/forbidden': 'Accès refusé',
};

function resolveTitle(pathname: string): string {
  if (PAGE_TITLES[pathname]) return PAGE_TITLES[pathname];

  // Routes avec un ID dynamique (ex: /dashboard/doctors/64f... /verify)
  // retombe sur le titre de la section parente
  const matchedEntry = Object.entries(PAGE_TITLES)
    .filter(([path]) => path !== '/dashboard' && pathname.startsWith(path))
    .sort((a, b) => b[0].length - a[0].length)[0];

  return matchedEntry?.[1] ?? 'Dashboard';
}

export function Header() {
  const location = useLocation();
  const title = resolveTitle(location.pathname);

  return (
    <header className="flex items-center justify-between border-b border-border bg-surface px-8 py-4">
      <h1 className="text-lg font-semibold tracking-tight text-text-primary">{title}</h1>
      <ThemeToggle />
    </header>
  );
}