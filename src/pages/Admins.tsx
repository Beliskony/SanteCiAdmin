// src/pages/Admins.tsx
import { useState } from 'react';
import { Plus, Settings2, Ban, RotateCcw, ShieldAlert, Crown, AlertTriangle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useAdmins } from '../hooks/useAdmins';
import { StatusBadge } from '../components/ui/StatusBadge';
import { CreateAdminModal } from '../components/admins/CreateAdminModal';
import { EditPermissionsModal } from '../components/admins/EditPermissionsModal';
import { ConfirmActionModal } from '../components/ui/ConfirmActionModal';
import api  from '../lib/api';
import { ALL_PERMISSIONS } from '../types/IAdminAccount';
import type { AdminAccountListItem } from '../types/IAdminAccount';

type ModalState =
  | { type: 'create' }
  | { type: 'edit'; admin: AdminAccountListItem }
  | { type: 'suspend'; admin: AdminAccountListItem }
  | { type: 'reactivate'; admin: AdminAccountListItem }
  | null;

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return "à l'instant";
  if (minutes < 60) return `il y a ${minutes} min`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `il y a ${hours} h`;
  return `il y a ${Math.floor(hours / 24)} j`;
}

export default function Admins() {
  const { admin: currentAdmin } = useAuth();
  const { admins, isLoading, error, refetch } = useAdmins();
  const [modal, setModal] = useState<ModalState>(null);

  async function handleStatusChange(adminId: string, status: 'active' | 'suspended', reason?: string) {
    if (status === 'active') {
      await api.patch(`/admin/${adminId}/status`, { status: 'active' });
    } else {
      await api.patch(`/admin/${adminId}/status`, { status, reason });
    }
    refetch();
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <p className="text-sm text-text-secondary">
          Gérez les comptes administrateurs et leurs accès à la plateforme.
        </p>
        <button
          onClick={() => setModal({ type: 'create' })}
          className="flex items-center gap-2 rounded-lg bg-accent px-3.5 py-2 text-sm font-semibold text-white transition hover:bg-accent-hover"
        >
          <Plus size={16} />
          Nouvel admin
        </button>
      </div>

      <div className="overflow-hidden rounded-xl border border-border bg-surface">
        {isLoading ? (
          <div className="space-y-3 p-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-14 animate-pulse rounded-lg bg-surface-hover" />
            ))}
          </div>
        ) : error ? (
          <div className="flex flex-col items-center gap-2 p-10 text-center">
            <AlertTriangle size={20} className="text-danger" />
            <p className="text-sm text-danger">{error}</p>
          </div>
        ) : !admins || admins.length === 0 ? (
          <div className="p-10 text-center text-sm text-text-muted">Aucun administrateur pour l'instant.</div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-text-muted">
                <th className="px-4 py-3 font-medium">Administrateur</th>
                <th className="px-4 py-3 font-medium">Permissions</th>
                <th className="px-4 py-3 font-medium">Statut</th>
                <th className="px-4 py-3 font-medium">Dernière activité</th>
                <th className="px-4 py-3 font-medium"></th>
              </tr>
            </thead>
            <tbody>
              {admins.map((item) => {
                const isSelf = item._id === currentAdmin?._id;
                const isSuperAdmin = item.role === 'superadmin';

                return (
                  <tr key={item._id} className="border-b border-border last:border-0 hover:bg-surface-hover">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-text-primary">{item.profile.fullName}</p>
                        {isSuperAdmin && <Crown size={14} className="text-warning" />}
                        {isSelf && (
                          <span className="rounded-full bg-accent-soft px-2 py-0.5 text-[11px] font-medium text-accent">
                            Vous
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-text-muted">{item.contact.email}</p>
                    </td>
                    <td className="px-4 py-3">
                      {isSuperAdmin ? (
                        <span className="text-xs text-text-muted">Accès total</span>
                      ) : item.permissions.length === 0 ? (
                        <span className="text-xs text-text-muted">Aucune</span>
                      ) : (
                        <div className="flex flex-wrap gap-1">
                          {item.permissions.slice(0, 2).map((p) => (
                            <span key={p} className="rounded-full bg-surface-hover px-2 py-0.5 text-[11px] text-text-secondary">
                              {ALL_PERMISSIONS.find((ap) => ap.value === p)?.label ?? p}
                            </span>
                          ))}
                          {item.permissions.length > 2 && (
                            <span className="rounded-full bg-surface-hover px-2 py-0.5 text-[11px] text-text-muted">
                              +{item.permissions.length - 2}
                            </span>
                          )}
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5">
                        <StatusBadge status={item.status.accountStatus} />
                        {item.status.isOnline && (
                          <span className="h-2 w-2 rounded-full bg-success" title="En ligne" />
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-xs text-text-muted">{timeAgo(item.status.lastActive)}</td>
                    <td className="px-4 py-3">
                      {isSuperAdmin ? (
                        <span className="flex items-center gap-1 text-xs text-text-muted">
                          <ShieldAlert size={13} /> Protégé
                        </span>
                      ) : (
                        <div className="flex justify-end gap-1">
                          <button
                            onClick={() => setModal({ type: 'edit', admin: item })}
                            title="Modifier les permissions"
                            className="rounded-lg p-1.5 text-text-muted transition hover:bg-surface-hover hover:text-accent"
                          >
                            <Settings2 size={16} />
                          </button>
                          {item.status.accountStatus === 'active' ? (
                            <button
                              onClick={() => setModal({ type: 'suspend', admin: item })}
                              title="Suspendre"
                              className="rounded-lg p-1.5 text-text-muted transition hover:bg-danger-soft hover:text-danger"
                            >
                              <Ban size={16} />
                            </button>
                          ) : (
                            <button
                              onClick={() => setModal({ type: 'reactivate', admin: item })}
                              title="Réactiver"
                              className="rounded-lg p-1.5 text-text-muted transition hover:bg-success-soft hover:text-success"
                            >
                              <RotateCcw size={16} />
                            </button>
                          )}
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {modal?.type === 'create' && (
        <CreateAdminModal onCreated={refetch} onClose={() => setModal(null)} />
      )}
      {modal?.type === 'edit' && (
        <EditPermissionsModal admin={modal.admin} onUpdated={refetch} onClose={() => setModal(null)} />
      )}
      {modal?.type === 'suspend' && (
        <ConfirmActionModal
          title="Suspendre cet administrateur"
          description={`${modal.admin.profile.fullName} ne pourra plus se connecter au dashboard.`}
          confirmLabel="Suspendre"
          requireReason
          danger
          onConfirm={(reason) => handleStatusChange(modal.admin._id, 'suspended', reason)}
          onClose={() => setModal(null)}
        />
      )}
      {modal?.type === 'reactivate' && (
        <ConfirmActionModal
          title="Réactiver cet administrateur"
          description={`${modal.admin.profile.fullName} retrouvera l'accès au dashboard.`}
          confirmLabel="Réactiver"
          onConfirm={() => handleStatusChange(modal.admin._id, 'active')}
          onClose={() => setModal(null)}
        />
      )}
    </div>
  );
}