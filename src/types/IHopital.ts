export type HospitalType = 'hospital' | 'clinic' | 'pharmacy' | 'laboratory' | 'imaging_center';

export interface HospitalListItem {
  _id: string;
  facilityId: string;
  name: string;
  type: HospitalType;
  category: 'public' | 'private' | 'community';
  location: { address: string; city: string; district: string };
  contact: { phoneNumbers: string[]; email: string };
  status: { accountStatus: 'active' | 'suspended' | 'blocked' };
  metadata: { verified: boolean; createdAt: string };
}

export type HospitalStatusFilter = 'all' | 'active' | 'suspended' | 'blocked';

export const HOSPITAL_TYPE_LABELS: Record<HospitalType, string> = {
  hospital: 'Hôpital',
  clinic: 'Clinique',
  pharmacy: 'Pharmacie',
  laboratory: 'Laboratoire',
  imaging_center: "Centre d'imagerie",
};