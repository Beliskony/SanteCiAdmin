// src/pages/Patients.tsx
import { useState } from 'react';
import { Search, Ban, RotateCcw, MoreVertical, AlertTriangle } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import { usePatients } from '../hooks/usePatients';
import { StatusBadge } from '../components/ui/StatusBadge';
import { Pagination } from '../components/ui/Pagination';
import { ConfirmActionModal } from '../components/ui/ConfirmActionModal';
import { PatientDetailModal } from '../components/modals/PatientDetailModal';
import api from '../lib/api';
import type { PatientStatusFilter } from '../types/IPatient';

const TABS: { value: PatientStatusFilter; label: string }[] = [
  { value: 'all', label: 'Tous' },
  { value: 'active', label: 'Actifs' },
  { value: 'suspended', label: 'Suspendus' },
  { value: 'blocked', label: 'Bloqués' },
];

// TODO: remplacer par le vrai type exporté par types/IPatient si tu en as un
// pour la ligne de liste (ex. PatientListItem) — any en attendant.
type PatientRow = any;

type ModalState =
  | { type: 'detail'; patient: PatientRow }
  | { type: 'suspend'; id: string; name: string }
  | { type: 'block'; id: string; name: string }
  | { type: 'reactivate'; id: string; name: string }
  | null;

export default function Patients() {
  const [searchParams, setSearchParams] = useSearchParams();
  const status = (searchParams.get('status') as PatientStatusFilter) ?? 'all';
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [modal, setModal] = useState<ModalState>(null);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  const { data, isLoading, error, refetch } = usePatients({ status, search, page });

  function setStatusFilter(newStatus: PatientStatusFilter) {
    setSearchParams(newStatus === 'all' ? {} : { status: newStatus });
    setPage(1);
  }

  async function handleStatusChange(id: string, newStatus: string, reason?: string) {
    await api.patch(`/admin/patients/${id}/status`, { status: newStatus, reason });
    refetch();
  }

  function handleDetailAction(patient: PatientRow, action: 'suspend' | 'block' | 'reactivate') {
    const fullName = `${patient.profile.firstName} ${patient.profile.lastName}`;
    setModal({ type: action, id: patient._id, name: fullName });
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
          placeholder="Nom, téléphone, email..."
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
        ) : !data || data.patients.length === 0 ? (
          <div className="p-10 text-center text-sm text-text-muted">Aucun patient trouvé.</div>
        ) : (
          <>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-text-muted">
                  <th className="px-4 py-3 font-medium">Patient</th>
                  <th className="px-4 py-3 font-medium">Contact</th>
                  <th className="px-4 py-3 font-medium">Consultations</th>
                  <th className="px-4 py-3 font-medium">Statut</th>
                  <th className="px-4 py-3 font-medium"></th>
                </tr>
              </thead>
              <tbody>
                {data.patients.map((p) => {
                  const fullName = `${p.profile.firstName} ${p.profile.lastName}`;
                  return (
                    <tr
                      key={p._id}
                      onClick={() => setModal({ type: 'detail', patient: p })}
                      className="cursor-pointer border-b border-border last:border-0 hover:bg-surface-hover"
                    >
                      <td className="px-4 py-3">
                        <p className="font-medium text-text-primary">{fullName}</p>
                        <p className="text-xs text-text-muted">{p.location.city}</p>
                      </td>
                      <td className="px-4 py-3 text-text-secondary">
                        <p>{p.contact.phone}</p>
                        {p.contact.email && <p className="text-xs text-text-muted">{p.contact.email}</p>}
                      </td>
                      <td className="px-4 py-3 text-text-secondary">{p.metadata.totalConsultations}</td>
                      <td className="px-4 py-3">
                        <StatusBadge status={p.status.accountStatus} />
                      </td>
                      <td className="relative px-4 py-3 text-right" onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={() => setOpenMenuId(openMenuId === p._id ? null : p._id)}
                          className="rounded-lg p-1.5 text-text-muted transition hover:bg-surface-hover hover:text-text-secondary"
                        >
                          <MoreVertical size={16} />
                        </button>

                        {openMenuId === p._id && (
                          <div
                            onMouseLeave={() => setOpenMenuId(null)}
                            className="absolute right-4 top-10 z-10 w-44 rounded-lg border border-border bg-surface py-1 shadow-lg"
                          >
                            {p.status.accountStatus !== 'suspended' && (
                              <button
                                onClick={() => { setModal({ type: 'suspend', id: p._id, name: fullName }); setOpenMenuId(null); }}
                                className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-text-primary hover:bg-surface-hover"
                              >
                                <Ban size={15} className="text-warning" /> Suspendre
                              </button>
                            )}
                            {p.status.accountStatus !== 'blocked' && (
                              <button
                                onClick={() => { setModal({ type: 'block', id: p._id, name: fullName }); setOpenMenuId(null); }}
                                className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-danger hover:bg-danger-soft"
                              >
                                <Ban size={15} /> Bloquer
                              </button>
                            )}
                            {p.status.accountStatus !== 'active' && (
                              <button
                                onClick={() => { setModal({ type: 'reactivate', id: p._id, name: fullName }); setOpenMenuId(null); }}
                                className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-success hover:bg-success-soft"
                              >
                                <RotateCcw size={15} /> Réactiver
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
            <Pagination page={data.page} pages={data.pages} total={data.total} onPageChange={setPage} />
          </>
        )}
      </div>

      {modal?.type === 'detail' && (
        <PatientDetailModal
          patient={modal.patient}
          onAction={(action) => handleDetailAction(modal.patient, action)}
          onClose={() => setModal(null)}
        />
      )}
      {modal?.type === 'suspend' && (
        <ConfirmActionModal
          title="Suspendre ce patient"
          description={`${modal.name} ne pourra plus se connecter tant que son compte est suspendu.`}
          confirmLabel="Suspendre"
          requireReason
          danger
          onConfirm={(reason) => handleStatusChange(modal.id, 'suspended', reason)}
          onClose={() => setModal(null)}
        />
      )}
      {modal?.type === 'block' && (
        <ConfirmActionModal
          title="Bloquer ce patient"
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
          title="Réactiver ce patient"
          description={`${modal.name} retrouvera un accès normal.`}
          confirmLabel="Réactiver"
          onConfirm={() => handleStatusChange(modal.id, 'active')}
          onClose={() => setModal(null)}
        />
      )}
    </div>
  );
}