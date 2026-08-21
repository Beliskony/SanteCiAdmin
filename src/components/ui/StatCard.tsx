import type { LucideIcon } from 'lucide-react';

interface StatCardProps {
  label: string;
  value: string | number;
  hint?: string;
  accent?: 'default' | 'warning' | 'success' | 'danger';
  icon: LucideIcon;
}

const ACCENT_STYLES: Record<NonNullable<StatCardProps['accent']>, string> = {
  default: 'bg-accent-soft text-accent',
  warning: 'bg-warning-soft text-warning',
  success: 'bg-success-soft text-success',
  danger: 'bg-danger-soft text-danger',
};

export function StatCard({ label, value, hint, accent = 'default', icon: Icon }: StatCardProps) {
  return (
    <div className="rounded-2xl border border-border bg-surface p-5 transition hover:border-text-muted/30">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate text-sm text-text-secondary">{label}</p>
          <p className="mt-1.5 text-2xl font-semibold tracking-tight text-text-primary">{value}</p>
        </div>
        <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${ACCENT_STYLES[accent]}`}>
          <Icon size={17} />
        </div>
      </div>
      {hint && <p className="mt-3 text-xs text-text-muted">{hint}</p>}
    </div>
  );
}