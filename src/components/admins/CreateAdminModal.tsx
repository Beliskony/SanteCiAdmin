// src/components/admins/CreateAdminModal.tsx
import { useState } from 'react';
import { X, Loader2, UserPlus } from 'lucide-react';
import api, { ApiError } from '../../lib/api';
import { ALL_PERMISSIONS } from '../../types/IAdminAccount';
import type { AdminPermission } from '../../types/IAdmin';

interface CreateAdminModalProps {
  onCreated: () => void;
  onClose: () => void;
}

export function CreateAdminModal({ onCreated, onClose }: CreateAdminModalProps) {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [permissions, setPermissions] = useState<AdminPermission[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  function togglePermission(perm: AdminPermission) {
    setPermissions((prev) => (prev.includes(perm) ? prev.filter((p) => p !== perm) : [...prev, perm]));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (permissions.length === 0) {
      setError('Sélectionnez au moins une permission.');
      return;
    }
    setError(null);
    setIsSubmitting(true);
    try {
      await api.post('/admin', { fullName, email, phone, password, permissions });
      onCreated();
      onClose();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Une erreur est survenue.');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-2xl border border-border bg-surface p-6 shadow-xl">
        <div className="mb-4 flex items-start justify-between">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent-soft text-accent">
            <UserPlus size={18} />
          </div>
          <button onClick={onClose} className="text-text-muted transition hover:text-text-secondary">
            <X size={18} />
          </button>
        </div>

        <h2 className="text-base font-bold text-text-primary">Nouvel administrateur</h2>
        <p className="mt-1 text-sm text-text-secondary">
          Il pourra se connecter avec ces identifiants et accédera uniquement aux sections cochées ci-dessous.
        </p>

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-text-primary">Nom complet</label>
            <input
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
              className="w-full rounded-lg border border-border bg-bg px-3 py-2 text-sm text-text-primary focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-text-primary">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full rounded-lg border border-border bg-bg px-3 py-2 text-sm text-text-primary focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-text-primary">Téléphone</label>
              <input
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
                className="w-full rounded-lg border border-border bg-bg px-3 py-2 text-sm text-text-primary focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20"
              />
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-text-primary">Mot de passe temporaire</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={8}
              className="w-full rounded-lg border border-border bg-bg px-3 py-2 text-sm text-text-primary focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-text-primary">Permissions</label>
            <div className="space-y-1.5 rounded-lg border border-border p-2">
              {ALL_PERMISSIONS.map((perm) => (
                <label
                  key={perm.value}
                  className="flex cursor-pointer items-center gap-2.5 rounded-lg px-2 py-1.5 text-sm text-text-primary hover:bg-surface-hover"
                >
                  <input
                    type="checkbox"
                    checked={permissions.includes(perm.value)}
                    onChange={() => togglePermission(perm.value)}
                    className="h-4 w-4 rounded border-border text-accent focus:ring-accent/30"
                  />
                  {perm.label}
                </label>
              ))}
            </div>
          </div>

          {error && (
            <div className="rounded-lg border border-danger/20 bg-danger-soft px-3 py-2 text-xs text-danger">
              {error}
            </div>
          )}

          <div className="flex justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-border px-4 py-2 text-sm font-medium text-text-secondary transition hover:bg-surface-hover"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center gap-2 rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-white transition hover:bg-accent-hover disabled:opacity-50"
            >
              {isSubmitting && <Loader2 size={14} className="animate-spin" />}
              Créer
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}