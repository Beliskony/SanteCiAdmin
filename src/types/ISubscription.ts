// src/types/Subscription.ts
export interface SubscriptionListItem {
  _id: string;
  doctorId: string;
  profile: { firstName: string; lastName: string };
  contact: { email: string };
  status: {
    subscription: 'free' | 'premium' | 'elite';
    subscriptionStatus?: 'active' | 'pending' | 'failed' | 'expired';
    subscriptionExpiry?: string;
  };
}

export type SubscriptionPlanFilter = 'all' | 'free' | 'premium' | 'elite';

export const PLAN_LABELS: Record<string, string> = {
  free: 'Gratuit',
  premium: 'Premium',
  elite: 'Élite',
};