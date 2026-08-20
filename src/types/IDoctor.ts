// src/types/Doctor.ts
export interface DoctorListItem {
  _id: string;
  doctorId: string;
  profile: {
    firstName: string;
    lastName: string;
    specialty?: string;
    photo?: string;
  };
  contact: {
    email: string;
    phone: string;
  };
  location: {
    city: string;
    district?: string;
  };
  status: {
    accountStatus: 'active' | 'pending' | 'suspended' | 'blocked';
    isVerified: boolean;
  };
  telemedicine?: {
    rating?: number;
  };
  metadata: {
    createdAt: string;
  };
}

export type DoctorStatusFilter = 'all' | 'active' | 'pending' | 'suspended' | 'blocked';