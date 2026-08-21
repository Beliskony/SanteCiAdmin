// src/pages/Overview.tsx
import { Link } from 'react-router-dom';
import {
  Clock,
  Stethoscope,
  Users,
  Building2,
  CalendarCheck,
  CheckCircle2,
  Wallet,
  RefreshCw,
  AlertTriangle,
} from 'lucide-react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import { useDashboardStats } from '../hooks/useDashboardStats';
import { StatCard } from '../components/ui/StatCard';

const SUBSCRIPTION_LABELS: Record<string, string> = {
  free: 'Gratuit',
  premium: 'Premium',
  elite: 'Élite',
  vip: 'VIP',
};

// Palette dérivée des tokens existants — pas de nouvelle couleur inventée
// pour le chart, juste les nuances déjà en place dans le design system.
const SUBSCRIPTION_COLORS: Record<string, string> = {
  free: 'var(--color-text-muted)',
  premium: 'var(--color-accent)',
  elite: 'var(--color-warning)',
  vip: 'var(--color-accent-hover)',
};

function formatXOF(amount: number): string {
  return new Intl.NumberFormat('fr-CI', {
    style: 'currency',
    currency: 'XOF',
    maximumFractionDigits: 0,
  }).format(amount);
}

function SubscriptionTooltip({ active, payload }: any) {
  if (!active || !payload?.length) return null;
  const entry = payload[0];
  return (
    <div className="rounded-lg border border-border bg-surface px-3 py-2 text-xs shadow-lg">
      <p className="font-medium text-text-primary">{SUBSCRIPTION_LABELS[entry.name] ?? entry.name}</p>
      <p className="text-text-secondary">{entry.value} médecin{entry.value > 1 ? 's' : ''}</p>
    </div>
  );
}

export default function Overview() {
  const { stats, isLoading, error, refetch } = useDashboardStats();

  // ── État de chargement ──────────────────────────────────────────────────

  if (isLoading) {
    return (
      <div className="space-y-8">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-28 animate-pulse rounded-xl border border-border bg-surface" />
          ))}
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-28 animate-pulse rounded-xl border border-border bg-surface" />
          ))}
        </div>
        <div className="h-56 animate-pulse rounded-xl border border-border bg-surface" />
      </div>
    );
  }

  // ── État d'erreur ────────────────────────────────────────────────────────

  if (error || !stats) {
    return (
      <div className="flex flex-col items-center gap-3 rounded-xl border border-danger/20 bg-danger-soft p-8 text-center">
        <AlertTriangle size={22} className="text-danger" />
        <p className="text-sm font-medium text-danger">{error ?? 'Une erreur est survenue.'}</p>
        <button
          onClick={refetch}
          className="mt-1 flex items-center gap-2 rounded-lg border border-danger/30 px-3 py-1.5 text-xs font-semibold text-danger transition hover:bg-danger/10"
        >
          <RefreshCw size={14} />
          Réessayer
        </button>
      </div>
    );
  }

  const hasPendingDoctors = stats.doctors.pending > 0;
  const hasPendingHospitals = stats.hospitals.pendingVerification > 0;
  const totalSubscriptions = stats.subscriptions.reduce((acc, s) => acc + s.count, 0);

  return (
    <div className="space-y-8">
      {/* ── Alertes de modération en attente ── */}
      {(hasPendingDoctors || hasPendingHospitals) && (
        <div className="flex flex-col gap-3 rounded-xl border border-warning/30 bg-warning-soft p-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <Clock size={20} className="shrink-0 text-warning" />
            <p className="text-sm font-medium text-text-primary">
              {hasPendingDoctors && `${stats.doctors.pending} médecin(s) en attente de vérification`}
              {hasPendingDoctors && hasPendingHospitals && ' · '}
              {hasPendingHospitals && `${stats.hospitals.pendingVerification} établissement(s) en attente`}
            </p>
          </div>
          <div className="flex shrink-0 gap-2">
            {hasPendingDoctors && (
              <Link
                to="/dashboard/doctors?status=pending"
                className="rounded-lg bg-warning px-3 py-1.5 text-xs font-semibold text-white transition hover:opacity-90"
              >
                Voir les médecins
              </Link>
            )}
            {hasPendingHospitals && (
              <Link
                to="/dashboard/hospitals?status=pending"
                className="rounded-lg border border-warning/40 px-3 py-1.5 text-xs font-semibold text-text-primary transition hover:bg-surface"
              >
                Voir les établissements
              </Link>
            )}
          </div>
        </div>
      )}

      {/* ── Plateforme ── */}
      <div>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-text-muted">Plateforme</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            label="Médecins"
            value={stats.doctors.total}
            hint={`${stats.doctors.verified} vérifiés`}
            icon={Stethoscope}
          />
          <StatCard
            label="À vérifier"
            value={stats.doctors.pending}
            accent={hasPendingDoctors ? 'warning' : 'default'}
            icon={Clock}
          />
          <StatCard label="Patients" value={stats.patients.total} icon={Users} />
          <StatCard
            label="Établissements"
            value={stats.hospitals.total}
            hint={hasPendingHospitals ? `${stats.hospitals.pendingVerification} en attente` : 'Tous vérifiés'}
            accent={hasPendingHospitals ? 'warning' : 'default'}
            icon={Building2}
          />
        </div>
      </div>

      {/* ── Activité ── */}
      <div>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-text-muted">Activité</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <StatCard label="Rendez-vous actifs" value={stats.appointments.active} accent="success" icon={CalendarCheck} />
          <StatCard label="Rendez-vous complétés" value={stats.appointments.completed} icon={CheckCircle2} />
          <StatCard label="Revenu total" value={formatXOF(stats.revenue.total)} accent="success" icon={Wallet} />
        </div>
      </div>

      {/* ── Répartition des abonnements ── */}
      <div>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-text-muted">Abonnements médecins</h2>
        <div className="rounded-xl border border-border bg-surface p-5">
          {stats.subscriptions.length === 0 ? (
            <p className="text-sm text-text-muted">Aucune donnée pour l'instant.</p>
          ) : (
            <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-center">
              <div className="h-44 w-44 shrink-0">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={stats.subscriptions}
                      dataKey="count"
                      nameKey="_id"
                      innerRadius="65%"
                      outerRadius="100%"
                      paddingAngle={2}
                      stroke="none"
                    >
                      {stats.subscriptions.map((sub) => (
                        <Cell key={sub._id} fill={SUBSCRIPTION_COLORS[sub._id] ?? 'var(--color-text-muted)'} />
                      ))}
                    </Pie>
                    <Tooltip content={<SubscriptionTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div className="w-full flex-1 space-y-3">
                {stats.subscriptions.map((sub) => {
                  const percent = totalSubscriptions > 0 ? Math.round((sub.count / totalSubscriptions) * 100) : 0;
                  return (
                    <div key={sub._id} className="flex items-center justify-between text-sm">
                      <span className="flex items-center gap-2 font-medium text-text-primary">
                        <span
                          className="h-2.5 w-2.5 shrink-0 rounded-full"
                          style={{ backgroundColor: SUBSCRIPTION_COLORS[sub._id] ?? 'var(--color-text-muted)' }}
                        />
                        {SUBSCRIPTION_LABELS[sub._id] ?? sub._id}
                      </span>
                      <span className="text-text-secondary">
                        {sub.count} <span className="text-text-muted">({percent}%)</span>
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}