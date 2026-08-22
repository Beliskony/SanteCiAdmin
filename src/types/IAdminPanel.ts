// Types modélisant la forme RÉELLE renvoyée par les endpoints admin (après
// .select()/.lean()/.populate() dans Admin.Service.ts) — pas les documents
// Mongoose complets. Le backend valide déjà via Zod ; ceci sert uniquement
// au typage côté front.

// ── Hôpitaux ── (listHospitals)

export interface HospitalListItem {
  _id: string;
  facilityId: string;
  name: string;
  type: string;
  category: string;
  location: {
    address: string;
    city: string;
    district: string;
    commune?: string;
  };
  contact: {
    phoneNumbers: string[];
    email: string;
  };
  status: {
    accountStatus: 'active' | 'suspended' | 'blocked';
  };
  metadata: {
    verified: boolean;
    createdAt: string;
  };
}

// ── Patients ── (listPatients)

export interface PatientListItem {
  _id: string;
  patientId: string;
  profile: {
    firstName: string;
    lastName: string;
  };
  contact: {
    phone: string;
    email?: string;
  };
  location: {
    city: string;
  };
  status: {
    accountStatus: 'active' | 'suspended' | 'blocked';
  };
  metadata: {
    createdAt: string;
    totalConsultations: number;
  };
}

// ── Médecins ── (listDoctors)

export interface DoctorListItem {
  _id: string;
  doctorId: string;
  profile: {
    firstName: string;
    lastName: string;
  };
  contact: {
    email: string;
    phone?: string;
  };
  location: {
    city: string;
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

// ── Paiements ── (listPayments)

interface PopulatedPerson {
  _id: string;
  profile: {
    firstName: string;
    lastName: string;
  };
}

export interface PaymentListItem {
  _id: string;
  patientId?: PopulatedPerson | null;
  doctorId?: PopulatedPerson | null;
  payment: {
    amount: number;
    currency: 'XOF' | 'EUR' | 'USD';
    method: 'mobile_money' | 'card' | 'wallet' | 'Assurance';
    provider?: 'orange_money' | 'mtn_money' | 'wave';
    paidAt?: string;
  };
  status: {
    paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded';
  };
  details: {
    scheduledFor?: string;
  };
}

// ── Admins ── (listAdmins)

export interface AdminListItem {
  _id: string;
  adminId: string;
  profile: { fullName: string };
  contact: { email: string };
  role: 'admin' | 'superadmin';
  permissions: string[];
  status: {
    accountStatus: 'active' | 'suspended' | 'blocked';
    isOnline: boolean;
    lastActive: string;
  };
}

// ── Détails de vérification médecin ── (GET /admin/doctors/:id/verification-details)

export interface DoctorVerificationDetails {
  _id: string;
  doctorId: string;
  profile: {
    firstName: string;
    lastName: string;
  };
  professional: {
    licenseNumber: string;
    licenseExpiry?: string | null;
    university: string;
    graduationYear: number;
    certifications: {
      name: string;
      year: number;
      issuer: string;
      documentUrl: string;
    }[];
    verificationDocuments: {
      type: 'diploma' | 'license_certificate' | 'practice_attestation' | 'other';
      url: string;
      fileName?: string;
      uploadedAt?: string;
    }[];
    currentPractice?: {
      name: string;
      type: 'hospital' | 'clinic' | 'private' | 'other';
    };
  };
  status: {
    isVerified: boolean;
    accountStatus: 'active' | 'pending' | 'suspended' | 'blocked';
  };
}

// ── Détails de vérification hôpital ── (GET /admin/hospitals/:id/verification-details)

export interface HospitalVerificationDetails {
  _id: string;
  facilityId: string;
  name: string;
  certification: {
    licenseNumber: string;
    accreditation: string[];
    expiryDate: string;
  };
  metadata: { verified: boolean };
}