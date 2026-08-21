// src/components/patients/PatientDetailModal.tsx
import { Users, Ban, RotateCcw } from 'lucide-react';
import { DetailModal, DetailSection, DetailRow } from '../modals/DetailModal';
import { StatusBadge } from '../ui/StatusBadge';

interface PatientDetailModalProps {
  patient: {
    _id: string;
    patientId?: string;
    profile: { firstName: string; lastName: string };
    contact: { phone: string; email?: string };
    location: { city: string };
    status: { accountStatus: string };
    metadata: { createdAt?: string; totalConsultations: number };
  };
  onAction: (action: 'suspend' | 'block' | 'reactivate') => void;
  onClose: () => void;
}

export function PatientDetailModal({ patient, onAction, onClose }: PatientDetailModalProps) {
  const fullName = `${patient.profile.firstName} ${patient.profile.lastName}`;
  const { status, metadata } = patient;

  return (
    <DetailModal
      icon={Users}
      title={fullName}
      subtitle={patient.patientId}
      onClose={onClose}
      actions={
        <>
          <button
            onClick={onClose}
            className="rounded-lg border border-border px-4 py-2 text-sm font-medium text-text-secondary transition hover:bg-surface-hover"
          >
            Fermer
          </button>
          {status.accountStatus !== 'suspended' && (
            <button
              onClick={() => onAction('suspend')}
              className="flex items-center gap-1.5 rounded-lg border border-warning/30 px-3.5 py-2 text-sm font-semibold text-warning transition hover:bg-warning-soft"
            >
              <Ban size={15} /> Suspendre
            </button>
          )}
          {status.accountStatus !== 'blocked' && (
            <button
              onClick={() => onAction('block')}
              className="flex items-center gap-1.5 rounded-lg bg-danger px-3.5 py-2 text-sm font-semibold text-white transition hover:opacity-90"
            >
              <Ban size={15} /> Bloquer
            </button>
          )}
          {status.accountStatus !== 'active' && (
            <button
              onClick={() => onAction('reactivate')}
              className="flex items-center gap-1.5 rounded-lg border border-success/30 px-3.5 py-2 text-sm font-semibold text-success transition hover:bg-success-soft"
            >
              <RotateCcw size={15} /> Réactiver
            </button>
          )}
        </>
      }
    >
      <DetailSection label="Statut">
        <DetailRow label="Compte" value={<StatusBadge status={status.accountStatus} />} />
        <DetailRow label="Consultations" value={metadata.totalConsultations} />
        <DetailRow label="Inscrit le" value={metadata.createdAt ? new Date(metadata.createdAt).toLocaleDateString('fr-FR') : undefined} />
      </DetailSection>

      <DetailSection label="Contact">
        <DetailRow label="Téléphone" value={patient.contact.phone} />
        {patient.contact.email && <DetailRow label="Email" value={patient.contact.email} />}
        <DetailRow label="Ville" value={patient.location.city} />
      </DetailSection>
    </DetailModal>
  );
}