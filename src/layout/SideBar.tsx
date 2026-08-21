// src/components/layout/Sidebar.tsx
import { NavLink } from 'react-router-dom';
import type { NavLinkRenderProps } from 'react-router-dom';
import {
  LayoutDashboard,
  Stethoscope,
  Building2,
  Users,
  Star,
  CreditCard,
  Gem,
  ShieldCheck,
  Settings,
  LogOut,
  type LucideIcon,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import type { AdminPermission } from '../types/IAdmin';

interface NavItem {
  label: string;
  to: string;
  icon: LucideIcon;
  permission?: AdminPermission;
  superAdminOnly?: boolean;
}

const NAV_ITEMS: NavItem[] = [
  { label: "Vue d'ensemble", to: '/dashboard', icon: LayoutDashboard, permission: 'view:analytics' },
  { label: 'Médecins', to: '/dashboard/doctors', icon: Stethoscope, permission: 'moderate:doctors' },
  { label: 'Hôpitaux', to: '/dashboard/hospitals', icon: Building2, permission: 'moderate:hospitals' },
  { label: 'Patients', to: '/dashboard/patients', icon: Users, permission: 'moderate:patients' },
  { label: 'Avis', to: '/dashboard/reviews', icon: Star, permission: 'moderate:reviews' },
  { label: 'Paiements', to: '/dashboard/payments', icon: CreditCard, permission: 'manage:payments' },
  { label: 'Abonnements', to: '/dashboard/subscriptions', icon: Gem, permission: 'manage:subscriptions' },
  { label: 'Administrateurs', to: '/dashboard/admins', icon: ShieldCheck, superAdminOnly: true },
];

const navLinkClass = ({ isActive }: NavLinkRenderProps) =>
  `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition ${
    isActive ? 'bg-accent/12 text-accent' : 'text-rail-muted hover:bg-white/5 hover:text-rail-text'
  }`;

export function Sidebar() {
  const { admin, hasPermission, logout } = useAuth();

  const visibleItems = NAV_ITEMS.filter((item) => {
    if (item.superAdminOnly) return admin?.role === 'superadmin';
    if (item.permission) return hasPermission(item.permission);
    return true;
  });

  return (
    <aside className="flex h-screen w-64 flex-col bg-rail-bg">
      <div className="flex items-center gap-2.5 px-5 py-6">
        <span className="h-2 w-2 rounded-full bg-accent" />
        <span className="text-base font-semibold tracking-tight text-rail-text">E-SantéCI</span>
        <span className="rounded-full border border-rail-muted px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-rail-muted">
          Admin
        </span>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-2">
        {visibleItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink key={item.to} to={item.to} end={item.to === '/dashboard'} className={navLinkClass}>
              <Icon size={17} strokeWidth={2} />
              {item.label}
            </NavLink>
          );
        })}
      </nav>

      <div className="p-3">
        <div className="mb-2 flex items-center gap-2.5 rounded-lg px-2 py-1.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10 text-xs font-semibold text-rail-text">
            {admin?.profile.fullName?.slice(0, 2).toUpperCase()}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-rail-text">{admin?.profile.fullName}</p>
            <p className="truncate text-xs text-rail-muted">
              {admin?.role === 'superadmin' ? 'Superadmin' : 'Admin'}
            </p>
          </div>
        </div>

        <NavLink to="/dashboard/settings" className={navLinkClass}>
          <Settings size={17} strokeWidth={2} />
          Réglages
        </NavLink>

        <button
          onClick={logout}
          className="mt-1 flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-left text-sm font-medium text-danger transition hover:bg-danger/10"
        >
          <LogOut size={16} />
          Déconnexion
        </button>
      </div>
    </aside>
  );
}