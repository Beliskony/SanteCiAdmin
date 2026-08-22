// src/pages/Settings.tsx
import { useState } from 'react';
import type { FormEvent } from 'react';
import { User, KeyRound, Eye, EyeOff, Loader2, CheckCircle2, Sun, Moon, ShieldCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useChangePassword } from '../hooks/useChangePassword';
import { SettingsCard } from '../components/ui/SettingsCard';
import { ALL_PERMISSIONS } from '../types/IAdminAccount';

function formatDate(dateStr: string): string {
  return new Intl.DateTimeFormat('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' }).format(new Date(dateStr));
}

export default function Settings() {
  const { admin } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { changePassword, isSubmitting, error, success, resetSuccess } = useChangePassword();

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPasswords, setShowPasswords] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  if (!admin) return null;

  const isSuperAdmin = admin.role === 'superadmin';

  async function handlePasswordSubmit(e: FormEvent) {
    e.preventDefault();
    setFormError(null);
    resetSuccess();

    if (newPassword.length < 8) {
      setFormError('Le nouveau mot de passe doit contenir au moins 8 caractères.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setFormError('Les mots de passe ne correspondent pas.');
      return;
    }
    if (newPassword === currentPassword) {
      setFormError("Le nouveau mot de passe doit être différent de l'actuel.");
      return;
    }

    try {
      await changePassword(currentPassword, newPassword);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch {
      // l'erreur est déjà exposée via le hook (error)
    }
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      {/* ── Profil ── */}
      <SettingsCard icon={User} title="Profil" description="Vos informations administrateur.">
        <div className="flex items-center gap-4">
          <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-accent-soft text-lg font-semibold text-accent">
            {admin.profile.fullName.slice(0, 2).toUpperCase()}
          </div>
          <div className="min-w-0">
            <p className="truncate text-base font-semibold text-text-primary">{admin.profile.fullName}</p>
            <p className="truncate text-sm text-text-secondary">{admin.contact.email}</p>
            <p className="text-sm text-text-muted">{admin.contact.phone}</p>
          </div>
        </div>

        <dl className="mt-5 grid grid-cols-2 gap-4 border-t border-border pt-5 text-sm">
          <div>
            <dt className="text-text-muted">Identifiant</dt>
            <dd className="mt-0.5 font-medium text-text-primary">{admin.adminId}</dd>
          </div>
          <div>
            <dt className="text-text-muted">Rôle</dt>
            <dd className="mt-0.5 flex items-center gap-1.5 font-medium text-text-primary">
              {isSuperAdmin && <ShieldCheck size={14} className="text-warning" />}
              {isSuperAdmin ? 'Superadmin' : 'Admin'}
            </dd>
          </div>
          <div>
            <dt className="text-text-muted">Membre depuis</dt>
              <dd className="mt-0.5 font-medium text-text-primary">
                {admin.metadata?.createdAt ? formatDate(admin.metadata.createdAt) : '—'}
              </dd>
          </div>
          <div>
            <dt className="text-text-muted">Statut</dt>
            <dd className="mt-0.5 font-medium text-success">Actif</dd>
          </div>
        </dl>

        {!isSuperAdmin && (
          <div className="mt-5 border-t border-border pt-5">
            <p className="mb-2 text-sm text-text-muted">Vos permissions</p>
            <div className="flex flex-wrap gap-1.5">
              {admin.permissions.length === 0 ? (
                <span className="text-sm text-text-muted">Aucune permission assignée.</span>
              ) : (
                admin.permissions.map((p) => (
                  <span key={p} className="rounded-full bg-surface-hover px-2.5 py-1 text-xs text-text-secondary">
                    {ALL_PERMISSIONS.find((ap) => ap.value === p)?.label ?? p}
                  </span>
                ))
              )}
            </div>
          </div>
        )}
      </SettingsCard>

      {/* ── Apparence ── */}
      <SettingsCard icon={theme === 'dark' ? Moon : Sun} title="Apparence" description="Thème de l'interface.">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-text-primary">
              Thème {theme === 'dark' ? 'sombre' : 'clair'}
            </p>
            <p className="text-sm text-text-secondary">Basculez selon votre préférence.</p>
          </div>
          <button
            onClick={toggleTheme}
            className="flex items-center gap-2 rounded-lg border border-border px-3.5 py-2 text-sm font-medium text-text-secondary transition hover:bg-surface-hover"
          >
            {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
            Passer en {theme === 'dark' ? 'clair' : 'sombre'}
          </button>
        </div>
      </SettingsCard>

      {/* ── Mot de passe ── */}
      <SettingsCard icon={KeyRound} title="Mot de passe" description="Modifiez votre mot de passe de connexion.">
        <form onSubmit={handlePasswordSubmit} className="space-y-4">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-text-primary">Mot de passe actuel</label>
            <input
              type={showPasswords ? 'text' : 'password'}
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              required
              autoComplete="current-password"
              className="w-full rounded-lg border border-border bg-bg px-3 py-2 text-sm text-text-primary focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-text-primary">Nouveau mot de passe</label>
              <input
                type={showPasswords ? 'text' : 'password'}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                minLength={8}
                autoComplete="new-password"
                className="w-full rounded-lg border border-border bg-bg px-3 py-2 text-sm text-text-primary focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-text-primary">Confirmer</label>
              <input
                type={showPasswords ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                minLength={8}
                autoComplete="new-password"
                className="w-full rounded-lg border border-border bg-bg px-3 py-2 text-sm text-text-primary focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20"
              />
            </div>
          </div>

          <button
            type="button"
            onClick={() => setShowPasswords((v) => !v)}
            className="flex items-center gap-1.5 text-xs font-medium text-text-secondary hover:text-text-primary"
          >
            {showPasswords ? <EyeOff size={13} /> : <Eye size={13} />}
            {showPasswords ? 'Masquer' : 'Afficher'} les mots de passe
          </button>

          {(formError || error) && (
            <div className="rounded-lg border border-danger/20 bg-danger-soft px-3 py-2 text-sm text-danger">
              {formError ?? error}
            </div>
          )}

          {success && (
            <div className="flex items-center gap-2 rounded-lg border border-success/20 bg-success-soft px-3 py-2 text-sm text-success">
              <CheckCircle2 size={15} />
              Mot de passe mis à jour avec succès.
            </div>
          )}

          <div className="flex justify-end pt-1">
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center gap-2 rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-white transition hover:bg-accent-hover disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isSubmitting && <Loader2 size={14} className="animate-spin" />}
              Mettre à jour
            </button>
          </div>
        </form>
      </SettingsCard>
    </div>
  );
}