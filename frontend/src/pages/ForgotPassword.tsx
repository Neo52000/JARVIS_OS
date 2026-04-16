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
    <div className="min-h-screen flex items-center justify-center px-4" style={{ background: '#0a0e17' }}>
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-orbitron font-black text-[#00f0ff] tracking-[4px]" style={{ textShadow: '0 0 30px rgba(0,240,255,0.5)' }}>JARVIS</h1>
          <p className="text-[#7a8ba0] mt-2 uppercase tracking-wider text-sm">Reinitialisation du mot de passe</p>
        </div>
        <div className="card space-y-4">
          <h2 className="text-lg font-orbitron font-bold text-[#00f0ff] text-center uppercase tracking-wider">Mot de passe oublie</h2>
          {success ? (
            <>
              <div className="p-3 rounded-sm text-sm" style={{ background: 'rgba(0,230,118,0.1)', border: '1px solid rgba(0,230,118,0.3)', color: '#00e676' }}>
                Un e-mail de reinitialisation a ete envoye a <strong>{email}</strong>. Verifiez votre boite de reception.
              </div>
              <Link to="/login" className="btn-primary w-full block text-center">
                Retour a la connexion
              </Link>
            </>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="p-3 rounded-sm text-sm" style={{ background: 'rgba(255,56,96,0.1)', border: '1px solid rgba(255,56,96,0.3)', color: '#ff3860' }}>{error}</div>
              )}
              <p className="text-sm text-[#7a8ba0]">
                Entrez votre adresse e-mail et nous vous enverrons un lien pour reinitialiser votre mot de passe.
              </p>
              <div>
                <label className="block text-xs font-semibold text-[#7a8ba0] mb-1 uppercase tracking-wider">E-mail</label>
                <input type="email" className="input" value={email} onChange={(e) => setEmail(e.target.value)} required />
              </div>
              <button type="submit" className="btn-primary w-full" disabled={loading}>
                {loading ? 'Envoi en cours...' : 'Envoyer le lien'}
              </button>
              <p className="text-center text-sm text-[#7a8ba0]">
                <Link to="/login" className="text-[#00f0ff] hover:underline">Retour a la connexion</Link>
              </p>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
