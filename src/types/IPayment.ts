// src/types/Payment.ts
export interface PaymentListItem {
  _id: string;
  patientId: { _id: string; profile: { firstName: string; lastName: string } } | null;
  doctorId: { _id: string; profile: { firstName: string; lastName: string } } | null;
  payment: {
    amount: number;
    currency: 'XOF' | 'EUR' | 'USD';
    method: 'mobile_money' | 'card' | 'wallet' | 'Assurance';
    provider?: 'orange_money' | 'mtn_money' | 'wave';
    transactionId?: string;
    paidAt?: string;
  };
  status: { paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded' };
  details: { scheduledFor: string };
}

export type PaymentStatusFilter = 'all' | 'pending' | 'paid' | 'failed' | 'refunded';

export const PAYMENT_METHOD_LABELS: Record<string, string> = {
  mobile_money: 'Mobile Money',
  card: 'Carte',
  wallet: 'Wallet',
  Assurance: 'Assurance',
};

export const PROVIDER_LABELS: Record<string, string> = {
  orange_money: 'Orange Money',
  mtn_money: 'MTN Money',
  wave: 'Wave',
};