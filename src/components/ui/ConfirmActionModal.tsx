import { useState } from 'react';
import { X, Loader2, TriangleAlert } from 'lucide-react';

interface ConfirmActionModalProps {
  title: string;
  description: string;
  confirmLabel: string;
  requireReason?: boolean;
  danger?: boolean;
  onConfirm: (reason?: string) => Promise<void>;
  onClose: () => void;
}

export function ConfirmActionModal({
  title,
  description,
  confirmLabel,
  requireReason,
  danger,
  onConfirm,
  onClose,
}: ConfirmActionModalProps) {
  const [reason, setReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const reasonTooShort = requireReason && reason.trim().length < 5;

  async function handleConfirm() {
    if (reasonTooShort) return;
    setError(null);
    setIsSubmitting(true);
    try {
      await onConfirm(requireReason ? reason.trim() : undefined);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue.');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-bg/60 px-4 backdrop-blur-sm">
      <div className="w-full max-w-sm rounded-2xl border border-border bg-surface p-6 shadow-lg motion-safe:animate-[modal-in_0.15s_ease-out]">
        <div className="mb-4 flex items-start justify-between">
          <div
            className={`flex h-10 w-10 items-center justify-center rounded-xl ${
              danger ? 'bg-danger-soft text-danger' : 'bg-accent-soft text-accent'
            }`}
          >
            <TriangleAlert size={18} />
          </div>
          <button
            onClick={onClose}
            aria-label="Fermer"
            className="text-text-muted transition hover:text-text-secondary"
          >
            <X size={18} />
          </button>
        </div>

        <h2 className="text-base font-semibold text-text-primary">{title}</h2>
        <p className="mt-1.5 text-sm text-text-secondary">{description}</p>

        {requireReason && (
          <div className="mt-4">
            <label className="mb-1.5 block text-sm font-medium text-text-primary">
              Raison (visible dans l'historique)
            </label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={3}
              placeholder="Expliquez la raison de cette action..."
              className="w-full resize-none rounded-lg border border-border bg-bg px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20"
            />
          </div>
        )}

        {error && (
          <div className="mt-3 rounded-lg border border-danger/20 bg-danger-soft px-3 py-2 text-xs text-danger">
            {error}
          </div>
        )}

        <div className="mt-5 flex justify-end gap-2">
          <button
            onClick={onClose}
            className="rounded-lg border border-border px-4 py-2 text-sm font-medium text-text-secondary transition hover:bg-surface-hover"
          >
            Annuler
          </button>
          <button
            onClick={handleConfirm}
            disabled={isSubmitting || reasonTooShort}
            className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold text-white transition disabled:cursor-not-allowed disabled:opacity-50 ${
              danger ? 'bg-danger hover:opacity-90' : 'bg-accent hover:bg-accent-hover'
            }`}
          >
            {isSubmitting && <Loader2 size={14} className="animate-spin" />}
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}