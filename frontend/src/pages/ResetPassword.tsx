import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { useAuthStore } from '@/store/authStore';

export default function ResetPassword() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const updatePassword = useAuthStore((s) => s.updatePassword);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (password !== confirmPassword) {
      setError('Les mots de passe ne correspondent pas');
      return;
    }
    if (password.length < 6) {
      setError('Le mot de passe doit contenir au moins 6 caractères');
      return;
    }
    setLoading(true);
    try {
      await updatePassword(password);
      setSuccess(true);
      setTimeout(() => navigate('/dashboard'), 2000);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Erreur lors de la mise à jour';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-jarvis-600">JARVIS OS</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-2">Nouveau mot de passe</p>
        </div>
        <form onSubmit={handleSubmit} className="card space-y-4">
          <h2 className="text-xl font-semibold text-center">Réinitialiser le mot de passe</h2>
          {error && (
            <div className="bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 p-3 rounded-lg text-sm">{error}</div>
          )}
          {success && (
            <div className="bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-400 p-3 rounded-lg text-sm">
              Mot de passe mis à jour avec succès ! Redirection...
            </div>
          )}
          {!success && (
            <>
              <div>
                <label className="block text-sm font-medium mb-1">Nouveau mot de passe</label>
                <input type="password" className="input" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Confirmez le mot de passe</label>
                <input type="password" className="input" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required minLength={6} />
              </div>
              <button type="submit" className="btn-primary w-full" disabled={loading}>
                {loading ? 'Mise à jour...' : 'Mettre à jour le mot de passe'}
              </button>
            </>
          )}
        </form>
      </div>
    </div>
  );
}
