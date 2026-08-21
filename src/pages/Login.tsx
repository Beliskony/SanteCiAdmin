import { useState } from 'react';
import type { FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ApiError } from '../lib/api';
import { ThemeToggle } from '../components/ThemeToggle';
import { Eye, EyeOff } from 'lucide-react';

// Motif ECG répété deux fois bout à bout — le conteneur défile de 0 à -50%
// pour créer une boucle continue et sans à-coup.
const ECG_PATH =
  'M0,40 L120,40 L145,40 L158,8 L172,72 L186,20 L198,40 L340,40 L365,40 L378,8 L392,72 L406,20 L418,40 L560,40';

function EcgLine() {
  return (
    <div className="relative h-16 w-full overflow-hidden opacity-70">
      <svg
        className="absolute left-0 top-0 h-full motion-safe:animate-[ecg-scroll_7s_linear_infinite]"
        style={{ width: '1120px' }}
        viewBox="0 0 1120 80"
        preserveAspectRatio="none"
        fill="none"
        aria-hidden
      >
        <path
          d={ECG_PATH + ' ' + ECG_PATH.replace(/^M0,40/, 'M560,40')}
          stroke="var(--color-accent)"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );
}

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
    <div className="grid min-h-screen w-full grid-cols-1 bg-bg md:grid-cols-[minmax(0,42%)_1fr]">
      {/* Bandeau de marque */}
      <div className="relative hidden flex-col justify-between overflow-hidden bg-rail-bg px-12 py-14 md:flex">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="h-2 w-2 rounded-full bg-accent" />
            <span className="text-lg font-semibold tracking-tight text-rail-text">
              E-SantéCI
            </span>
            <span className="rounded-full border border-rail-muted px-2 py-0.5 text-[11px] font-medium uppercase tracking-wide text-rail-muted">
              Admin
            </span>
          </div>
          <p className="mt-6 max-w-xs text-[15px] leading-relaxed text-rail-muted">
            Plateforme nationale de télémédecine. Cet espace centralise la
            supervision des établissements, des praticiens et des accès.
          </p>
        </div>

        <EcgLine />

        <div className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-wider text-rail-muted">
          <span className="h-1.5 w-1.5 rounded-full bg-accent" />
          Administration sécurisée
        </div>
      </div>

      {/* Formulaire */}
      <div className="relative flex items-center justify-center px-6 py-12">
        <div className="absolute right-5 top-5">
          <ThemeToggle />
        </div>

        <div className="w-full max-w-sm">
          {/* En-tête visible seulement en mobile, la marque étant dans le bandeau sur desktop */}
          <div className="mb-6 md:hidden">
            <span className="text-lg font-semibold tracking-tight text-text-primary">
              E-SantéCI <span className="font-normal text-text-muted">Admin</span>
            </span>
          </div>

          <div className="mb-8">
            <p className="text-[11px] font-mono uppercase tracking-widest text-accent">
              Connexion
            </p>
            <h1 className="mt-1.5 text-2xl font-semibold tracking-tight text-text-primary">
              Accéder à votre espace
            </h1>
            <p className="mt-2 text-sm text-text-secondary">
              Réservé aux administrateurs et super-administrateurs de la plateforme.
            </p>
          </div>

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
                className="w-full rounded-lg border border-border bg-surface px-3.5 py-2.5 text-sm text-text-primary placeholder:text-text-muted transition focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20"
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
                  className="w-full rounded-lg border border-border bg-surface px-3.5 py-2.5 pr-10 text-sm text-text-primary placeholder:text-text-muted transition focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label={showPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted transition hover:text-text-secondary"
                >
                  {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
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

          <p className="mt-6 text-center text-xs text-text-muted">
            Accès strictement réservé au personnel autorisé d'E-SantéCI.
          </p>
        </div>
      </div>
    </div>
  );
}