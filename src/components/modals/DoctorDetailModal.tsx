// src/components/modals/DoctorDetailModal.tsx
import { useEffect, useState } from 'react';
import { Stethoscope, ShieldCheck, Ban, RotateCcw, Star, FileText, ExternalLink } from 'lucide-react';
import { DetailModal, DetailSection, DetailRow } from '../modals/DetailModal';
import { StatusBadge } from '../ui/StatusBadge';
import api, { ApiError } from '../../lib/api';
import type { DoctorVerificationDetails } from '../../types/IAdminPanel';

const DOCUMENT_TYPE_LABELS: Record<string, string> = {
  diploma: 'Diplôme',
  license_certificate: "Certificat d'exercice",
  practice_attestation: "Attestation d'exercice",
  other: 'Autre document',
};

interface DoctorDetailModalProps {
  doctor: {
    _id: string;
    doctorId?: string;
    profile: { firstName: string; lastName: string };
    contact: { email: string; phone?: string };
    location: { city: string };
    status: { accountStatus: string; isVerified?: boolean };
    telemedicine?: { rating?: number };
    metadata: { createdAt?: string };
  };
  onAction: (action: 'verify' | 'suspend' | 'block' | 'reactivate') => void;
  onClose: () => void;
}

export function DoctorDetailModal({ doctor, onAction, onClose }: DoctorDetailModalProps) {
  const fullName = `Dr. ${doctor.profile.firstName} ${doctor.profile.lastName}`;
  const { status, metadata, telemedicine } = doctor;

  const [details, setDetails] = useState<DoctorVerificationDetails | null>(null);
  const [isLoadingDetails, setIsLoadingDetails] = useState(true);
  const [detailsError, setDetailsError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setIsLoadingDetails(true);
    setDetailsError(null);

    api.get<{ data: DoctorVerificationDetails }>(`/admin/doctors/${doctor._id}/verification-details`)
      .then((res) => {
        if (!cancelled) setDetails(res.data);
      })
      .catch((err) => {
        if (!cancelled) setDetailsError(err instanceof ApiError ? err.message : 'Impossible de charger le dossier.');
      })
      .finally(() => {
        if (!cancelled) setIsLoadingDetails(false);
      });

    return () => { cancelled = true; };
  }, [doctor._id]);

  return (
    <DetailModal
      icon={Stethoscope}
      title={fullName}
      subtitle={doctor.doctorId}
      onClose={onClose}
      actions={
        <>
          <button
            onClick={onClose}
            className="rounded-lg border border-border px-4 py-2 text-sm font-medium text-text-secondary transition hover:bg-surface-hover"
          >
            Fermer
          </button>
          {!status.isVerified && (
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
        <DetailRow label="Vérifié" value={status.isVerified ? 'Oui' : 'Non'} />
        <DetailRow label="Inscrit le" value={metadata.createdAt ? new Date(metadata.createdAt).toLocaleDateString('fr-FR') : undefined} />
      </DetailSection>

      {typeof telemedicine?.rating === 'number' && (
        <DetailSection label="Réputation">
          <DetailRow
            label="Note moyenne"
            value={
              <span className="flex items-center gap-1">
                <Star size={13} className="fill-warning text-warning" />
                {telemedicine.rating.toFixed(1)}
              </span>
            }
          />
        </DetailSection>
      )}

      <DetailSection label="Contact">
        <DetailRow label="Email" value={doctor.contact.email} />
        {doctor.contact.phone && <DetailRow label="Téléphone" value={doctor.contact.phone} />}
        <DetailRow label="Ville" value={doctor.location.city} />
      </DetailSection>

      {/* ── Dossier de vérification : diplôme, licence, documents fournis ── */}
      <div>
        <p className="mb-2 text-xs font-medium uppercase tracking-wide text-text-muted">
          Dossier de vérification
        </p>

        {isLoadingDetails ? (
          <div className="space-y-2">
            <div className="h-4 w-2/3 animate-pulse rounded bg-surface-hover" />
            <div className="h-4 w-1/2 animate-pulse rounded bg-surface-hover" />
            <div className="h-16 animate-pulse rounded-lg bg-surface-hover" />
          </div>
        ) : detailsError ? (
          <p className="rounded-lg border border-danger/20 bg-danger-soft px-3 py-2 text-sm text-danger">
            {detailsError}
          </p>
        ) : details ? (
          <div className="space-y-3">
            <div className="space-y-2 rounded-lg border border-border p-3">
              <DetailRow label="N° de licence" value={details.professional.licenseNumber} />
              <DetailRow label="Université" value={details.professional.university} />
              <DetailRow label="Année de diplôme" value={details.professional.graduationYear} />
              {details.professional.currentPractice?.name && (
                <DetailRow label="Exerce à" value={details.professional.currentPractice.name} />
              )}
            </div>

            {details.professional.verificationDocuments.length === 0 ? (
              <p className="text-sm text-text-muted">
                Aucun document de vérification fourni pour l'instant.
              </p>
            ) : (
              <div className="space-y-1.5">
                {details.professional.verificationDocuments.map((doc, i) => (
                  <a
                    key={i}
                    href={doc.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between gap-2 rounded-lg border border-border px-3 py-2 text-sm transition hover:bg-surface-hover"
                  >
                    <span className="flex min-w-0 items-center gap-2 text-text-primary">
                      <FileText size={15} className="shrink-0 text-text-muted" />
                      <span className="truncate">
                        {DOCUMENT_TYPE_LABELS[doc.type] ?? doc.type}
                        {doc.fileName ? ` — ${doc.fileName}` : ''}
                      </span>
                    </span>
                    <ExternalLink size={14} className="shrink-0 text-text-muted" />
                  </a>
                ))}
              </div>
            )}

            {details.professional.certifications.length > 0 && (
              <div className="space-y-1.5">
                {details.professional.certifications.map((cert, i) => (
                  <a
                    key={i}
                    href={cert.documentUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between gap-2 rounded-lg border border-border px-3 py-2 text-sm transition hover:bg-surface-hover"
                  >
                    <span className="flex min-w-0 items-center gap-2 text-text-primary">
                      <FileText size={15} className="shrink-0 text-text-muted" />
                      <span className="truncate">{cert.name} — {cert.issuer} ({cert.year})</span>
                    </span>
                    <ExternalLink size={14} className="shrink-0 text-text-muted" />
                  </a>
                ))}
              </div>
            )}
          </div>
        ) : null}
      </div>
    </DetailModal>
  );
}