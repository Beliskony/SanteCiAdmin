// src/pages/Login.tsx
import { useState } from 'react';
import type { FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ApiError } from '../lib/api';
import { ThemeToggle } from '../components/ThemeToggle';
import { Eye, EyeClosed } from 'lucide-react';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [identifiantLogin, setIdentifiantLogin] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);
    try {
      await login(identifiantLogin, password);
      navigate('/dashboard');
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Identifiants incorrects. Réessayez.');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-bg px-4">
      {/* Halo décoratif discret, dérivé de l'accent — même esprit que les emails E-SantéCI */}
      <div
        aria-hidden
        className="pointer-events-none absolute -top-32 left-1/2 h-96 w-xl -translate-x-1/2 rounded-full opacity-20 blur-3xl"
        style={{ background: 'radial-gradient(circle, var(--color-accent) 0%, transparent 70%)' }}
      />

      <div className="absolute right-5 top-5">
        <ThemeToggle />
      </div>

      <div className="relative w-full max-w-sm">
        <div className="mb-8 text-center">
          <h1 className="text-xl font-bold tracking-tight text-text-primary">
            E-SantéCI <span className="font-normal text-text-muted">Admin</span>
          </h1>
          <p className="mt-1.5 text-sm text-text-secondary">
            Espace réservé aux administrateurs de la plateforme
          </p>
        </div>

        <div className="rounded-2xl border border-border bg-surface p-8 shadow-sm">
          <form onSubmit={handleSubmit} className="space-y-5" noValidate>
            <div>
              <label htmlFor="identifiantLogin" className="mb-1.5 block text-sm font-medium text-text-primary">
                Email ou téléphone
              </label>
              <input
                id="identifiantLogin"
                type="text"
                autoComplete="username"
                value={identifiantLogin}
                onChange={(e) => setIdentifiantLogin(e.target.value)}
                required
                placeholder="admin@esante.ci"
                className="w-full rounded-lg border border-border bg-bg px-3.5 py-2.5 text-sm text-text-primary placeholder:text-text-muted transition focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20"
              />
            </div>

            <div>
              <div className="mb-1.5 flex items-center justify-between">
                <label htmlFor="password" className="block text-sm font-medium text-text-primary">
                  Mot de passe
                </label>
                <a href="/forgot-password" className="text-xs font-medium text-accent hover:text-accent-hover">
                  Mot de passe oublié ?
                </a>
              </div>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                  className="w-full rounded-lg border border-border bg-bg px-3.5 py-2.5 pr-10 text-sm text-text-primary placeholder:text-text-muted transition focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label={showPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted transition hover:text-text-secondary"
                >
                  {showPassword ? <EyeClosed/> : <Eye/>}
                </button>
              </div>
            </div>

            {error && (
              <div
                role="alert"
                className="rounded-lg border border-danger/20 bg-danger-soft px-3.5 py-2.5 text-sm text-danger"
              >
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-accent px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-accent-hover disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSubmitting ? (
                <>
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                  Connexion...
                </>
              ) : (
                'Se connecter'
              )}
            </button>
          </form>
        </div>

        <p className="mt-6 text-center text-xs text-text-muted">
          Accès strictement réservé au personnel autorisé d'E-SantéCI.
        </p>
      </div>
    </div>
  );
}