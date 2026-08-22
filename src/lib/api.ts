const BASE_URL = import.meta.env.VITE_API_BASE_URL as string;

export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
    this.name = 'ApiError';
  }
}

interface RequestOptions extends Omit<RequestInit, 'body'> {
  body?: unknown;
  skipAuth?: boolean;
  isRetry?: boolean;
}

// ── Refresh automatique sur 401 (file d'attente pour éviter les refresh en rafale) ──

let isRefreshing = false;
let refreshQueue: Array<() => void> = [];

async function refreshTokens(): Promise<void> {
  const refreshToken = localStorage.getItem('admin_refresh_token');
  if (!refreshToken) throw new ApiError('Session expirée.', 401);

  let res: Response;
  try {
    res = await fetch(`${BASE_URL}/admin/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken }),
    });
  } catch {
    // Serveur injoignable / réseau coupé : on ne sait pas si la session est invalide,
    // donc on NE LA détruit PAS. status 0 = erreur transitoire, pas un rejet explicite.
    throw new ApiError('Impossible de contacter le serveur.', 0);
  }

  if (!res.ok) throw new ApiError('Session expirée.', res.status);

  const json = await res.json();
  localStorage.setItem('admin_access_token', json.data.accessToken);
  localStorage.setItem('admin_refresh_token', json.data.refreshToken);
}

function clearSessionAndRedirect(): void {
  localStorage.removeItem('admin_access_token');
  localStorage.removeItem('admin_refresh_token');
  window.location.href = '/login';
}

// ── Fonction principale ──────────────────────────────────────────────────────

async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { body, skipAuth, isRetry, headers, ...rest } = options;

  const token = localStorage.getItem('admin_access_token');

  const res = await fetch(`${BASE_URL}${path}`, {
    ...rest,
    headers: {
      'Content-Type': 'application/json',
      ...(token && !skipAuth ? { Authorization: `Bearer ${token}` } : {}),
      ...headers,
    },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  // 401 sur une route protégée, pas déjà en retry, pas la route de login elle-même
  if (res.status === 401 && !skipAuth && !isRetry && !path.includes('/admin/login')) {
    if (isRefreshing) {
      // Une autre requête est déjà en train de rafraîchir : on attend son résultat
      await new Promise<void>((resolve) => refreshQueue.push(resolve));
      return request<T>(path, { ...options, isRetry: true });
    }

    isRefreshing = true;
    try {
      await refreshTokens();
      refreshQueue.forEach((resolve) => resolve());
      refreshQueue = [];
      return request<T>(path, { ...options, isRetry: true });
    } catch (err) {
      refreshQueue = [];

      // status 0 = le refresh a échoué à cause d'un problème réseau/serveur, pas parce
      // que le serveur a explicitement rejeté le refresh token. Dans ce cas on garde
      // la session intacte : l'utilisateur pourra réessayer sans se reconnecter.
      const isTransientFailure = err instanceof ApiError && err.status === 0;
      if (!isTransientFailure) {
        clearSessionAndRedirect();
      }
      throw err;
    } finally {
      isRefreshing = false;
    }
  }

  let json: any = null;
  try {
    json = await res.json();
  } catch {
    // réponse sans corps (ex: 204)
  }

  if (!res.ok) {
    throw new ApiError(json?.message ?? 'Une erreur est survenue.', res.status);
  }

  return json as T;
}

// ── API publique, typée par méthode ──────────────────────────────────────────

const api = {
  get:    <T>(path: string, options?: RequestOptions) => request<T>(path, { ...options, method: 'GET' }),
  post:   <T>(path: string, body?: unknown, options?: RequestOptions) => request<T>(path, { ...options, method: 'POST', body }),
  patch:  <T>(path: string, body?: unknown, options?: RequestOptions) => request<T>(path, { ...options, method: 'PATCH', body }),
  delete: <T>(path: string, options?: RequestOptions) => request<T>(path, { ...options, method: 'DELETE' }),
};

export default api;