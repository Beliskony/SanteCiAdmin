// src/pages/Hospitals.tsx
import { useState } from 'react';
import { Search, ShieldCheck, Ban, RotateCcw, MoreVertical, AlertTriangle } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import { useHospitals } from '../hooks/useHospitals';
import { StatusBadge } from '../components/ui/StatusBadge';
import { Pagination } from '../components/ui/Pagination';
import { ConfirmActionModal } from '../components/ui/ConfirmActionModal';
import { HospitalDetailModal } from '../components/modals/HospitalDetailModal';
import api from '../lib/api';
import { HOSPITAL_TYPE_LABELS } from '../types/IHopital';
import type { HospitalStatusFilter } from '../types/IHopital';

const TABS: { value: HospitalStatusFilter; label: string }[] = [
  { value: 'all', label: 'Tous' },
  { value: 'active', label: 'Actifs' },
  { value: 'suspended', label: 'Suspendus' },
  { value: 'blocked', label: 'Bloqués' },
];

// TODO: remplacer par le vrai type exporté par types/IHopital si tu en as un
// pour la ligne de liste (ex. HospitalListItem) — any en attendant.
type HospitalRow = any;

type ModalState =
  | { type: 'detail'; hospital: HospitalRow }
  | { type: 'verify'; id: string; name: string }
  | { type: 'suspend'; id: string; name: string }
  | { type: 'block'; id: string; name: string }
  | { type: 'reactivate'; id: string; name: string }
  | null;

export default function Hospitals() {
  const [searchParams, setSearchParams] = useSearchParams();
  const status = (searchParams.get('status') as HospitalStatusFilter) ?? 'all';
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [modal, setModal] = useState<ModalState>(null);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  const { data, isLoading, error, refetch } = useHospitals({ status, search, page });

  function setStatusFilter(newStatus: HospitalStatusFilter) {
    setSearchParams(newStatus === 'all' ? {} : { status: newStatus });
    setPage(1);
  }

  async function handleVerify(id: string) {
    await api.patch(`/admin/hospitals/${id}/verify`);
    refetch();
  }

  async function handleStatusChange(id: string, newStatus: string, reason?: string) {
    await api.patch(`/admin/hospitals/${id}/status`, { status: newStatus, reason });
    refetch();
  }

  // Traduit une action choisie depuis le modal de détail en la modale de confirmation existante
  function handleDetailAction(hospital: HospitalRow, action: 'verify' | 'suspend' | 'block' | 'reactivate') {
    if (action === 'verify') {
      setModal({ type: 'verify', id: hospital._id, name: hospital.name });
    } else {
      setModal({ type: action, id: hospital._id, name: hospital.name });
    }
  }

  return (
    <div className="space-y-5">
      <div className="flex gap-1 overflow-x-auto rounded-lg border border-border bg-surface p-1">
        {TABS.map((tab) => (
          <button
            key={tab.value}
            onClick={() => setStatusFilter(tab.value)}
            className={`shrink-0 rounded-md px-3.5 py-1.5 text-sm font-medium transition ${
              status === tab.value ? 'bg-accent-soft text-accent' : 'text-text-secondary hover:bg-surface-hover'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="relative max-w-xs">
        <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
        <input
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          placeholder="Nom, ville, email..."
          className="w-full rounded-lg border border-border bg-surface py-2 pl-9 pr-3 text-sm text-text-primary placeholder:text-text-muted focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20"
        />
      </div>

      <div className="overflow-hidden rounded-xl border border-border bg-surface">
        {isLoading ? (
          <div className="space-y-3 p-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-12 animate-pulse rounded-lg bg-surface-hover" />
            ))}
          </div>
        ) : error ? (
          <div className="flex flex-col items-center gap-2 p-10 text-center">
            <AlertTriangle size={20} className="text-danger" />
            <p className="text-sm text-danger">{error}</p>
          </div>
        ) : !data || data.hospitals.length === 0 ? (
          <div className="p-10 text-center text-sm text-text-muted">Aucun établissement trouvé.</div>
        ) : (
          <>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-text-muted">
                  <th className="px-4 py-3 font-medium">Établissement</th>
                  <th className="px-4 py-3 font-medium">Type</th>
                  <th className="px-4 py-3 font-medium">Ville</th>
                  <th className="px-4 py-3 font-medium">Statut</th>
                  <th className="px-4 py-3 font-medium"></th>
                </tr>
              </thead>
              <tbody>
                {data.hospitals.map((h) => (
                  <tr
                    key={h._id}
                    onClick={() => setModal({ type: 'detail', hospital: h })}
                    className="cursor-pointer border-b border-border last:border-0 hover:bg-surface-hover"
                  >
                    <td className="px-4 py-3">
                      <p className="font-medium text-text-primary">{h.name}</p>
                      <p className="text-xs text-text-muted">{h.contact.email}</p>
                    </td>
                    <td className="px-4 py-3 text-text-secondary">{HOSPITAL_TYPE_LABELS[h.type]}</td>
                    <td className="px-4 py-3 text-text-secondary">{h.location.city}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5">
                        <StatusBadge status={h.status.accountStatus} />
                        {!h.metadata.verified && <span className="text-xs text-text-muted">non vérifié</span>}
                      </div>
                    </td>
                    <td className="relative px-4 py-3 text-right" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() => setOpenMenuId(openMenuId === h._id ? null : h._id)}
                        className="rounded-lg p-1.5 text-text-muted transition hover:bg-surface-hover hover:text-text-secondary"
                      >
                        <MoreVertical size={16} />
                      </button>

                      {openMenuId === h._id && (
                        <div
                          onMouseLeave={() => setOpenMenuId(null)}
                          className="absolute right-4 top-10 z-10 w-44 rounded-lg border border-border bg-surface py-1 shadow-lg"
                        >
                          {!h.metadata.verified && (
                            <button
                              onClick={() => { setModal({ type: 'verify', id: h._id, name: h.name }); setOpenMenuId(null); }}
                              className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-text-primary hover:bg-surface-hover"
                            >
                              <ShieldCheck size={15} className="text-success" /> Vérifier
                            </button>
                          )}
                          {h.status.accountStatus !== 'suspended' && (
                            <button
                              onClick={() => { setModal({ type: 'suspend', id: h._id, name: h.name }); setOpenMenuId(null); }}
                              className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-text-primary hover:bg-surface-hover"
                            >
                              <Ban size={15} className="text-warning" /> Suspendre
                            </button>
                          )}
                          {h.status.accountStatus !== 'blocked' && (
                            <button
                              onClick={() => { setModal({ type: 'block', id: h._id, name: h.name }); setOpenMenuId(null); }}
                              className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-danger hover:bg-danger-soft"
                            >
                              <Ban size={15} /> Bloquer
                            </button>
                          )}
                          {h.status.accountStatus !== 'active' && (
                            <button
                              onClick={() => { setModal({ type: 'reactivate', id: h._id, name: h.name }); setOpenMenuId(null); }}
                              className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-success hover:bg-success-soft"
                            >
                              <RotateCcw size={15} /> Réactiver
                            </button>
                          )}
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <Pagination page={data.page} pages={data.pages} total={data.total} onPageChange={setPage} />
          </>
        )}
      </div>

      {modal?.type === 'detail' && (
        <HospitalDetailModal
          hospital={modal.hospital}
          onAction={(action) => handleDetailAction(modal.hospital, action)}
          onClose={() => setModal(null)}
        />
      )}
      {modal?.type === 'verify' && (
        <ConfirmActionModal
          title="Vérifier cet établissement"
          description={`${modal.name} sera marqué comme vérifié.`}
          confirmLabel="Vérifier"
          onConfirm={() => handleVerify(modal.id)}
          onClose={() => setModal(null)}
        />
      )}
      {modal?.type === 'suspend' && (
        <ConfirmActionModal
          title="Suspendre cet établissement"
          description={`${modal.name} sera masqué de la recherche publique.`}
          confirmLabel="Suspendre"
          requireReason
          danger
          onConfirm={(reason) => handleStatusChange(modal.id, 'suspended', reason)}
          onClose={() => setModal(null)}
        />
      )}
      {modal?.type === 'block' && (
        <ConfirmActionModal
          title="Bloquer cet établissement"
          description={`${modal.name} sera définitivement bloqué.`}
          confirmLabel="Bloquer"
          requireReason
          danger
          onConfirm={(reason) => handleStatusChange(modal.id, 'blocked', reason)}
          onClose={() => setModal(null)}
        />
      )}
      {modal?.type === 'reactivate' && (
        <ConfirmActionModal
          title="Réactiver cet établissement"
          description={`${modal.name} redevient visible publiquement.`}
          confirmLabel="Réactiver"
          onConfirm={() => handleStatusChange(modal.id, 'active')}
          onClose={() => setModal(null)}
        />
      )}
    </div>
  );
}