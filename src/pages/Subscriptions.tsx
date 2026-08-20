// src/pages/Subscriptions.tsx
import { useState } from 'react';
import { AlertTriangle, Gem, Clock } from 'lucide-react';
import { useSubscriptions } from '../hooks/useSubscriptions';
import { Pagination } from '../components/ui/Pagination';
import { PLAN_LABELS } from '../types/ISubscription';
import type { SubscriptionPlanFilter } from '../types/ISubscription';

const TABS: { value: SubscriptionPlanFilter; label: string }[] = [
  { value: 'all', label: 'Tous' },
  { value: 'elite', label: 'Élite' },
  { value: 'premium', label: 'Premium' },
  { value: 'free', label: 'Gratuit' },
];

const PLAN_STYLES: Record<string, string> = {
  free: 'bg-surface-hover text-text-secondary',
  premium: 'bg-accent-soft text-accent',
  elite: 'bg-warning-soft text-warning',
};

function formatDate(dateStr?: string): string {
  if (!dateStr) return '—';
  return new Intl.DateTimeFormat('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' }).format(new Date(dateStr));
}

function isExpiringSoon(dateStr?: string): boolean {
  if (!dateStr) return false;
  const daysLeft = (new Date(dateStr).getTime() - Date.now()) / 86_400_000;
  return daysLeft >= 0 && daysLeft <= 3;
}

export default function Subscriptions() {
  const [plan, setPlan] = useState<SubscriptionPlanFilter>('all');
  const [page, setPage] = useState(1);

  const { data, isLoading, error } = useSubscriptions({ plan, page });

  return (
    <div className="space-y-5">
      <div className="flex gap-1 overflow-x-auto rounded-lg border border-border bg-surface p-1">
        {TABS.map((tab) => (
          <button
            key={tab.value}
            onClick={() => { setPlan(tab.value); setPage(1); }}
            className={`shrink-0 rounded-md px-3.5 py-1.5 text-sm font-medium transition ${
              plan === tab.value ? 'bg-accent-soft text-accent' : 'text-text-secondary hover:bg-surface-hover'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="overflow-hidden rounded-xl border border-border bg-surface">
        {isLoading ? (
          <div className="space-y-3 p-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-12 animate-pulse rounded-lg bg-surface-hover" />
            ))}
          </div>
        ) : error ? (
          <div className="flex flex-col items-center gap-2 p-10 text-center">
            <AlertTriangle size={20} className="text-danger" />
            <p className="text-sm text-danger">{error}</p>
          </div>
        ) : !data || data.doctors.length === 0 ? (
          <div className="p-10 text-center text-sm text-text-muted">Aucun médecin trouvé.</div>
        ) : (
          <>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-text-muted">
                  <th className="px-4 py-3 font-medium">Médecin</th>
                  <th className="px-4 py-3 font-medium">Plan</th>
                  <th className="px-4 py-3 font-medium">Statut paiement</th>
                  <th className="px-4 py-3 font-medium">Expire le</th>
                </tr>
              </thead>
              <tbody>
                {data.doctors.map((d) => {
                  const expiring = isExpiringSoon(d.status.subscriptionExpiry);
                  return (
                    <tr key={d._id} className="border-b border-border last:border-0 hover:bg-surface-hover">
                      <td className="px-4 py-3">
                        <p className="font-medium text-text-primary">Dr. {d.profile.firstName} {d.profile.lastName}</p>
                        <p className="text-xs text-text-muted">{d.contact.email}</p>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium ${PLAN_STYLES[d.status.subscription]}`}>
                          {d.status.subscription !== 'free' && <Gem size={11} />}
                          {PLAN_LABELS[d.status.subscription]}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-text-secondary capitalize">
                        {d.status.subscriptionStatus ?? '—'}
                      </td>
                      <td className="px-4 py-3">
                        {d.status.subscription === 'free' ? (
                          <span className="text-text-muted">—</span>
                        ) : (
                          <span className={`flex items-center gap-1.5 ${expiring ? 'font-medium text-warning' : 'text-text-secondary'}`}>
                            {expiring && <Clock size={13} />}
                            {formatDate(d.status.subscriptionExpiry)}
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            <Pagination page={data.page} pages={data.pages} total={data.total} onPageChange={setPage} />
          </>
        )}
      </div>
    </div>
  );
}