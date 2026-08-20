// src/pages/Reviews.tsx
import { useState } from 'react';
import { Trash2, AlertTriangle, User } from 'lucide-react';
import { useReviews } from '../hooks/useReviews';
import { StarRating } from '../components/ui/StarRating';
import { Pagination } from '../components/ui/Pagination';
import { ConfirmActionModal } from '../components/ui/ConfirmActionModal';
import api from '../lib/api';
import type { ReviewStatusFilter } from '../types/IReview';

const TABS: { value: ReviewStatusFilter; label: string }[] = [
  { value: 'all', label: 'Tous' },
  { value: 'published', label: 'Publiés' },
  { value: 'flagged', label: 'Signalés' },
  { value: 'hidden', label: 'Masqués' },
];

function formatDate(dateStr: string): string {
  return new Intl.DateTimeFormat('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' }).format(new Date(dateStr));
}

export default function Reviews() {
  const [status, setStatus] = useState<ReviewStatusFilter>('all');
  const [page, setPage] = useState(1);
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; label: string } | null>(null);

  const { data, isLoading, error, refetch } = useReviews({ status, page });

  async function handleDelete(id: string, reason?: string) {
    await api.delete(`/admin/reviews/${id}${reason ? `?reason=${encodeURIComponent(reason)}` : ''}`);
    refetch();
  }

  return (
    <div className="space-y-5">
      <div className="flex gap-1 overflow-x-auto rounded-lg border border-border bg-surface p-1">
        {TABS.map((tab) => (
          <button
            key={tab.value}
            onClick={() => { setStatus(tab.value); setPage(1); }}
            className={`shrink-0 rounded-md px-3.5 py-1.5 text-sm font-medium transition ${
              status === tab.value ? 'bg-accent-soft text-accent' : 'text-text-secondary hover:bg-surface-hover'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-24 animate-pulse rounded-xl border border-border bg-surface" />
          ))}
        </div>
      ) : error ? (
        <div className="flex flex-col items-center gap-2 rounded-xl border border-danger/20 bg-danger-soft p-10 text-center">
          <AlertTriangle size={20} className="text-danger" />
          <p className="text-sm text-danger">{error}</p>
        </div>
      ) : !data || data.reviews.length === 0 ? (
        <div className="rounded-xl border border-border bg-surface p-10 text-center text-sm text-text-muted">
          Aucun avis trouvé.
        </div>
      ) : (
        <>
          <div className="space-y-3">
            {data.reviews.map((review) => {
              const doctorName = review.doctorId
                ? `Dr. ${review.doctorId.profile.firstName} ${review.doctorId.profile.lastName}`
                : 'Médecin inconnu';
              const patientName = review.isAnonymous
                ? 'Anonyme'
                : review.patientId
                  ? `${review.patientId.profile.firstName} ${review.patientId.profile.lastName}`
                  : 'Patient inconnu';

              return (
                <div key={review._id} className="rounded-xl border border-border bg-surface p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <StarRating rating={review.rating} />
                        <span className="text-xs text-text-muted">{formatDate(review.metadata.createdAt)}</span>
                        {review.status !== 'published' && (
                          <span className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${
                            review.status === 'flagged' ? 'bg-warning-soft text-warning' : 'bg-danger-soft text-danger'
                          }`}>
                            {review.status === 'flagged' ? 'Signalé' : 'Masqué'}
                          </span>
                        )}
                      </div>

                      {review.comment && (
                        <p className="mt-2 text-sm text-text-primary">{review.comment}</p>
                      )}

                      <div className="mt-2.5 flex items-center gap-3 text-xs text-text-muted">
                        <span className="flex items-center gap-1">
                          <User size={12} /> {patientName}
                        </span>
                        <span>→ {doctorName}</span>
                      </div>
                    </div>

                    <button
                      onClick={() => setDeleteTarget({ id: review._id, label: `l'avis de ${patientName} pour ${doctorName}` })}
                      title="Supprimer"
                      className="shrink-0 rounded-lg p-1.5 text-text-muted transition hover:bg-danger-soft hover:text-danger"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="rounded-xl border border-border bg-surface">
            <Pagination page={data.page} pages={data.pages} total={data.total} onPageChange={setPage} />
          </div>
        </>
      )}

      {deleteTarget && (
        <ConfirmActionModal
          title="Supprimer cet avis"
          description={`Vous êtes sur le point de supprimer ${deleteTarget.label}. Cette action est irréversible et recalcule la note du médecin.`}
          confirmLabel="Supprimer"
          requireReason
          danger
          onConfirm={(reason) => handleDelete(deleteTarget.id, reason)}
          onClose={() => setDeleteTarget(null)}
        />
      )}
    </div>
  );
}