export type AdminPermission =
  | 'moderate:doctors'
  | 'moderate:patients'
  | 'moderate:hospitals'
  | 'moderate:reviews'
  | 'manage:subscriptions'
  | 'manage:payments'
  | 'manage:disputes'
  | 'manage:notifications'
  | 'view:analytics';

export type AdminRole = 'admin' | 'superadmin';

export type AdminAccountStatus = 'active' | 'suspended' | 'blocked';

export type AdminActionType =
  | 'verify_doctor' | 'suspend_doctor' | 'block_doctor' | 'reactivate_doctor'
  | 'verify_hospital' | 'suspend_hospital' | 'reactivate_hospital'
  | 'suspend_patient' | 'block_patient' | 'reactivate_patient'
  | 'delete_review'
  | 'refund_payment'
  | 'create_admin' | 'update_admin_permissions' | 'suspend_admin' | 'delete_admin'
  | 'other';

export interface AdminActionLog {
  action: AdminActionType;
  targetId: string;
  targetType: 'doctor' | 'patient' | 'hospital' | 'review' | 'payment' | 'admin';
  reason?: string;
  performedAt: string; // ISO date string côté client
}

export interface AdminUser {
  _id: string;
  adminId: string;

  profile: {
    fullName: string;
    photo?: string;
  };

  contact: {
    email: string;
    emailVerified: boolean;
    phone: string;
    phoneVerified: boolean;
  };

  role: AdminRole;
  permissions: AdminPermission[];

  status: {
    accountStatus: AdminAccountStatus;
    isOnline: boolean;
    lastActive: string;
    lastLoginAt?: string;
  };

  recentActions?: AdminActionLog[];

  metadata: {
    createdAt: string;
    updatedAt: string;
    createdBy: string | null;
  };
}