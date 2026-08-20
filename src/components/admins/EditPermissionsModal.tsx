import { useState } from 'react';
import { X, Loader2, Settings2 } from 'lucide-react';
import api, { ApiError } from '../../lib/api';
import { ALL_PERMISSIONS } from '../../types/IAdminAccount';
import type { AdminAccountListItem } from '../../types/IAdminAccount';
import type { AdminPermission } from '../../types/IAdmin';

interface EditPermissionsModalProps {
  admin: AdminAccountListItem;
  onUpdated: () => void;
  onClose: () => void;
}

export function EditPermissionsModal({ admin, onUpdated, onClose }: EditPermissionsModalProps) {
  const [permissions, setPermissions] = useState<AdminPermission[]>(admin.permissions);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  function togglePermission(perm: AdminPermission) {
    setPermissions((prev) => (prev.includes(perm) ? prev.filter((p) => p !== perm) : [...prev, perm]));
  }

  async function handleSave() {
    if (permissions.length === 0) {
      setError('Au moins une permission requise.');
      return;
    }
    setError(null);
    setIsSubmitting(true);
    try {
      await api.patch(`/admin/${admin._id}/permissions`, { permissions });
      onUpdated();
      onClose();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Une erreur est survenue.');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="w-full max-w-sm rounded-2xl border border-border bg-surface p-6 shadow-xl">
        <div className="mb-4 flex items-start justify-between">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent-soft text-accent">
            <Settings2 size={18} />
          </div>
          <button onClick={onClose} className="text-text-muted transition hover:text-text-secondary">
            <X size={18} />
          </button>
        </div>

        <h2 className="text-base font-bold text-text-primary">Permissions de {admin.profile.fullName}</h2>

        <div className="mt-4 space-y-1.5 rounded-lg border border-border p-2">
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
            onClick={handleSave}
            disabled={isSubmitting}
            className="flex items-center gap-2 rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-white transition hover:bg-accent-hover disabled:opacity-50"
          >
            {isSubmitting && <Loader2 size={14} className="animate-spin" />}
            Enregistrer
          </button>
        </div>
      </div>
    </div>
  );
}