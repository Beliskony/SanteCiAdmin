// src/components/modals/HospitalDetailModal.tsx
import { useEffect, useState } from 'react';
import { Building2, ShieldCheck, Ban, RotateCcw } from 'lucide-react';
import { DetailModal, DetailSection, DetailRow } from '../modals/DetailModal';
import { StatusBadge } from '../ui/StatusBadge';
import api, { ApiError } from '../../lib/api';
import { HOSPITAL_TYPE_LABELS } from '../../types/IHopital';
import type { HospitalVerificationDetails } from '../../types/IAdminPanel';


interface HospitalDetailModalProps {
  hospital: {
    _id: string;
    facilityId?: string;
    name: string;
    type: string;
    category?: string;
    location: { city: string; address?: string };
    contact: { email: string; phone?: string };
    status?: { accountStatus: string };
    metadata?: { verified: boolean; createdAt?: string };
  };
  onAction: (action: 'verify' | 'suspend' | 'block' | 'reactivate') => void;
  onClose: () => void;
}

export function HospitalDetailModal({ hospital, onAction, onClose }: HospitalDetailModalProps) {
  // Défensif : certains documents plus anciens en base peuvent ne pas avoir
  // de sous-objet `status`/`metadata` (champ ajouté après coup au schéma).
  const accountStatus = hospital.status?.accountStatus ?? 'active';
  const isVerified = hospital.metadata?.verified ?? false;
  const createdAt = hospital.metadata?.createdAt;

  const [details, setDetails] = useState<HospitalVerificationDetails | null>(null);
  const [isLoadingDetails, setIsLoadingDetails] = useState(true);
  const [detailsError, setDetailsError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setIsLoadingDetails(true);
    setDetailsError(null);

    api.get<{ data: HospitalVerificationDetails }>(`/admin/hospitals/${hospital._id}/verification-details`)
      .then((res) => {
        if (!cancelled) setDetails(res.data);
      })
      .catch((err) => {
        if (!cancelled) setDetailsError(err instanceof ApiError ? err.message : 'Impossible de charger la certification.');
      })
      .finally(() => {
        if (!cancelled) setIsLoadingDetails(false);
      });

    return () => { cancelled = true; };
  }, [hospital._id]);

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
          {!isVerified && (
            <button
              onClick={() => onAction('verify')}
              className="flex items-center gap-1.5 rounded-lg bg-accent px-3.5 py-2 text-sm font-semibold text-white transition hover:bg-accent-hover"
            >
              <ShieldCheck size={15} /> Vérifier
            </button>
          )}
          {accountStatus !== 'suspended' && (
            <button
              onClick={() => onAction('suspend')}
              className="flex items-center gap-1.5 rounded-lg border border-warning/30 px-3.5 py-2 text-sm font-semibold text-warning transition hover:bg-warning-soft"
            >
              <Ban size={15} /> Suspendre
            </button>
          )}
          {accountStatus !== 'blocked' && (
            <button
              onClick={() => onAction('block')}
              className="flex items-center gap-1.5 rounded-lg bg-danger px-3.5 py-2 text-sm font-semibold text-white transition hover:opacity-90"
            >
              <Ban size={15} /> Bloquer
            </button>
          )}
          {accountStatus !== 'active' && (
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
        <DetailRow label="Compte" value={<StatusBadge status={accountStatus} />} />
        <DetailRow label="Vérifié" value={isVerified ? 'Oui' : 'Non'} />
        <DetailRow label="Inscrit le" value={createdAt ? new Date(createdAt).toLocaleDateString('fr-FR') : undefined} />
      </DetailSection>

      <DetailSection label="Établissement">
        <DetailRow
          label="Type"
          value={HOSPITAL_TYPE_LABELS[hospital.type as keyof typeof HOSPITAL_TYPE_LABELS] ?? hospital.type}
        />
        {hospital.category && <DetailRow label="Catégorie" value={hospital.category} />}
        <DetailRow label="Ville" value={hospital.location.city} />
        {hospital.location.address && <DetailRow label="Adresse" value={hospital.location.address} />}
      </DetailSection>

      <DetailSection label="Contact">
        <DetailRow label="Email" value={hospital.contact.email} />
        {hospital.contact.phone && <DetailRow label="Téléphone" value={hospital.contact.phone} />}
      </DetailSection>

      {/* ── Certification / licence d'exploitation ── */}
      <div>
        <p className="mb-2 text-xs font-medium uppercase tracking-wide text-text-muted">
          Certification
        </p>

        {isLoadingDetails ? (
          <div className="space-y-2">
            <div className="h-4 w-2/3 animate-pulse rounded bg-surface-hover" />
            <div className="h-4 w-1/2 animate-pulse rounded bg-surface-hover" />
          </div>
        ) : detailsError ? (
          <p className="rounded-lg border border-danger/20 bg-danger-soft px-3 py-2 text-sm text-danger">
            {detailsError}
          </p>
        ) : details ? (
          <div className="space-y-2 rounded-lg border border-border p-3">
            <DetailRow label="N° de licence" value={details.certification.licenseNumber} />
            <DetailRow
              label="Expire le"
              value={new Date(details.certification.expiryDate).toLocaleDateString('fr-FR')}
            />
            <DetailRow
              label="Accréditations"
              value={details.certification.accreditation.length > 0 ? details.certification.accreditation.join(', ') : 'Aucune'}
            />
          </div>
        ) : null}
      </div>
    </DetailModal>
  );
}