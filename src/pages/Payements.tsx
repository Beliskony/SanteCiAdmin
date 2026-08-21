// src/pages/Payments.tsx
import { useState } from 'react';
import { AlertTriangle, Wallet, Smartphone, CreditCard, ShieldQuestion } from 'lucide-react';
import { usePayments } from '../hooks/usePayments';
import { StatusBadge } from '../components/ui/StatusBadge';
import { Pagination } from '../components/ui/Pagination';
import { PaymentDetailModal } from '../components/modals/PayementDetailModal';
import { PAYMENT_METHOD_LABELS, PROVIDER_LABELS } from '../types/IPayment';
import type { PaymentStatusFilter } from '../types/IPayment';

const TABS: { value: PaymentStatusFilter; label: string }[] = [
  { value: 'all', label: 'Tous' },
  { value: 'paid', label: 'Payés' },
  { value: 'pending', label: 'En attente' },
  { value: 'failed', label: 'Échoués' },
  { value: 'refunded', label: 'Remboursés' },
];

const METHOD_ICONS: Record<string, typeof Wallet> = {
  mobile_money: Smartphone,
  card: CreditCard,
  wallet: Wallet,
  Assurance: ShieldQuestion,
};

// TODO: remplacer par le vrai type exporté par types/IPayment si tu en as un
// pour la ligne de liste (ex. PaymentListItem) — any en attendant.
type PaymentRow = any;

function formatXOF(amount: number, currency: string): string {
  return new Intl.NumberFormat('fr-CI', { style: 'currency', currency, maximumFractionDigits: 0 }).format(amount);
}

function formatDate(dateStr?: string): string {
  if (!dateStr) return '—';
  return new Intl.DateTimeFormat('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' }).format(new Date(dateStr));
}

export default function Payments() {
  const [status, setStatus] = useState<PaymentStatusFilter>('all');
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<PaymentRow | null>(null);

  const { data, isLoading, error } = usePayments({ status, page });

  return (
    <div className="space-y-5">
      <div className="flex gap-1 overflow-x-auto rounded-lg border border-border bg-surface p-1">
        {TABS.map((tab) => (
          <button
            key={tab.value}
            onClick={() => { setStatus(tab.value); setPage(1); }}
            className={`shrink-0 rounded-md px-3.5 py-1.5 text-sm font-medium transition ${
              status === tab.value ? 'bg-accent-soft text-accent' : 'text-text-secondary hover:bg-surface-hover'
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
        ) : !data || data.payments.length === 0 ? (
          <div className="p-10 text-center text-sm text-text-muted">Aucun paiement trouvé.</div>
        ) : (
          <>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-text-muted">
                  <th className="px-4 py-3 font-medium">Patient</th>
                  <th className="px-4 py-3 font-medium">Médecin</th>
                  <th className="px-4 py-3 font-medium">Montant</th>
                  <th className="px-4 py-3 font-medium">Méthode</th>
                  <th className="px-4 py-3 font-medium">Date</th>
                  <th className="px-4 py-3 font-medium">Statut</th>
                </tr>
              </thead>
              <tbody>
                {data.payments.map((p) => {
                  const MethodIcon = METHOD_ICONS[p.payment.method] ?? Wallet;
                  return (
                    <tr
                      key={p._id}
                      onClick={() => setSelected(p)}
                      className="cursor-pointer border-b border-border last:border-0 hover:bg-surface-hover"
                    >
                      <td className="px-4 py-3 text-text-primary">
                        {p.patientId ? `${p.patientId.profile.firstName} ${p.patientId.profile.lastName}` : '—'}
                      </td>
                      <td className="px-4 py-3 text-text-secondary">
                        {p.doctorId ? `Dr. ${p.doctorId.profile.firstName} ${p.doctorId.profile.lastName}` : '—'}
                      </td>
                      <td className="px-4 py-3 font-medium text-text-primary">
                        {formatXOF(p.payment.amount, p.payment.currency)}
                      </td>
                      <td className="px-4 py-3 text-text-secondary">
                        <div className="flex items-center gap-1.5">
                          <MethodIcon size={14} />
                          <span>
                            {p.payment.provider ? PROVIDER_LABELS[p.payment.provider] : PAYMENT_METHOD_LABELS[p.payment.method]}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-text-secondary">{formatDate(p.payment.paidAt ?? p.details.scheduledFor)}</td>
                      <td className="px-4 py-3">
                        <StatusBadge status={p.status.paymentStatus} />
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

      {selected && <PaymentDetailModal payment={selected} onClose={() => setSelected(null)} />}
    </div>
  );
}