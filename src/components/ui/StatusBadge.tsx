const STYLES: Record<string, string> = {
  active: 'bg-success-soft text-success',
  paid: 'bg-success-soft text-success',
  published: 'bg-success-soft text-success',
  pending: 'bg-warning-soft text-warning',
  flagged: 'bg-warning-soft text-warning',
  suspended: 'bg-danger-soft text-danger',
  blocked: 'bg-danger-soft text-danger',
  failed: 'bg-danger-soft text-danger',
  refunded: 'bg-surface-hover text-text-secondary',
  hidden: 'bg-surface-hover text-text-secondary',
};

const DOT_STYLES: Record<string, string> = {
  active: 'bg-success',
  paid: 'bg-success',
  published: 'bg-success',
  pending: 'bg-warning',
  flagged: 'bg-warning',
  suspended: 'bg-danger',
  blocked: 'bg-danger',
  failed: 'bg-danger',
  refunded: 'bg-text-muted',
  hidden: 'bg-text-muted',
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
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${
        STYLES[status] ?? 'bg-surface-hover text-text-secondary'
      }`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${DOT_STYLES[status] ?? 'bg-text-muted'}`} />
      {LABELS[status] ?? status}
    </span>
  );
}