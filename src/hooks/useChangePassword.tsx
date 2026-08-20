// src/hooks/useChangePassword.ts
import { useState } from 'react';
import api, { ApiError } from '../lib/api';

export function useChangePassword() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  async function changePassword(currentPassword: string, newPassword: string) {
    setError(null);
    setSuccess(false);
    setIsSubmitting(true);
    try {
      await api.patch('/admin/password', { currentPassword, newPassword });
      setSuccess(true);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Une erreur est survenue.');
      throw err;
    } finally {
      setIsSubmitting(false);
    }
  }

  return { changePassword, isSubmitting, error, success, resetSuccess: () => setSuccess(false) };
}