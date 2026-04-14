import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const resetPassword = useAuthStore((s) => s.resetPassword);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await resetPassword(email);
      setSuccess(true);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Erreur lors de l\'envoi';
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
          <p className="text-gray-500 dark:text-gray-400 mt-2">Réinitialisation du mot de passe</p>
        </div>
        <div className="card space-y-4">
          <h2 className="text-xl font-semibold text-center">Mot de passe oublié</h2>
          {success ? (
            <>
              <div className="bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-400 p-3 rounded-lg text-sm">
                Un e-mail de réinitialisation a été envoyé à <strong>{email}</strong>. Vérifiez votre boîte de réception.
              </div>
              <Link to="/login" className="btn-primary w-full block text-center">
                Retour à la connexion
              </Link>
            </>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 p-3 rounded-lg text-sm">{error}</div>
              )}
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Entrez votre adresse e-mail et nous vous enverrons un lien pour réinitialiser votre mot de passe.
              </p>
              <div>
                <label className="block text-sm font-medium mb-1">E-mail</label>
                <input type="email" className="input" value={email} onChange={(e) => setEmail(e.target.value)} required />
              </div>
              <button type="submit" className="btn-primary w-full" disabled={loading}>
                {loading ? 'Envoi en cours...' : 'Envoyer le lien'}
              </button>
              <p className="text-center text-sm text-gray-500">
                <Link to="/login" className="text-jarvis-600 hover:underline">Retour à la connexion</Link>
              </p>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
