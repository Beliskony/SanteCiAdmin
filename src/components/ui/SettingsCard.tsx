// src/components/ui/SettingsCard.tsx
import type { ReactNode } from 'react';
import type { LucideIcon } from 'lucide-react';

interface SettingsCardProps {
  icon: LucideIcon;
  title: string;
  description?: string;
  children: ReactNode;
}

export function SettingsCard({ icon: Icon, title, description, children }: SettingsCardProps) {
  return (
    <div className="rounded-xl border border-border bg-surface p-6">
      <div className="mb-5 flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-accent-soft text-accent">
          <Icon size={18} />
        </div>
        <div>
          <h2 className="text-base font-bold text-text-primary">{title}</h2>
          {description && <p className="mt-0.5 text-sm text-text-secondary">{description}</p>}
        </div>
      </div>
      {children}
    </div>
  );
}