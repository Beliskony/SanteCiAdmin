// src/components/ui/DetailModal.tsx
import type { ReactNode } from 'react';
import type { LucideIcon } from 'lucide-react';
import { X } from 'lucide-react';

interface DetailModalProps {
  icon: LucideIcon;
  title: string;
  subtitle?: string;
  onClose: () => void;
  children: ReactNode;
  actions?: ReactNode;
}

export function DetailModal({ icon: Icon, title, subtitle, onClose, children, actions }: DetailModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-bg/60 px-4 backdrop-blur-sm">
      <div className="max-h-[85vh] w-full max-w-lg overflow-y-auto rounded-2xl border border-border bg-surface shadow-lg motion-safe:animate-[modal-in_0.15s_ease-out]">
        <div className="flex items-start justify-between border-b border-border px-6 py-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-accent-soft text-accent">
              <Icon size={18} />
            </div>
            <div>
              <h2 className="text-base font-semibold text-text-primary">{title}</h2>
              {subtitle && <p className="text-sm text-text-secondary">{subtitle}</p>}
            </div>
          </div>
          <button onClick={onClose} aria-label="Fermer" className="text-text-muted transition hover:text-text-secondary">
            <X size={18} />
          </button>
        </div>

        <div className="space-y-5 px-6 py-5">{children}</div>

        {actions && (
          <div className="flex flex-wrap justify-end gap-2 border-t border-border px-6 py-4">{actions}</div>
        )}
      </div>
    </div>
  );
}

export function DetailSection({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div>
      <p className="mb-2 text-xs font-medium uppercase tracking-wide text-text-muted">{label}</p>
      <div className="space-y-2 rounded-lg border border-border p-3">{children}</div>
    </div>
  );
}

export function DetailRow({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4 text-sm">
      <span className="text-text-muted">{label}</span>
      <span className="text-right font-medium text-text-primary">{value ?? '—'}</span>
    </div>
  );
}