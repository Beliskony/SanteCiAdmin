// src/types/Patient.ts
export interface PatientListItem {
  _id: string;
  patientId: string;
  profile: { firstName: string; lastName: string };
  contact: { phone: string; email?: string };
  location: { city: string };
  status: { accountStatus: 'active' | 'suspended' | 'blocked' };
  metadata: { createdAt: string; totalConsultations: number };
}

export type PatientStatusFilter = 'all' | 'active' | 'suspended' | 'blocked';