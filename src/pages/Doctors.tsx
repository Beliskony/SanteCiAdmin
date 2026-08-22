// src/pages/Doctors.tsx
import { useState } from 'react';
import { Search, ShieldCheck, Ban, RotateCcw, MoreVertical, AlertTriangle, Star } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import { useDoctors } from '../hooks/useDoctors';
import { StatusBadge } from '../components/ui/StatusBadge';
import { Pagination } from '../components/ui/Pagination';
import { ConfirmActionModal } from '../components/ui/ConfirmActionModal';
import { DoctorDetailModal } from '../components/modals/DoctorDetailModal';
import api from '../lib/api';

type DoctorStatusFilter = 'all' | 'active' | 'pending' | 'suspended' | 'blocked';

const TABS: { value: DoctorStatusFilter; label: string }[] = [
  { value: 'all', label: 'Tous' },
  { value: 'active', label: 'Actifs' },
  { value: 'pending', label: 'En attente' },
  { value: 'suspended', label: 'Suspendus' },
  { value: 'blocked', label: 'Bloqués' },
];

// TODO: remplacer par le vrai type exporté par types/IDoctor si tu en as un
// pour la ligne de liste — any en attendant.
type DoctorRow = any;

type ModalState =
  | { type: 'detail'; doctor: DoctorRow }
  | { type: 'verify'; id: string; name: string }
  | { type: 'suspend'; id: string; name: string }
  | { type: 'block'; id: string; name: string }
  | { type: 'reactivate'; id: string; name: string }
  | null;

export default function Doctors() {
  const [searchParams, setSearchParams] = useSearchParams();
  const status = (searchParams.get('status') as DoctorStatusFilter) ?? 'all';
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [modal, setModal] = useState<ModalState>(null);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  const { data, isLoading, error, refetch } = useDoctors({ status, search, page });

  function setStatusFilter(newStatus: DoctorStatusFilter) {
    setSearchParams(newStatus === 'all' ? {} : { status: newStatus });
    setPage(1);
  }

  async function handleVerify(id: string) {
    await api.patch(`/admin/doctors/${id}/verify`);
    refetch();
  }

  async function handleStatusChange(id: string, newStatus: string, reason?: string) {
    await api.patch(`/admin/doctors/${id}/status`, { status: newStatus, reason });
    refetch();
  }

  function handleDetailAction(doctor: DoctorRow, action: 'verify' | 'suspend' | 'block' | 'reactivate') {
    const fullName = `Dr. ${doctor.profile.firstName} ${doctor.profile.lastName}`;
    if (action === 'verify') {
      setModal({ type: 'verify', id: doctor._id, name: fullName });
    } else {
      setModal({ type: action, id: doctor._id, name: fullName });
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
          placeholder="Nom, email, identifiant..."
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
        ) : !data || data.doctors.length === 0 ? (
          <div className="p-10 text-center text-sm text-text-muted">Aucun médecin trouvé.</div>
        ) : (
          <>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-text-muted">
                  <th className="px-4 py-3 font-medium">Médecin</th>
                  <th className="px-4 py-3 font-medium">Ville</th>
                  <th className="px-4 py-3 font-medium">Note</th>
                  <th className="px-4 py-3 font-medium">Statut</th>
                  <th className="px-4 py-3 font-medium"></th>
                </tr>
              </thead>
              <tbody>
                {data.doctors.map((d) => (
                  <tr
                    key={d._id}
                    onClick={() => setModal({ type: 'detail', doctor: d })}
                    className="cursor-pointer border-b border-border last:border-0 hover:bg-surface-hover"
                  >
                    <td className="px-4 py-3">
                      <p className="font-medium text-text-primary">Dr. {d.profile.firstName} {d.profile.lastName}</p>
                      <p className="text-xs text-text-muted">{d.contact.email}</p>
                    </td>
                    <td className="px-4 py-3 text-text-secondary">{d.location?.city ?? '—'}</td>
                    <td className="px-4 py-3 text-text-secondary">
                      {typeof d.telemedicine?.rating === 'number' ? (
                        <span className="flex items-center gap-1">
                          <Star size={13} className="fill-warning text-warning" />
                          {d.telemedicine.rating.toFixed(1)}
                        </span>
                      ) : (
                        '—'
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5">
                        <StatusBadge status={d.status.accountStatus} />
                        {!d.status.isVerified && <span className="text-xs text-text-muted">non vérifié</span>}
                      </div>
                    </td>
                    <td className="relative px-4 py-3 text-right" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() => setOpenMenuId(openMenuId === d._id ? null : d._id)}
                        className="rounded-lg p-1.5 text-text-muted transition hover:bg-surface-hover hover:text-text-secondary"
                      >
                        <MoreVertical size={16} />
                      </button>

                      {openMenuId === d._id && (
                        <div
                          onMouseLeave={() => setOpenMenuId(null)}
                          className="absolute right-4 top-10 z-10 w-44 rounded-lg border border-border bg-surface py-1 shadow-lg"
                        >
                          {!d.status.isVerified && (
                            <button
                              onClick={() => { handleDetailAction(d, 'verify'); setOpenMenuId(null); }}
                              className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-text-primary hover:bg-surface-hover"
                            >
                              <ShieldCheck size={15} className="text-success" /> Vérifier
                            </button>
                          )}
                          {d.status.accountStatus !== 'suspended' && (
                            <button
                              onClick={() => { handleDetailAction(d, 'suspend'); setOpenMenuId(null); }}
                              className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-text-primary hover:bg-surface-hover"
                            >
                              <Ban size={15} className="text-warning" /> Suspendre
                            </button>
                          )}
                          {d.status.accountStatus !== 'blocked' && (
                            <button
                              onClick={() => { handleDetailAction(d, 'block'); setOpenMenuId(null); }}
                              className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-danger hover:bg-danger-soft"
                            >
                              <Ban size={15} /> Bloquer
                            </button>
                          )}
                          {d.status.accountStatus !== 'active' && (
                            <button
                              onClick={() => { handleDetailAction(d, 'reactivate'); setOpenMenuId(null); }}
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
        <DoctorDetailModal
          doctor={modal.doctor}
          onAction={(action) => handleDetailAction(modal.doctor, action)}
          onClose={() => setModal(null)}
        />
      )}
      {modal?.type === 'verify' && (
        <ConfirmActionModal
          title="Vérifier ce médecin"
          description={`${modal.name} sera marqué comme vérifié et visible publiquement.`}
          confirmLabel="Vérifier"
          onConfirm={() => handleVerify(modal.id)}
          onClose={() => setModal(null)}
        />
      )}
      {modal?.type === 'suspend' && (
        <ConfirmActionModal
          title="Suspendre ce médecin"
          description={`${modal.name} ne pourra plus recevoir de nouvelles consultations.`}
          confirmLabel="Suspendre"
          requireReason
          danger
          onConfirm={(reason) => handleStatusChange(modal.id, 'suspended', reason)}
          onClose={() => setModal(null)}
        />
      )}
      {modal?.type === 'block' && (
        <ConfirmActionModal
          title="Bloquer ce médecin"
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
          title="Réactiver ce médecin"
          description={`${modal.name} retrouve un accès normal à la plateforme.`}
          confirmLabel="Réactiver"
          onConfirm={() => handleStatusChange(modal.id, 'active')}
          onClose={() => setModal(null)}
        />
      )}
    </div>
  );
}