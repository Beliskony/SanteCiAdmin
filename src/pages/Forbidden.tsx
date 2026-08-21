// src/pages/Forbidden.tsx
import { Link } from 'react-router-dom';
import { Lock } from 'lucide-react';

export default function Forbidden() {
  return (
    <div className="flex h-full flex-col items-center justify-center text-center">
      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-danger-soft text-danger">
        <Lock size={24} />
      </div>
      <h1 className="text-lg font-semibold text-text-primary">Accès refusé</h1>
      <p className="mt-1.5 max-w-sm text-sm text-text-secondary">
        Vous n'avez pas la permission nécessaire pour accéder à cette section. Contactez un superadmin si vous pensez qu'il s'agit d'une erreur.
      </p>
      <Link
        to="/dashboard"
        className="mt-5 rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-white transition hover:bg-accent-hover"
      >
        Retour au dashboard
      </Link>
    </div>
  );
}