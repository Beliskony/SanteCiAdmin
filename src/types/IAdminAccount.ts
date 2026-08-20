import type { AdminPermission, AdminRole } from './IAdmin';

export interface AdminAccountListItem {
  _id: string;
  adminId: string;
  role: AdminRole;
  permissions: AdminPermission[];
  profile: { fullName: string; photo?: string };
  contact: { email: string; phone: string };
  status: { accountStatus: 'active' | 'suspended' | 'blocked'; isOnline: boolean; lastActive: string };
  metadata: { createdAt: string };
}

export const ALL_PERMISSIONS: { value: AdminPermission; label: string }[] = [
  { value: 'moderate:doctors', label: 'Modérer les médecins' },
  { value: 'moderate:patients', label: 'Modérer les patients' },
  { value: 'moderate:hospitals', label: 'Modérer les établissements' },
  { value: 'moderate:reviews', label: 'Modérer les avis' },
  { value: 'manage:subscriptions', label: 'Gérer les abonnements' },
  { value: 'manage:payments', label: 'Gérer les paiements' },
  { value: 'manage:disputes', label: 'Gérer les litiges' },
  { value: 'manage:notifications', label: 'Gérer les notifications' },
  { value: 'view:analytics', label: 'Voir les statistiques' },
];