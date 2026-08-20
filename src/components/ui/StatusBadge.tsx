const STYLES: Record<string, string> = {
  active: 'bg-success-soft text-success',
  paid: 'bg-success-soft text-success',
  pending: 'bg-warning-soft text-warning',
  suspended: 'bg-danger-soft text-danger',
  blocked: 'bg-danger-soft text-danger',
  failed: 'bg-danger-soft text-danger',
  refunded: 'bg-surface-hover text-text-secondary',
  flagged: 'bg-warning-soft text-warning',
  hidden: 'bg-surface-hover text-text-secondary',
  published: 'bg-success-soft text-success',
};

const LABELS: Record<string, string> = {
  active: 'Actif',
  paid: 'Payé',
  pending: 'En attente',
  suspended: 'Suspendu',
  blocked: 'Bloqué',
  failed: 'Échoué',
  refunded: 'Remboursé',
  flagged: 'Signalé',
  hidden: 'Masqué',
  published: 'Publié',
};

export function StatusBadge({ status }: { status: string }) {
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${STYLES[status] ?? 'bg-surface-hover text-text-secondary'}`}>
      {LABELS[status] ?? status}
    </span>
  );
}