// src/components/hospitals/HospitalDetailModal.tsx
import { Building2, ShieldCheck, Ban, RotateCcw } from 'lucide-react';
import { DetailModal, DetailSection, DetailRow } from '../modals/DetailModal';
import { StatusBadge } from '../ui/StatusBadge';
import { HOSPITAL_TYPE_LABELS, type HospitalType } from '../../types/IHopital';

interface HospitalDetailModalProps {
  hospital: {
    _id: string;
    facilityId?: string;
    name: string;
    type: string;
    category?: string;
    location: { city: string; address?: string };
    contact: { email: string; phone?: string };
    status: { accountStatus: string };
    metadata: { verified: boolean; createdAt?: string };
  };
  onAction: (action: 'verify' | 'suspend' | 'block' | 'reactivate') => void;
  onClose: () => void;
}

// Fonction helper pour obtenir le libellé du type en toute sécurité
const getHospitalTypeLabel = (type: string): string => {
  // Vérifier si le type est valide
  if (type in HOSPITAL_TYPE_LABELS) {
    return HOSPITAL_TYPE_LABELS[type as HospitalType];
  }
  // Valeur par défaut si le type n'est pas reconnu
  return type;
};

export function HospitalDetailModal({ hospital, onAction, onClose }: HospitalDetailModalProps) {
  const { status, metadata } = hospital;

  return (
    <DetailModal
      icon={Building2}
      title={hospital.name}
      subtitle={hospital.facilityId}
      onClose={onClose}
      actions={
        <>
          <button
            onClick={onClose}
            className="rounded-lg border border-border px-4 py-2 text-sm font-medium text-text-secondary transition hover:bg-surface-hover"
          >
            Fermer
          </button>
          {!metadata.verified && (
            <button
              onClick={() => onAction('verify')}
              className="flex items-center gap-1.5 rounded-lg bg-accent px-3.5 py-2 text-sm font-semibold text-white transition hover:bg-accent-hover"
            >
              <ShieldCheck size={15} /> Vérifier
            </button>
          )}
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
        <DetailRow label="Vérifié" value={metadata.verified ? 'Oui' : 'Non'} />
        <DetailRow label="Inscrit le" value={metadata.createdAt ? new Date(metadata.createdAt).toLocaleDateString('fr-FR') : undefined} />
      </DetailSection>

      <DetailSection label="Établissement">
        <DetailRow label="Type" value={getHospitalTypeLabel(hospital.type)} />
        {hospital.category && <DetailRow label="Catégorie" value={hospital.category} />}
        <DetailRow label="Ville" value={hospital.location.city} />
        {hospital.location.address && <DetailRow label="Adresse" value={hospital.location.address} />}
      </DetailSection>

      <DetailSection label="Contact">
        <DetailRow label="Email" value={hospital.contact.email} />
        {hospital.contact.phone && <DetailRow label="Téléphone" value={hospital.contact.phone} />}
      </DetailSection>
    </DetailModal>
  );
}