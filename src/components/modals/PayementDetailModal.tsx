// src/components/payments/PaymentDetailModal.tsx
import { Receipt, Smartphone, CreditCard, Wallet, ShieldQuestion } from 'lucide-react';
import { DetailModal, DetailSection, DetailRow } from '../modals/DetailModal';
import { StatusBadge } from '../ui/StatusBadge';
import { PAYMENT_METHOD_LABELS, PROVIDER_LABELS } from '../../types/IPayment';

const METHOD_ICONS: Record<string, typeof Wallet> = {
  mobile_money: Smartphone,
  card: CreditCard,
  wallet: Wallet,
  Assurance: ShieldQuestion,
};

function formatXOF(amount: number, currency: string): string {
  return new Intl.NumberFormat('fr-CI', { style: 'currency', currency, maximumFractionDigits: 0 }).format(amount);
}

function formatDate(dateStr?: string): string {
  if (!dateStr) return '—';
  return new Intl.DateTimeFormat('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' }).format(new Date(dateStr));
}

interface PaymentDetailModalProps {
  payment: {
    _id: string;
    patientId?: { profile: { firstName: string; lastName: string } };
    doctorId?: { profile: { firstName: string; lastName: string } };
    payment: { amount: number; currency: string; method: string; provider?: string; paidAt?: string };
    status: { paymentStatus: string };
    details: { scheduledFor?: string };
  };
  onClose: () => void;
}

export function PaymentDetailModal({ payment, onClose }: PaymentDetailModalProps) {
  const MethodIcon = METHOD_ICONS[payment.payment.method] ?? Wallet;

  return (
    <DetailModal
      icon={Receipt}
      title={formatXOF(payment.payment.amount, payment.payment.currency)}
      subtitle={payment._id}
      onClose={onClose}
      actions={
        <button
          onClick={onClose}
          className="rounded-lg border border-border px-4 py-2 text-sm font-medium text-text-secondary transition hover:bg-surface-hover"
        >
          Fermer
        </button>
      }
    >
      <DetailSection label="Statut">
        <DetailRow label="Paiement" value={<StatusBadge status={payment.status.paymentStatus} />} />
        <DetailRow
          label="Méthode"
          value={
            <span className="flex items-center gap-1.5">
              <MethodIcon size={14} />
              {payment.payment.provider ? PROVIDER_LABELS[payment.payment.provider] : PAYMENT_METHOD_LABELS[payment.payment.method]}
            </span>
          }
        />
        <DetailRow label="Payé le" value={formatDate(payment.payment.paidAt)} />
        <DetailRow label="Rendez-vous prévu" value={formatDate(payment.details.scheduledFor)} />
      </DetailSection>

      <DetailSection label="Parties">
        <DetailRow
          label="Patient"
          value={payment.patientId ? `${payment.patientId.profile.firstName} ${payment.patientId.profile.lastName}` : undefined}
        />
        <DetailRow
          label="Médecin"
          value={payment.doctorId ? `Dr. ${payment.doctorId.profile.firstName} ${payment.doctorId.profile.lastName}` : undefined}
        />
      </DetailSection>

      {payment.status.paymentStatus === 'paid' && (
        <p className="text-xs text-text-muted">
          Le remboursement n'est pas encore disponible côté backend pour cette transaction.
        </p>
      )}
    </DetailModal>
  );
}